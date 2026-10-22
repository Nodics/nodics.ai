/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/data/permissions @description Owner permission definitions; Profile owns assignments. @owner wasteReward @layer data */
module.exports = {
    "record0": {
        "code": "waste.materialValue.assess",
        "name": "waste.materialValue.assess",
        "active": true,
        "ownerModule": "wasteReward"
    },
    "record1": {
        "code": "waste.materialValue.release",
        "name": "waste.materialValue.release",
        "active": true,
        "ownerModule": "wasteReward"
    },
    "record2": {
        "code": "waste.materialValue.read",
        "name": "waste.materialValue.read",
        "active": true,
        "ownerModule": "wasteReward"
    }
};
