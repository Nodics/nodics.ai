/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/config/properties @description Provides light eWaste preset-pack metadata while keeping preset values in data records. @layer config @owner eWaste @override Partner modules may enable or disable this pack and add project data separately. */
module.exports = {
    eWaste: {
        presetPack: {
            code: 'EWASTE_CORE_PRESETS',
            enabled: true,
            targetModule: 'nodics.waste'
        }
    }
};
