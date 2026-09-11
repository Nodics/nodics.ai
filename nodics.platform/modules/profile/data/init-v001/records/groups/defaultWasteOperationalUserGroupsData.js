/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/data/defaultWasteOperationalUserGroupsData @description Materializes granular Waste operator groups from the canonical nAuth identity-governance targets. @layer data @owner profile @override Projects assign these groups through Profile without copying their permissions. */
const targets = require("../../../../../../../nodics.foundation/modules/nAuth/config/properties").identityGovernance.migration.groupTargets;
const codes = ["axisOperationalUserGroup", "wasteEnterpriseAdministratorUserGroup", "wasteCentreOperatorUserGroup", "wasteVerifierUserGroup", "wasteApproverUserGroup", "wasteCouponManagerUserGroup", "wasteMarketplaceModeratorUserGroup", "wasteAuditorUserGroup"];
module.exports = Object.fromEntries(codes.map((code, index) => ["record"+index, {code, name:code, active:true, parentGroups:targets[code].parentGroups, permissions:targets[code].permissions}]));
