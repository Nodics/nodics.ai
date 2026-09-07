/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/data/core-v001/records/profile/wasteCoreEnterpriseCoreData @description Waste enterprise reference records contributed to Profile. @layer data @owner wasteCore */
module.exports = {
    record0: {
        code: 'NODICS_WASTE_MANAGEMENT_CO',
        name: 'Nodics Waste Management Co.',
        active: true,
        description: 'Waste management program operator for Nodics Waste demo and reference data.',
        tenant: 'default:true',
        roleCodes: ['PROGRAM_OPERATOR', 'SERVICE_PROVIDER'],
        capabilityScopes: [{
            moduleName: 'wasteCore',
            roleCode: 'PROGRAM_OPERATOR',
            scopeCode: 'WASTE_MANAGEMENT'
        }, {
            moduleName: 'wasteCore',
            roleCode: 'SERVICE_PROVIDER',
            scopeCode: 'COLLECTION_CENTRE_OPERATION'
        }],
        addresses: [],
        contacts: []
    },
    record1: {
        code: 'BEAH_RECYCLING_SERVICES',
        name: 'BEAH Recycling Services',
        active: true,
        description: 'Reference recycling partner and infrastructure owner for Waste collection-network demonstrations.',
        tenant: 'default:true',
        roleCodes: ['SERVICE_PROVIDER', 'ASSET_OWNER', 'BUSINESS_PARTNER'],
        capabilityScopes: [{
            moduleName: 'wasteCore',
            roleCode: 'SERVICE_PROVIDER',
            scopeCode: 'RECYCLING_SERVICE_OPERATION'
        }, {
            moduleName: 'wasteCore',
            roleCode: 'ASSET_OWNER',
            scopeCode: 'COLLECTION_BIN_OWNERSHIP'
        }, {
            moduleName: 'wasteCore',
            roleCode: 'BUSINESS_PARTNER',
            scopeCode: 'WASTE_MANAGEMENT_PARTNERSHIP'
        }],
        addresses: [],
        contacts: []
    }
};
