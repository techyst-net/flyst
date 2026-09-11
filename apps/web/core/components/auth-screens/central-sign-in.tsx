/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@plane/constants";
import { LogoSpinner } from "@/components/common/logo-spinner";
import { AuthBase } from "@/components/auth-screens/auth-base";
import { LandingPage } from "@/components/landing/landing-page";
import { EAuthModes } from "@/helpers/authentication.helper";
import { useInstance } from "@/hooks/store/use-instance";

/**
 * What an unauthenticated visitor sees at the app root.
 *
 * One domain serves both states: signed out gets the public landing page,
 * signed in goes straight to the workspace. There is no local sign-in form —
 * identity belongs to the Techyst account, and a second login surface would
 * only be a second place for it to drift.
 *
 * `redirectToSignIn` is for routes that are an explicit request to sign in
 * (/sign-up), where showing marketing copy instead would be obtuse.
 *
 * The local auth screen still renders in two cases, both to avoid a lockout:
 * central sign-in being disabled, and a provider error, where redirecting would
 * bounce the visitor into the provider that just rejected them.
 */
export function CentralSignIn({ redirectToSignIn = false }: { redirectToSignIn?: boolean }) {
  const { config } = useInstance();
  const searchParams = useSearchParams();

  const enabled = config?.is_techyst_oidc_enabled === true;
  const hasAuthError = Boolean(searchParams.get("error_code"));
  const shouldRedirect = enabled && !hasAuthError && redirectToSignIn;

  useEffect(() => {
    if (!shouldRedirect) return;
    const nextPath = searchParams.get("next_path");
    // `replace` keeps the redirect out of history, so Back does not land the
    // visitor on a page that immediately forwards them again.
    window.location.replace(
      `${API_BASE_URL}/auth/oidc/${nextPath ? `?next_path=${encodeURIComponent(nextPath)}` : ""}`
    );
  }, [shouldRedirect, searchParams]);

  // `config` is undefined until the instance call resolves. Waiting avoids
  // flashing one screen and replacing it with another a moment later.
  if (config === undefined || shouldRedirect) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LogoSpinner />
      </div>
    );
  }
  if (!enabled || hasAuthError) return <AuthBase authType={EAuthModes.SIGN_IN} />;
  return <LandingPage />;
}
