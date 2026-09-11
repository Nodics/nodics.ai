/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wasteVerification/test/wasteOperationalRolesContract @description Proves centre scopes, role separation, immutable verified facts, audit-only access and side-effect-free denials through real authorization and review services. @layer test @owner wasteVerification */
const test = require("node:test"),
  assert = require("node:assert/strict");
const access = require("../../wasteCore/src/service/defaultWasteOperationalAccessService");
const verification = require("../src/service/defaultWasteVerificationOperationService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const identity =
  require("../../../../nodics.foundation/modules/nAuth/config/properties").identityGovernance;
const scopeAuthority = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultPrincipalScopeGovernanceService");
const scopePolicy =
  require("../../../../nodics.platform/modules/profile/config/properties").principalAuthorizationScopes;
let records, writes, events, scopeResponses, remoteReads;
/** Establishes the already-claimed precondition for role/decision tests; assignment lifecycle is tested separately. */
function assignedRequest(login = "verifier", changes = {}) {
  const record = records.get("wasteSubmission:" + changes.code);
  if (record) record.metadata.reviewAssignment = { type: "EMPLOYEE", principalCode: login };
  return request(login, changes);
}
const roles = {
  verifier: "wasteVerifierUserGroup",
  approver: "wasteApproverUserGroup",
  auditor: "wasteAuditorUserGroup",
  operator: "wasteCentreOperatorUserGroup",
  administrator: "adminGroup",
  combined: ["wasteVerifierUserGroup", "wasteApproverUserGroup"],
};
function request(login = "verifier", changes = {}) {
  return {
    tenant: "default",
    idempotencyKey: "review-contract-command",
    authorization: "Bearer " + login,
    authData: {
      tokenType: "access",
      principalType: "human",
      tenant: "default",
      entCode: "default",
      loginId: login,
      userGroups: [roles[login]].flat(),
    },
    ...changes,
  };
}
function scope(
  login,
  type = "BUSINESS_UNIT",
  code = "centre-a",
  effect = "ALLOW",
) {
  return {
    principalType: "human",
    principalCode: login,
    scopeType: type,
    scopeCode: code,
    effect,
    status: "ACTIVE",
    inheritanceMode: "DIRECT",
    tenantCode: "default",
    enterpriseCode: "default",
    capabilityCode: "waste",
  };
}
function submission(code, point = "centre-a") {
  return {
    code,
    revision: 1,
    submissionStatus: "SUBMITTED",
    preferredCollectionPointCode: point,
    confirmedFacts: {
      name: "Device",
      itemTypeCode: "PHONE",
      categoryCode: "MOBILE",
      quantity: 1,
      preferredCollectionPointCode: point,
    },
    metadata: {},
    submitterRef: { code: "customer" },
  };
}
test.beforeEach(() => {
  records = new Map(
    ["a", "b"].map((code) => [
      "wasteSubmission:" + code,
      submission(code, "centre-" + code),
    ]),
  );
  writes = [];
  events = [];
  remoteReads = 0;
  scopeResponses = Object.fromEntries(
    Object.keys(roles).map((login) => [login, [scope(login)]]),
  );
  global.CONFIG = {
    get: (key) =>
      ({
        identityGovernance: identity,
        principalAuthorizationScopes: scopePolicy,
        waste: {
          operations: {
            requireScopes: true,
            requireVerification: true,
            requireDifferentApprover: true,
          },
        },
      })[key],
  };
  const fail = (code, message) => {
    const error = new Error(message);
    error.code = code;
    throw error;
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultWasteItemDescriptorService: require("../../wasteMaterial/src/service/defaultWasteItemDescriptorService"),
    DefaultSecuredRequestPipelineService: router,
    DefaultWasteOperationalAccessService: access,
    DefaultWasteReviewWorkspaceService: require("../src/service/defaultWasteReviewWorkspaceService"),
    DefaultAuthAuditService: { record: async (event) => events.push(event) },
    DefaultModuleService: {
      invokeModule: async (descriptor) => {
        remoteReads++;
        assert.equal(descriptor.apiName, "/identity/scopes/me");
        assert.equal(descriptor.requestBody, undefined);
        const login = descriptor.header.Authorization.slice(7);
        return {
          data: scopeAuthority.resolveAssignments(
            request(login).authData,
            scopeResponses[login],
          ),
        };
      },
    },
    DefaultWasteSubmissionOperationService: {
      facts:
        require("../../wasteSubmission/src/service/defaultWasteSubmissionOperationService")
          .facts,
      store: () => SERVICE.DefaultWastePersistenceService,
    },
    DefaultWastePersistenceService: {
      fail,
      revision: (record, expected) => {
        if (record.revision !== expected)
          fail("ERR_WASTE_REVISION_CONFLICT", "Revision conflict");
      },
      one: async (schema, req, code) =>
        structuredClone(records.get(schema + ":" + code)),
      list: async (schema) =>
        schema === "wasteCollectionPoint"
          ? ["a", "b"].map((code) => ({
              code: "centre-" + code,
              operatorEnterpriseRef: { code: "default" },
            }))
          : [...records.entries()]
              .filter(([key]) => key.startsWith(schema + ":"))
              .map(([, value]) => structuredClone(value)),
      create: async (schema, req, model) => {
        writes.push({ schema, model });
        records.set(schema + ":" + model.code, structuredClone(model));
        return structuredClone(model);
      },
      update: async (schema, req, current, changes) => {
        const next = { ...current, ...changes, revision: current.revision + 1 };
        writes.push({ schema, model: next });
        records.set(schema + ":" + current.code, structuredClone(next));
        return next;
      },
    },
  };
});
test.afterEach(() => {
  delete global.CONFIG;
  delete global.SERVICE;
  delete global.CLASSES;
});
test("queue is centre-scoped and Profile is consulted only once per request", async () => {
  const req = request();
  assert.deepEqual(
    (await verification.queue(req)).map((record) => record.code),
    ["a"],
  );
  await access.context(req);
  assert.equal(remoteReads, 1);
});
test("out-of-scope verification is denied and audited before any write", async () => {
  await assert.rejects(
    verification.verify(
      assignedRequest("verifier", {
        code: "b",
        confirmed: true,
        expectedRevision: 1,
        idempotencyKey: "verify:b:1",
        payload: { verifiedFacts: { name: "Tamper" } },
      }),
    ),
    { code: "ERR_WASTE_REVIEW_FORBIDDEN" },
  );
  assert.equal(writes.length, 0);
  assert.equal(events[0].outcome, "DENIED");
});
test("verifier saves evidence without issuing an asset or rewards, and cannot approve", async () => {
  const result = await verification.verify(
    assignedRequest("verifier", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify:a:1",
      payload: { verifiedFacts: { name: "Verified phone" } },
    }),
  );
  assert.equal(result.submission.metadata.verifiedFacts.name, "Verified phone");
  assert.deepEqual(
    writes.map((write) => write.schema),
    ["wasteVerification", "wasteSubmission"],
  );
  await assert.rejects(
    verification.review(
      assignedRequest("verifier", {
        code: "a",
        confirmed: true,
        expectedRevision: 2,
        payload: { decision: "APPROVED" },
      }),
    ),
    { code: "ERR_WASTE_REVIEW_FORBIDDEN" },
  );
});
test("explicit separation policy prevents same-person decisions and verified facts remain immutable", async () => {
  await verification.verify(
    assignedRequest("administrator", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify:a:2",
      payload: { verifiedFacts: { name: "Verified phone" } },
    }),
  );
  const count = writes.length;
  await assert.rejects(
    verification.review(
      assignedRequest("administrator", {
        code: "a",
        confirmed: true,
        expectedRevision: 2,
        payload: { decision: "REJECTED", reason: "Wrong device" },
      }),
    ),
    { code: "ERR_WASTE_SEPARATE_APPROVER_REQUIRED" },
  );
  await assert.rejects(
    verification.review(
      assignedRequest("approver", {
        code: "a",
        confirmed: true,
        expectedRevision: 2,
        payload: {
          decision: "REJECTED",
          reason: "Wrong device",
          verifiedFacts: { name: "Changed by approver" },
        },
      }),
    ),
    { code: "ERR_WASTE_VERIFIED_FACTS_IMMUTABLE" },
  );
  assert.equal(writes.length, count);
});
test("final rejection requires independent verification and a reason before mutation", async () => {
  await assert.rejects(
    verification.review(
      assignedRequest("approver", {
        code: "a",
        confirmed: true,
        expectedRevision: 1,
        payload: { decision: "REJECTED", reason: "Wrong device" },
      }),
    ),
    { code: "ERR_WASTE_VERIFICATION_REQUIRED" },
  );
  assert.equal(writes.length, 0);
  await verification.verify(
    assignedRequest("verifier", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify:a:3",
      payload: { verifiedFacts: { name: "Verified phone" } },
    }),
  );
  const count = writes.length;
  await assert.rejects(
    verification.review(
      assignedRequest("approver", {
        code: "a",
        confirmed: true,
        expectedRevision: 2,
        payload: { decision: "REJECTED" },
      }),
    ),
    { code: "ERR_WASTE_REVIEW_REASON_REQUIRED" },
  );
  assert.equal(writes.length, count);
  const result = await verification.review(
    assignedRequest("approver", {
      code: "a",
      confirmed: true,
      expectedRevision: 2,
      payload: { decision: "REJECTED", reason: "Unacceptable damage" },
    }),
  );
  assert.equal(result.submission.submissionStatus, "REJECTED");
  assert.equal(result.submission.metadata.approvedBy.code, "approver");
  assert.equal(result.submission.metadata.verifiedBy.code, "verifier");
});
test("auditor is read-only and explicit centre deny overrides enterprise allow", async () => {
  scopeResponses.auditor = [
    scope("auditor", "ENTERPRISE", "default"),
    scope("auditor", "BUSINESS_UNIT", "centre-b", "DENY"),
  ];
  assert.deepEqual(
    (await verification.audit(request("auditor"))).map((record) => record.code),
    ["a"],
  );
  await assert.rejects(
    access.authorize(request("auditor"), "waste.review.evidence.read"),
    { code: "ERR_WASTE_REVIEW_FORBIDDEN" },
  );
  await assert.rejects(verification.verify(assignedRequest("auditor", { code: "a" })), {
    code: "ERR_WASTE_REVIEW_FORBIDDEN",
  });
  assert.equal(writes.length, 0);
});

