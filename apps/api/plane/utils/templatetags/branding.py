"""Template tags for branding assets in transactional email.

Mail clients cannot resolve relative URLs, so every image in an email template
needs an absolute one on a host we control. Upstream hard-coded a vendor CDN;
this resolves the deployment's own origin instead.

`plane.utils` is an installed app, so Django discovers this library
automatically. Usage:

    {% load branding %}
    <img src="{% brand_logo_url %}" />
"""

from django import template
from django.conf import settings

register = template.Library()

LOGO_PATH = "/static/logos/Logo.png"


@register.simple_tag
def brand_logo_url():
    """Absolute URL of the brand wordmark served by this deployment.

    Falls back to a relative path only when WEB_URL is unset, which is a
    misconfiguration — email images will not render until it is set.
    """
    base = (getattr(settings, "WEB_URL", None) or "").rstrip("/")
    return f"{base}{LOGO_PATH}" if base else LOGO_PATH
