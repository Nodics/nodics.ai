/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/data/permissions @description Owner permission definitions; Profile owns assignments. @owner wasteCarbon @layer data */
module.exports = {
    "record0": {
        "code": "carbon.holdings.read",
        "name": "carbon.holdings.read",
        "active": true,
        "ownerModule": "wasteCarbon"
    },
    "record1": {
        "code": "carbon.evidence.record",
        "name": "carbon.evidence.record",
        "active": true,
        "ownerModule": "wasteCarbon"
    },
    "record2": {
        "code": "carbon.holdings.reserve",
        "name": "carbon.holdings.reserve",
        "active": true,
        "ownerModule": "wasteCarbon"
    },
    "record3": {
        "code": "carbon.holdings.transfer",
        "name": "carbon.holdings.transfer",
        "active": true,
        "ownerModule": "wasteCarbon"
    },
    "record4": {
        "code": "carbon.holdings.release",
        "name": "carbon.holdings.release",
        "active": true,
        "ownerModule": "wasteCarbon"
    }
};
