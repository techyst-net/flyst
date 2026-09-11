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
import { EAuthModes } from "@/helpers/authentication.helper";
import { useInstance } from "@/hooks/store/use-instance";

/**
 * Sends an unauthenticated visitor straight to central sign-in instead of
 * showing a sign-in screen here. Identity belongs to the Techyst account, so a
 * second login surface would only be a second place for it to drift.
 *
 * Two cases deliberately still render the local screen:
 *
 *  - central sign-in is disabled, which would otherwise leave an instance with
 *    no way in at all;
 *  - the provider sent the visitor back with an error, where redirecting would
 *    bounce them into the provider that just rejected them and hide the reason.
 */
export function CentralSignIn() {
  const { config } = useInstance();
  const searchParams = useSearchParams();

  const enabled = config?.is_techyst_oidc_enabled === true;
  const hasAuthError = Boolean(searchParams.get("error_code"));
  const shouldRedirect = enabled && !hasAuthError;

  useEffect(() => {
    if (!shouldRedirect) return;
    const nextPath = searchParams.get("next_path");
    // `replace` keeps the redirect out of history, so Back does not land the
    // visitor on a page that immediately forwards them again.
    window.location.replace(
      `${API_BASE_URL}/auth/oidc/${nextPath ? `?next_path=${encodeURIComponent(nextPath)}` : ""}`
    );
  }, [shouldRedirect, searchParams]);

  // `config` is undefined until the instance call resolves; showing the spinner
  // until then avoids flashing a sign-in screen we are about to navigate away from.
  if (config === undefined || shouldRedirect) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LogoSpinner />
      </div>
    );
  }
  return <AuthBase authType={EAuthModes.SIGN_IN} />;
}