test("recorded decision rejects changed replay and recovers an interrupted write with its original command", async () => {
  await verification.verify(
    assignedRequest("verifier", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify-recovery",
      payload: { verifiedFacts: { name: "Verified phone" } },
    }),
  );
  const update = SERVICE.DefaultWastePersistenceService.update;
  let interrupt = true;
  SERVICE.DefaultWastePersistenceService.update = async (
    schema,
    req,
    current,
    changes,
  ) => {
    if (interrupt && changes.submissionStatus === "REJECTED") {
      interrupt = false;
      throw Error("interrupted final persistence");
    }
    return update(schema, req, current, changes);
  };
  const decision = assignedRequest("approver", {
    code: "a",
    confirmed: true,
    expectedRevision: 2,
    idempotencyKey: "review-recovery",
    payload: { decision: "REJECTED", reason: "Recorded feedback" },
  });
  await assert.rejects(verification.review(decision), /interrupted/);
  const current = records.get("wasteSubmission:a");
  assert.equal(current.submissionStatus, "UNDER_REVIEW");
  assert.equal(current.metadata.reviewDecision, "REJECTED");
  await assert.rejects(
    verification.review({
      ...decision,
      payload: { decision: "REJECTED", reason: "Changed feedback" },
    }),
    { code: "ERR_WASTE_REVIEW_CONFLICT" },
  );
  const result = await verification.recoverReview({
    ...decision,
    expectedRevision: current.revision,
  });
  assert.equal(result.submission.submissionStatus, "REJECTED");
  assert.equal(result.submission.metadata.publicReason, "Recorded feedback");
  const writesAfter = writes.length;
  await verification.review(decision);
  assert.equal(writes.length, writesAfter);
});

