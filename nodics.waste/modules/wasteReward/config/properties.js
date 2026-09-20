/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/config/properties @description Configurable defaults for Waste reward assessment persistence. @layer config @owner wasteReward */
module.exports = {
    localResetProvider: {
        contributions: {
            wasteReward: {
                serviceNames: {
                    DefaultWasteRewardAssessmentService: true
                }
            }
        }
    }
};
