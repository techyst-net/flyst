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
      icon: (
        // The Flyst mark. Geometry matches .brand/marks.py; the dot is the
        // family signature and keeps its colour in every theme.
        <svg viewBox="0 0 64 64" width={18} height={18} fill="none" aria-hidden="true">
          <path
            d="M8,52 L8,12 L38,12"
            stroke="#40A8D9"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8,32 L32,32" stroke="#40A8D9" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="18" r="7" fill="#E77129" />
        </svg>
      ),
      enabled,
      onClick: () => {
        const next = searchParams.get("next_path");
        window.location.assign(`${API_BASE_URL}/auth/oidc/${next ? `?next_path=${encodeURIComponent(next)}` : ""}`);
      },
    }],
  };
};
