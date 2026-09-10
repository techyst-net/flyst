/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/** Mark plus wordmark, the horizontal lockup. */
export function PlaneLockup({ width = "253", height = "53", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 253 53"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(0 -3) scale(0.9)">
        <path d="M18 18 H46 V26 L31 38 H46 V46 H18 V38 L33 26 H18 Z" fill={color} />
      </g>
      <text
        x="62"
        y="37"
        fontFamily="Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif"
        fontSize="34"
        fontWeight="600"
        letterSpacing="-1"
        fill={color}
      >
        Zeshan
      </text>
    </svg>
  );
}
