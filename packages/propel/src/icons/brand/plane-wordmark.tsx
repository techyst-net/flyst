/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/** Wordmark only, no mark. */
export function PlaneWordmark({ width = "146", height = "44", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 146 44"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="32"
        fontFamily="Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif"
        fontSize="32"
        fontWeight="600"
        letterSpacing="-1"
        fill={color}
      >
        Flyst
      </text>
    </svg>
  );
}
