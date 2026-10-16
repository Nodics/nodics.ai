/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/test/helpers/orderBusinessAccessFixture @description Real security owners and persisted group contributions for isolated lifecycle tests. @layer test @owner order */
const root = '../../../../../../../';
const security = require(root + 'nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const identity = require(root + 'nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService');
const properties = require(root + 'nodics.foundation/modules/nAuth/config/properties');
const utils = require(root + 'nodics.foundation/modules/nCommon/src/utils/utils');
const catalogue = require(root + 'nodics.platform/modules/profile/test/helpers/identityCatalogueFixture');
const business = require('../../src/service/defaultOrderBusinessAccessService');
const repository = require('../../src/service/defaultOrderLifecycleRepositoryService');
const groupRows = new Map(catalogue.records('UserGroup').concat(catalogue.records('BusinessAccessGroup'))
    .map(row => [row.code, row]));

/** Hydrates actual owner group ancestry, failing on missing fixture contributions. */
function hydrate(code) {
    const row = groupRows.get(code);
    if (!row) throw new Error('Missing group fixture: ' + code);
    return { ...structuredClone(row), parentGroups: (row.parentGroups || []).map(hydrate) };
}

/** Models verified session claims using the real persisted group/permission flattening. */
function employeeAuth({ tenant = 'default', enterpriseCode = 'enterpriseX', actorId = 'operator-1',
    groupCode = 'orderBusinessEditUserGroup' } = {}) {
    const groups = [hydrate(groupCode)];
    return { tenant, entCode: enterpriseCode, principalId: actorId, principalType: 'human', tokenType: 'access',
        authVersion: 1, sessionId: 'order-test-session', jti: 'order-test-token',
        userGroups: security.getEffectiveUserGroupCodes(groups), userGroupPermissions: utils.getUserGroupPermissions(groups) };
}

/** Installs real authority services without replacing scenario-specific domain or persistence probes. */
function install() {
    const existingConfig = global.CONFIG;
    global.CONFIG = { get: key => key === 'identityGovernance' ? properties.identityGovernance : existingConfig?.get(key) };
    global.UTILS = { ...require('lodash'), ...utils };
    Object.assign(global.SERVICE, {
        DefaultOrderBusinessAccessService: business,
        DefaultIdentityGovernanceService: identity,
        DefaultSecuredRequestPipelineService: security,
    });
}

module.exports = { install, employeeAuth, hydrate, business, repository, security, identity };
