/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import type { TOAuthConfigs } from "@plane/types";
import { API_BASE_URL } from "@plane/constants";
import { useSearchParams } from "next/navigation";
import { useInstance } from "@/hooks/store/use-instance";

export const useExtendedOAuthConfig = (oauthActionText: string): TOAuthConfigs => {
  const { config } = useInstance();
  const searchParams = useSearchParams();
  const enabled = config?.is_techyst_oidc_enabled === true;
  return {
    isOAuthEnabled: enabled,
    oAuthOptions: [{
      id: "techyst",
      text: `${oauthActionText} with Flyst`,
      icon: <span aria-hidden="true" style={{ color: "#40a8d9", fontWeight: 700 }}>Z</span>,
      enabled,
      onClick: () => {
        const next = searchParams.get("next_path");
        window.location.assign(`${API_BASE_URL}/auth/oidc/${next ? `?next_path=${encodeURIComponent(next)}` : ""}`);
      },
    }],
  };
};