test("verified measured weight refreshes impact without changing the customer facts", async () => {
  records.set("wasteItemType:PHONE", {
    code: "PHONE",
    impactProfileCode: "impact",
  });
  records.set("wasteImpactProfile:impact", {
    code: "impact",
    status: "ACTIVE",
  });
  SERVICE.DefaultWasteImpactCalculationService = {
    calculate: async (input) => {
      assert.equal(Number(input.facts.weight), 2.5);
      assert.equal(input.facts.weightProvenance.basis, "OPERATOR_MEASURED");
      return {
        calculationStatus: "ESTIMATED",
        metrics: [{ code: "CARBON", value: 5 }],
      };
    },
  };
  const result = await verification.verify(
    assignedRequest("verifier", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify-measured",
      payload: { verifiedFacts: { weight: 2.5 } },
    }),
  );
  assert.equal(result.submission.metadata.verifiedEstimate.metrics[0].value, 5);
  assert.equal(result.submission.confirmedFacts.weight, undefined);
});
test("failed impact refresh replaces a previous estimate with explicit pending state", async () => {
  records.get("wasteSubmission:a").metadata.verifiedEstimate = {
    calculationStatus: "ESTIMATED",
    metrics: [{ value: 999 }],
  };
  records.set("wasteItemType:PHONE", {
    code: "PHONE",
    impactProfileCode: "impact",
  });
  records.set("wasteImpactProfile:impact", {
    code: "impact",
    status: "ACTIVE",
  });
  SERVICE.DefaultWasteImpactCalculationService = {
    calculate: async () => {
      throw Error("provider unavailable");
    },
  };
  const result = await verification.verify(
    assignedRequest("verifier", {
      code: "a",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "verify-pending",
      payload: { verifiedFacts: { weight: 1 } },
    }),
  );
  assert.equal(
    result.submission.metadata.verifiedEstimate.calculationStatus,
    "PENDING",
  );
  assert.equal(result.submission.metadata.verifiedEstimate.metrics, undefined);
});

