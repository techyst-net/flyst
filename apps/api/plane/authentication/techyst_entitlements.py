"""Fail-closed subscription checks for Plane's authenticated application API."""
import hashlib
import os

import requests
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


def check_entitlement(issuer, subject):
    key = "techyst:access:" + hashlib.sha256(f"{issuer}\0{subject}".encode()).hexdigest()
    cached = cache.get(key)
    if cached is not None:
        return cached is True
    origin = os.environ.get("TECHYST_BILLING_INTERNAL_URL", "").rstrip("/")
    secret = os.environ.get("TECHYST_ENTITLEMENT_API_KEY", "")
    if not origin or not secret:
        return False
    try:
        response = requests.get(origin + "/api/entitlements/", params={"issuer": issuer, "subject": subject, "product": "plane"},
                                headers={"Authorization": f"Bearer {secret}"}, timeout=5, allow_redirects=False)
        response.raise_for_status()
        allowed = response.json().get("allowed") is True
        # Cancellation propagates in at most 30 seconds. Denials are short-lived
        # so users can open Plane soon after their payment webhook arrives.
        cache.set(key, allowed, 30 if allowed else 2)
        return allowed
    except (requests.RequestException, ValueError):
        return False


class CentralSubscriptionMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        if os.environ.get("TECHYST_BILLING_REQUIRED") != "1":
            return None
        # Instance administration and public published boards retain their own
        # authorization. App APIs require a centrally entitled identity.
        if not request.path.startswith("/api/") or request.path.startswith(("/api/instances/", "/api/public/")):
            return None
        if not request.user.is_authenticated:
            return None  # Plane's normal authentication rejects private requests.
        from plane.db.models import Account
        identity = Account.objects.filter(user=request.user, provider="techyst_oidc").first()
        issuer = identity.metadata.get("issuer") if identity else None
        subject = identity.metadata.get("subject") if identity else None
        if not issuer or not subject or not check_entitlement(issuer, subject):
            return JsonResponse({"error": "subscription_required", "billing_url": os.environ.get("TECHYST_BILLING_URL", "") + "/account/"}, status=402)
        return None


def enforce_api_entitlement(user):
    if os.environ.get("TECHYST_BILLING_REQUIRED") != "1":
        return
    from plane.db.models import Account
    from rest_framework.exceptions import APIException
    identity = Account.objects.filter(user=user, provider="techyst_oidc").first()
    if not identity or not check_entitlement(identity.metadata.get("issuer", ""), identity.metadata.get("subject", "")):
        error = APIException("An active Projects subscription is required.", code="subscription_required")
        error.status_code = 402
        raise error
