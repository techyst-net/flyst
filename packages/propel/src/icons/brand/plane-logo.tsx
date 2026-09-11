/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/** Brand mark. Component name, props and viewBox are unchanged so every
 *  existing call site keeps its layout; only the artwork is ours. */
export function PlaneLogo({ width = "85", height = "52", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 85 52"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(16.5 0) scale(0.8125)">
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
    </svg>
  );
}