for (const login of ["administrator", "combined"]) {
  test(`${login} can verify and approve the same submission with both permissions`, async () => {
    const get = CONFIG.get;
    CONFIG.get = key => key === "waste"
      ? { operations: { ...get(key).operations, requireDifferentApprover: false } }
      : get(key);
    records.set("wasteItemType:PHONE", { code: "PHONE", impactProfileCode: "impact" });
    records.set("wasteImpactProfile:impact", { code: "impact", status: "ACTIVE" });
    records.set("wasteAssetCreationPolicy:asset-policy", { code: "asset-policy", status: "ACTIVE" });
    SERVICE.DefaultWasteImpactCalculationService = { calculate: async () => ({ calculationStatus: "ESTIMATED", metrics: [] }) };
    SERVICE.DefaultWasteAssetCreationService = { createFromApprovedSubmission: () => ({ asset: { code: "asset-a" }, ownershipEvent: { code: "event-a" } }) };
    const availability = await access.describe(request(login));
    assert.equal(availability.canVerify, true);
    assert.equal(availability.canApprove, true);
    assert.equal(availability.requireDifferentApprover, false);
    await verification.verify(assignedRequest(login, {
      code: "a", confirmed: true, expectedRevision: 1,
      idempotencyKey: "verify-both-" + login,
      payload: { verifiedFacts: { name: "Verified phone" } },
    }));
    const result = await verification.review(assignedRequest(login, {
      code: "a", confirmed: true, expectedRevision: 2,
      assetCreationPolicyCode: "asset-policy", idempotencyKey: "approve-both-" + login,
      payload: { decision: "APPROVED", reason: "Evidence accepted" },
    }));
    assert.equal(result.submission.submissionStatus, "APPROVED");
    assert.equal(result.submission.metadata.verifiedBy.code, login);
    assert.equal(result.submission.metadata.approvedBy.code, login);
    assert.notEqual(result.submission.metadata.preApprovalVerificationRef.code, result.submission.verificationRef.code);
    assert.equal(result.submission.confirmedFacts.name, "Device");
    assert.equal(result.submission.metadata.reviewedFacts.name, "Verified phone");
  });
}

