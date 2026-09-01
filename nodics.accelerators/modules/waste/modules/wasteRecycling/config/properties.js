/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteRecycling/config/properties @description Provides lightweight recycling accelerator metadata while provider settings remain project-owned. @layer config @owner wasteRecycling */
module.exports = {
    wasteRecycling: {
        contractPack: {
            code: 'WASTE_RECYCLING_HANDOFF_CONTRACTS',
            enabled: true,
            targetModule: 'nodics.waste'
        }
    }
};
