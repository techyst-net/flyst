/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

const planeTheme = create({
  base: "dark",
  brandTitle: "Flyst UI",
  brandUrl: "https://flyst.techyst.net",
  brandImage: "plane-lockup-light.svg",
  brandTarget: "_self",
});

addons.setConfig({
  theme: planeTheme,
});
