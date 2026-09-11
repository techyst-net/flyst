"""Explicit administrator-controlled mapping of an existing Plane account."""
import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from plane.authentication.views.app.oidc import identity_key
from plane.db.models import Account, User


class Command(BaseCommand):
    help = "Link an existing Plane user to a verified Keycloak subject after checking ownership."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--subject", required=True, help="Immutable user ID from the configured Keycloak realm")

    @transaction.atomic
    def handle(self, *args, **options):
        issuer = os.environ.get("TECHYST_OIDC_ISSUER", "").rstrip("/")
        if not issuer.startswith("https://"):
            raise CommandError("TECHYST_OIDC_ISSUER must be configured first.")
        user = User.objects.select_for_update().filter(email=options["email"].strip().lower()).first()
        if not user or not user.is_active or user.is_bot:
            raise CommandError("An active, non-bot Plane account with that email is required.")
        key = identity_key(issuer, options["subject"])
        if Account.objects.filter(user=user, provider="techyst_oidc").exclude(provider_account_id=key).exists():
            raise CommandError("This user is already linked to another central identity.")
        account, _ = Account.objects.get_or_create(provider="techyst_oidc", provider_account_id=key,
            defaults={"user": user, "access_token": "", "metadata": {"issuer": issuer, "subject": options["subject"]}})
        if account.user_id != user.pk:
            raise CommandError("That central identity is already linked to a different Plane user.")
        self.stdout.write(self.style.SUCCESS("Central identity linked. Workspace permissions are unchanged."))
