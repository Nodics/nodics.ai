/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/loyaltyEnterpriseRoleBaseline @description Checks bounded source role composition through the participant admission owner. @owner loyaltyWallet @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const groups = Object.assign({}, ...["loyaltyEnterpriseParticipationGroupData", "loyaltyWalletParticipantReadGroupData", "loyaltyWalletParticipantTransactionGroupData"].map(file =>
  Object.fromEntries(Object.values(require("../data/init-v001/records/identity/" + file)).map(row => [row.code,row]))));
const permissions = Object.values(groups).flatMap(group => group.permissions);
test("internal capability groups cover settings and conversion without a task-specific role, customer ancestry or funding", () => {
  assert.deepEqual([...permissions].sort(), ["loyalty.partnerConversion.execute", "loyalty.partnerConversion.read", "loyalty.rewards.transfer", "loyalty.transfers.manage", "loyalty.wallet.read"]);
  assert.deepEqual(groups.loyaltyEnterprisePartnerConversionUserGroup.permissions,
    ["loyalty.partnerConversion.read", "loyalty.partnerConversion.execute"]);
  for (const group of Object.values(groups)) assert.deepEqual(group.parentGroups, []);
});
test("composed role still requires current own-Enterprise scope and rejects DENY and alias drift", async t => {
  const saved = global.SERVICE; t.after(() => { global.SERVICE = saved; });
  let allowed = [...permissions], denied = false;
  global.SERVICE = {
    DefaultLoyaltyRewardOperationService:{fail:() => { throw Error("not authorized"); }},
    DefaultSecuredRequestPipelineService:{getGrantedPermissions:() => allowed, isPermissionGranted:(p, granted) => granted.includes(p)}
  };
  const scope = {scopeType:"ENTERPRISE",scopeCode:"enterprise",tenantCode:"tenant",capabilityCode:"loyaltyWallet"};
  const owner = {...participant, profile:async () => ({principalCode:"human",scopes:[scope],deniedScopes:denied?[scope]:[]})};
  const request = {tenant:"tenant",authorization:"Bearer original",authData:{tenant:"tenant",entCode:"enterprise",loginId:"human",principalType:"human",tokenType:"access"}};
  for (const permission of permissions) assert.equal((await owner.resolve(request,permission)).ownerCode,"enterprise");
  denied = true; await assert.rejects(owner.resolve(request,"loyalty.transfers.manage"));
  denied = false; allowed = allowed.filter(p => p !== "loyalty.transfers.manage");
  await assert.rejects(owner.resolve(request,"loyalty.transfers.manage"));
  allowed = permissions;
  for (const permission of ["loyalty.partnerConversion.read", "loyalty.partnerConversion.execute"]) {
    denied = true; await assert.rejects(owner.resolve(request, permission)); denied = false;
    allowed = permissions.filter(p => p !== permission); await assert.rejects(owner.resolve(request, permission));
    allowed = permissions;
    await assert.rejects(owner.resolve({...request, authData:{...request.authData, enterpriseCode:"foreign"}}, permission));
  }
  await assert.rejects(owner.resolve({...request,enterpriseCode:"foreign"},"loyalty.transfers.manage"));
  await assert.rejects(owner.resolve({...request,authData:{...request.authData,enterpriseCode:"foreign"}},"loyalty.transfers.manage"));
});
