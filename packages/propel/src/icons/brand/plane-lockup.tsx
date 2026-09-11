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
        <path
          d="M8.00,52.00 L8.00,12.00 L38.00,12.00"
          fill="none"
          stroke={color}
          strokeWidth="11.00"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.00,32.00 L32.00,32.00"
          fill="none"
          stroke={color}
          strokeWidth="11.00"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="52.00" cy="18.00" r="7.00" fill="#E77129" />
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
        Flyst
      </text>
    </svg>
  );
}