test("review-only and approval-only roles expose and enforce independent grants", async () => {
  for (const [login, allowed, denied] of [
    ["verifier", "waste.verification.record", "waste.review.approve"],
    ["approver", "waste.review.approve", "waste.verification.record"],
  ]) {
    const context = await access.describe(request(login));
    assert.equal(context.canVerify, login === "verifier");
    assert.equal(context.canApprove, login === "approver");
    await access.authorize(request(login), allowed);
    await assert.rejects(access.authorize(request(login), denied), { code: "ERR_WASTE_REVIEW_FORBIDDEN" });
  }
  assert.equal(writes.length, 0);
});

/** Applies a persisted flagged-source fixture using the real normalizer. */
function flagImage() {
 const current=records.get('wasteSubmission:a');
 current.metadata.photo={code:'POSTER'};
 current.metadata.evidenceReview=SERVICE.DefaultWasteItemDescriptorService.normalizeImageEvidence({sourceType:'PROMOTIONAL_GRAPHIC',confidence:.99,reason:'Advertising composition'},null,{module:'media',schema:'media',code:'POSTER'});
}
test('flagged evidence refuses service automation even if a future access adapter grants permission and payload claims human review',async()=>{
 flagImage();
 SERVICE.DefaultWasteOperationalAccessService={...access,authorize:async()=>{},assertRecord:async()=>{}};
 const automated=request('approver',{code:'a',confirmed:true,expectedRevision:1,payload:{decision:'APPROVED',evidenceReviewed:true,manualApprovalRequired:false},authData:{principalType:'service',loginId:'automation'}});
 await assert.rejects(verification.review(automated),{code:'ERR_WASTE_MANUAL_APPROVAL_REQUIRED'});
 await assert.rejects(verification.verify(automated),{code:'ERR_WASTE_MANUAL_APPROVAL_REQUIRED'});
 assert.equal(writes.length,0);
});
test('flagged approval needs explicit human acknowledgement, which is audited and copied to the approved asset',async()=>{
 flagImage();
 records.set('wasteItemType:PHONE',{code:'PHONE',impactProfileCode:'impact'});
 records.set('wasteImpactProfile:impact',{code:'impact',status:'ACTIVE'});
 records.set('wasteAssetCreationPolicy:asset-policy',{code:'asset-policy',status:'ACTIVE'});
 SERVICE.DefaultWasteImpactCalculationService={calculate:async()=>({calculationStatus:'ESTIMATED',metrics:[]})};
 SERVICE.DefaultWasteAssetCreationService={createFromApprovedSubmission:()=>({asset:{code:'asset-a'},ownershipEvent:{code:'event-a'}})};
 await verification.verify(assignedRequest('verifier',{code:'a',confirmed:true,expectedRevision:1,idempotencyKey:'verify-flagged-image',payload:{verifiedFacts:{name:'Inspected device'}}}));
 const approval=assignedRequest('approver',{code:'a',confirmed:true,expectedRevision:2,assetCreationPolicyCode:'asset-policy',idempotencyKey:'approve-flagged-image',payload:{decision:'APPROVED'}});
 const count=writes.length;
 await assert.rejects(verification.review(approval),{code:'ERR_WASTE_EVIDENCE_ACKNOWLEDGEMENT_REQUIRED'});
 assert.equal(writes.length,count);
 approval.payload.evidenceReviewed=true;
 const result=await verification.review(approval);
 assert.equal(result.submission.submissionStatus,'APPROVED');
 assert.equal(result.submission.metadata.manualEvidenceApproval.principalRef.code,'approver');
 assert.equal(result.asset.metadata.evidenceReview.manualApprovalRequired,true);
 assert.equal(result.asset.metadata.manualEvidenceApproval.principalRef.code,'approver');
 assert.equal(result.submission.metadata.reviewCommand.evidenceReviewed,true);
 const replay=await verification.review(approval);assert.equal(replay.submission.revision,result.submission.revision);
 const originalDigest=verification.commandDigest(approval);
 approval.payload.evidenceReviewed=false;
 assert.notEqual(verification.commandDigest(approval),originalDigest);
 await assert.rejects(verification.review(approval),{code:'ERR_WASTE_EVIDENCE_ACKNOWLEDGEMENT_REQUIRED'});
});
