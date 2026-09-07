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
        <path d="M18 18 H46 V26 L31 38 H46 V46 H18 V38 L33 26 H18 Z" fill={color} />
      </g>
    </svg>
  );
}
