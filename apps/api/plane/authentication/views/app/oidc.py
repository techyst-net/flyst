"""Central Techyst sign-in using authorization code, PKCE, state and nonce."""
import hashlib
import logging
import os
from urllib.parse import urljoin

from authlib.integrations.django_client import OAuth
from django.db import transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.views import View

from plane.authentication.adapter.oauth import OauthAdapter
from plane.authentication.utils.host import base_host
from plane.authentication.utils.login import user_login
from plane.authentication.utils.redirection_path import get_redirection_path
from plane.authentication.utils.user_auth_workflow import post_user_auth_workflow
from plane.db.models import Account, User
from plane.utils.path_validator import validate_next_path


def oidc_client():
    issuer = os.environ.get("TECHYST_OIDC_ISSUER", "").rstrip("/")
    if not issuer.startswith("https://") or not os.environ.get("TECHYST_OIDC_CLIENT_SECRET"):
        raise ValueError("Central sign-in is not configured")
    return OAuth().register(
        "techyst", client_id=os.environ.get("TECHYST_OIDC_CLIENT_ID", "techyst-plane"),
        client_secret=os.environ["TECHYST_OIDC_CLIENT_SECRET"],
        server_metadata_url=issuer + "/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile", "code_challenge_method": "S256", "timeout": 10},
    )


def identity_key(issuer, subject):
    return hashlib.sha256(f"{issuer}\0{subject}".encode()).hexdigest()


class CentralIdentityAdapter(OauthAdapter):
    def __init__(self, request, claims):
        super().__init__(request, "techyst_oidc", "", "", "", "", "", "", callback=post_user_auth_workflow)
        self.claims = claims
        self.user_data = {"email": claims["email"].strip().lower(), "user": {
            "provider_id": identity_key(claims["iss"], claims["sub"]),
            "first_name": claims.get("given_name", ""), "last_name": claims.get("family_name", ""),
            "is_password_autoset": True,
        }}
        # Plane does not need persistent provider tokens after sign-in.
        self.token_data = {"access_token": ""}

    def create_update_account(self, user):
        # Keep failures inside the surrounding transaction; never silently log a
        # user in without a durable binding to the provider's immutable subject.
        account, _ = Account.objects.get_or_create(
            provider=self.provider, provider_account_id=self.user_data["user"]["provider_id"],
            defaults={"user": user, "access_token": "", "metadata": {
                "issuer": self.claims["iss"], "subject": self.claims["sub"],
            }},
        )
        if account.user_id != user.pk:
            raise ValueError("Identity is already linked")


class OIDCInitiateEndpoint(View):
    def get(self, request):
        try:
            request.session["techyst_next"] = str(validate_next_path(request.GET.get("next_path") or "/"))
            return oidc_client().authorize_redirect(request, os.environ["TECHYST_OIDC_CALLBACK_URL"])
        except Exception as exc:
            logging.getLogger("plane.authentication").warning("Central sign-in initiation failed (%s)", type(exc).__name__)
            return HttpResponse("Central sign-in is not available yet. Please try again later.", status=503)


class OIDCCallbackEndpoint(View):
    def get(self, request):
        try:
            token = oidc_client().authorize_access_token(request)
            claims = token.get("userinfo", {})
            issuer = os.environ["TECHYST_OIDC_ISSUER"].rstrip("/")
            if claims.get("iss") != issuer or not claims.get("sub") or claims.get("email_verified") is not True:
                raise ValueError("Verified identity required")
            if not claims.get("email"):
                raise ValueError("Email required")
            with transaction.atomic():
                adapter = CentralIdentityAdapter(request, claims)
                account = Account.objects.select_for_update().filter(
                    provider="techyst_oidc", provider_account_id=identity_key(issuer, claims["sub"]),
                ).select_related("user").first()
                if account:
                    # Identity is anchored to issuer/subject, even if email changes.
                    adapter.user_data["email"] = account.user.email
                elif User.objects.filter(email=claims["email"].strip().lower()).exists():
                    return HttpResponse("An existing Projects account uses this email. Contact your administrator to link it to central sign-in.", status=409)
                user = adapter.complete_login_or_signup()
            user_login(request=request, user=user, is_app=True)
            request.session["techyst_subject"] = claims["sub"]
            request.session["techyst_issuer"] = issuer
            next_path = request.session.pop("techyst_next", "/")
            if os.environ.get("TECHYST_BILLING_REQUIRED") == "1":
                from plane.authentication.techyst_entitlements import check_entitlement
                if not check_entitlement(issuer, claims["sub"]):
                    return HttpResponseRedirect(os.environ["TECHYST_BILLING_URL"] + "/account/")
            path = str(validate_next_path(next_path)) if next_path != "/" else get_redirection_path(user=user)
            return HttpResponseRedirect(urljoin(base_host(request=request, is_app=True).rstrip("/") + "/", path))
        except Exception as exc:
            logging.getLogger("plane.authentication").warning("Central sign-in callback failed (%s)", type(exc).__name__)
            return HttpResponse("Sign-in could not be completed. Return to Projects and try again.", status=400)
