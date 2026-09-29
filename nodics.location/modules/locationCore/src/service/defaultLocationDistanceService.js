/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module locationCore/service/defaultLocationDistanceService @description Pure direct distance for validated latitude/longitude observations. @layer service @owner locationCore @override Callers may adapt their distance hook without requiring a Location runtime. */
module.exports = {
  /** Returns unrounded spherical distance in metres; this performs no persistence or remote service access. */
  distance: function (a, b) {
    const rad = Math.PI / 180;
    const h =
      Math.sin(((b.latitude - a.latitude) * rad) / 2) ** 2 +
      Math.cos(a.latitude * rad) *
        Math.cos(b.latitude * rad) *
        Math.sin(((b.longitude - a.longitude) * rad) / 2) ** 2;
    return (
      6371000 *
      2 *
      Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)))
    );
  },
};
