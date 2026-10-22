/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/acceptance/defaultEnterpriseActorOwnerAcceptanceService
 * @description Opt-in live acceptance for Profile-owned Enterprise actor, membership, scope, revocation, tenant, and explicit relationship boundaries.
 * @owner profile
 * @layer tooling
 * @override Preserve canonical Profile authority, reviewed fixture selection, runtime-only credentials, and owner API delegation.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import profileProperties from "../../../config/properties.js";
import { createAcceptanceContext } from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs";

const identifierPattern = /^[A-Za-z0-9_.:@|-]{1,200}$/;

function fail(message, code = "PROFILE_ENTERPRISE_ACTOR_OWNER_ACCEPTANCE_REFUSED") {
  throw Object.assign(new Error(message), { code });
}

function requireEvidence(condition, message, code) {
  if (!condition) fail(message, code);
}

function exactObject(value, required, optional, label) {
  const keys = [...required, ...optional];
  requireEvidence(value && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => keys.includes(key)), label + " is invalid");
  return value;
}

function identifier(value, label, maximum = 200) {
  requireEvidence(typeof value === "string" && value.length <= maximum &&
    identifierPattern.test(value), label + " is invalid");
  return value;
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function configuredPolicy(policy) {
  const value = policy || profileProperties.profileAcceptance?.enterpriseActorOwner;
  exactObject(value, ["contractVersion", "maximumRequiredScopes", "refusalStatuses", "routes"], [], "Profile acceptance policy");
  requireEvidence(value.contractVersion === 1 && Number.isSafeInteger(value.maximumRequiredScopes) &&
    value.maximumRequiredScopes > 0 && value.maximumRequiredScopes <= 100,
  "Profile acceptance policy limits are invalid");
  requireEvidence(Array.isArray(value.refusalStatuses) && value.refusalStatuses.length > 0 &&
    value.refusalStatuses.every(status => Number.isSafeInteger(status) && status >= 400 && status < 500),
  "Profile acceptance refusal statuses are invalid");
  exactObject(value.routes, ["memberships", "scopes", "teamWorkspace", "revokeMembership", "administrationWorkspace"], [],
    "Profile acceptance routes");
  for (const [key, route] of Object.entries(value.routes))
    requireEvidence(typeof route === "string" && route.startsWith("/nodics/profile/v0/"),
      "Profile acceptance route is invalid: " + key);
  requireEvidence(value.routes.administrationWorkspace.includes("{enterpriseCode}"),
    "Profile administration workspace route requires an enterprise placeholder");
  return structuredClone(value);
}

function validateScope(value, index) {
  exactObject(value, ["scopeType", "scopeCode"], ["permissionCode", "capabilityCode"], "requiredScopes[" + index + "]");
  identifier(value.scopeType, "requiredScopes[" + index + "].scopeType");
  identifier(value.scopeCode, "requiredScopes[" + index + "].scopeCode");
  for (const key of ["permissionCode", "capabilityCode"])
    if (value[key] !== undefined) identifier(value[key], "requiredScopes[" + index + "]." + key);
  return structuredClone(value);
}

/** Validates one operator-reviewed selection without adding project identities or authority to Profile defaults. */
export function validateEnterpriseActorOwnerAcceptanceSelection(value, policy) {
  const defaults = configuredPolicy(policy);
  const selection = structuredClone(exactObject(value,
    ["contractVersion", "approvalReference", "runCode", "owner", "relatedEnterprise", "unrelatedEnterpriseCode",
      "foreignTenantCode", "revocation"], [], "Acceptance selection"));
  requireEvidence(selection.contractVersion === defaults.contractVersion,
    "Acceptance contractVersion must be " + defaults.contractVersion);
  identifier(selection.approvalReference, "approvalReference");
  identifier(selection.runCode, "runCode", 120);
  exactObject(selection.owner,
    ["tenantCode", "enterpriseCode", "membershipAssignmentCode", "requiredScopes"], [], "owner");
  for (const key of ["tenantCode", "enterpriseCode", "membershipAssignmentCode"])
    identifier(selection.owner[key], "owner." + key);
  requireEvidence(Array.isArray(selection.owner.requiredScopes) && selection.owner.requiredScopes.length > 0 &&
    selection.owner.requiredScopes.length <= defaults.maximumRequiredScopes,
  "owner.requiredScopes is invalid");
  selection.owner.requiredScopes = selection.owner.requiredScopes.map(validateScope);
  requireEvidence(selection.owner.requiredScopes.some(scope =>
    scope.scopeType === "ENTERPRISE" && scope.scopeCode === selection.owner.enterpriseCode),
  "owner.requiredScopes must include the owning Enterprise");

  exactObject(selection.relatedEnterprise,
    ["enterpriseCode", "grantCode", "sourceEnterpriseCode"], [], "relatedEnterprise");
  for (const key of ["enterpriseCode", "grantCode", "sourceEnterpriseCode"])
    identifier(selection.relatedEnterprise[key], "relatedEnterprise." + key);
  identifier(selection.unrelatedEnterpriseCode, "unrelatedEnterpriseCode");
  identifier(selection.foreignTenantCode, "foreignTenantCode");
  requireEvidence(selection.relatedEnterprise.enterpriseCode !== selection.owner.enterpriseCode,
    "A related Enterprise must be distinct from the actor owner");
  requireEvidence(selection.relatedEnterprise.sourceEnterpriseCode === selection.owner.enterpriseCode,
    "Related Enterprise authority must originate from the actor owner");
  requireEvidence(selection.unrelatedEnterpriseCode !== selection.owner.enterpriseCode &&
    selection.unrelatedEnterpriseCode !== selection.relatedEnterprise.enterpriseCode,
  "The unrelated Enterprise must be independently selected");
  requireEvidence(selection.foreignTenantCode !== selection.owner.tenantCode,
    "The tenant-isolation probe requires a foreign tenant");

  exactObject(selection.revocation,
    ["assignmentCode", "enterpriseCode", "revision", "operationId"], [], "revocation");
  for (const key of ["assignmentCode", "enterpriseCode", "operationId"])
    identifier(selection.revocation[key], "revocation." + key);
  requireEvidence(Number.isSafeInteger(selection.revocation.revision) && selection.revocation.revision > 0,
    "revocation.revision is invalid");
  requireEvidence(selection.revocation.enterpriseCode === selection.owner.enterpriseCode,
    "The disposable membership must belong to the reviewed actor owner");
  requireEvidence(selection.revocation.assignmentCode !== selection.owner.membershipAssignmentCode,
    "The actor cannot use the acceptance fixture to revoke its own reviewed membership");
  return { selection, policy: defaults };
}

/** Parses the Profile owner command CLI; implicit fixtures and mutation are refused. */
export function enterpriseActorOwnerAcceptanceArgument(argv = []) {
  requireEvidence(argv.every(argument => argument === "--execute" || argument.startsWith("--selection=")),
    "Unsupported Enterprise actor/owner acceptance argument");
  const selections = argv.filter(argument => argument.startsWith("--selection="));
  requireEvidence(selections.length === 1 && selections[0].length > "--selection=".length,
    "Exactly one --selection=<json-file> is required");
  requireEvidence(argv.filter(argument => argument === "--execute").length === 1,
    "Enterprise actor/owner acceptance requires exactly one --execute");
  return selections[0].slice("--selection=".length);
}

function actorHeaders(token, actor, correlationId, tenantCode = actor.tenantCode) {
  return {
    Authorization: "Bearer " + token,
    tenant: tenantCode,
    "x-enterprise-code": actor.enterpriseCode,
    "x-correlation-id": correlationId,
  };
}

function selectedMembership(projection, code, enterpriseCode, label) {
  requireEvidence(projection?.contractVersion === 1 && Array.isArray(projection.items),
    label + " membership projection is invalid");
  const matches = projection.items.filter(item => item?.code === code);
  requireEvidence(matches.length === 1 && matches[0].enterpriseCode === enterpriseCode &&
    matches[0].status === "REGISTERED" && matches[0].accepted === true,
  label + " reviewed membership is unavailable");
  return matches[0];
}

function matchesScope(actual, expected) {
  return actual?.scopeType === expected.scopeType && actual.scopeCode === expected.scopeCode &&
    (expected.permissionCode === undefined || actual.permissionCode === expected.permissionCode) &&
    (expected.capabilityCode === undefined || actual.capabilityCode === expected.capabilityCode);
}

function selectedScopes(projection, expected, label) {
  requireEvidence(projection && Array.isArray(projection.scopes) && Array.isArray(projection.deniedScopes) &&
    projection.scopeCount === projection.scopes.length, label + " scope projection is invalid");
  for (const scope of expected) {
    requireEvidence(projection.scopes.filter(row => matchesScope(row, scope)).length === 1,
      label + " required scope is unavailable");
    requireEvidence(!projection.deniedScopes.some(row => matchesScope(row, scope)),
      label + " required scope is explicitly denied");
  }
  return projection;
}

async function expectRefusal(context, policy, route, headers, label) {
  const response = await context.raw("PLATFORM", route, { headers });
  await response.arrayBuffer();
  requireEvidence(policy.refusalStatuses.includes(response.status),
    label + " did not fail closed");
  return response.status;
}

function sameRevocation(actual, expected, selection, label) {
  const fields = ["code", "enterpriseCode", "status", "accepted", "revision"];
  requireEvidence(actual?.code === selection.revocation.assignmentCode &&
    actual.enterpriseCode === selection.revocation.enterpriseCode && actual.status === "REVOKED" &&
    actual.accepted === false && actual.revision === selection.revocation.revision + 1 &&
    fields.every(field => actual[field] === expected?.[field]),
  label + " changed the committed revocation outcome");
}

/** Executes Profile owner APIs only after explicit mutation consent and reviewed disposable membership selection. */
export async function runEnterpriseActorOwnerAcceptance({
  execute = false, selection: input, actors, context, configuration, environment = process.env,
  projectRoot = environment.NODICS_PROJECT_ROOT || process.cwd(), fetch: fetchRequest = globalThis.fetch, policy,
} = {}) {
  requireEvidence(execute === true, "Enterprise actor/owner acceptance requires --execute because it revokes one disposable membership");
  const validated = validateEnterpriseActorOwnerAcceptanceSelection(input, policy);
  const selection = validated.selection;
  const defaults = validated.policy;
  exactObject(actors, ["owner", "subject"], [], "actors");
  for (const actor of ["owner", "subject"])
    requireEvidence(typeof actors[actor] === "string" && actors[actor].length > 0 && actors[actor].length <= 32768,
      actor + " bearer token is required");
  requireEvidence(actors.owner !== actors.subject, "Owner and revocation subject require distinct sessions");
  const live = context || await createAcceptanceContext({ projectRoot, environment, configuration, fetch: fetchRequest });
  requireEvidence(typeof live.request === "function" && typeof live.raw === "function",
    "Acceptance HTTP context is unavailable");
  const correlation = "profile-enterprise-actor-owner:" + selection.runCode;
  const ownerHeaders = actorHeaders(actors.owner, selection.owner, correlation + ":owner");
  const subjectActor = { tenantCode: selection.owner.tenantCode, enterpriseCode: selection.revocation.enterpriseCode };
  const subjectHeaders = actorHeaders(actors.subject, subjectActor, correlation + ":subject");

  const ownerMemberships = await live.request("PLATFORM", defaults.routes.memberships, { headers: ownerHeaders });
  selectedMembership(ownerMemberships, selection.owner.membershipAssignmentCode,
    selection.owner.enterpriseCode, "Owner");
  const ownerScopes = selectedScopes(await live.request("PLATFORM", defaults.routes.scopes, { headers: ownerHeaders }),
    selection.owner.requiredScopes, "Owner");
  const subjectMemberships = await live.request("PLATFORM", defaults.routes.memberships, { headers: subjectHeaders });
  selectedMembership(subjectMemberships, selection.revocation.assignmentCode,
    selection.revocation.enterpriseCode, "Revocation subject");
  selectedScopes(await live.request("PLATFORM", defaults.routes.scopes, { headers: subjectHeaders }),
    [{ scopeType: "ENTERPRISE", scopeCode: selection.revocation.enterpriseCode }], "Revocation subject");

  const administrationRoute = enterpriseCode => defaults.routes.administrationWorkspace.replace(
    "{enterpriseCode}", encodeURIComponent(enterpriseCode));
  const related = await live.request("PLATFORM", administrationRoute(selection.relatedEnterprise.enterpriseCode),
    { headers: ownerHeaders });
  const relatedGrant = related?.grants?.filter(grant => grant?.code === selection.relatedEnterprise.grantCode);
  requireEvidence(related?.kind === "ENTERPRISE_ADMINISTRATION_CONSENT" && related.enterpriseCode ===
    selection.relatedEnterprise.enterpriseCode && relatedGrant?.length === 1 && relatedGrant[0].status === "ACTIVE" &&
    relatedGrant[0].sourceEnterpriseCode === selection.relatedEnterprise.sourceEnterpriseCode,
  "Related Enterprise access lacks the reviewed explicit current grant");
  const unrelatedStatus = await expectRefusal(live, defaults,
    administrationRoute(selection.unrelatedEnterpriseCode), ownerHeaders, "Unrelated Enterprise access");
  const tenantStatus = await expectRefusal(live, defaults, defaults.routes.memberships,
    actorHeaders(actors.owner, selection.owner, correlation + ":foreign-tenant", selection.foreignTenantCode),
    "Foreign-tenant membership access");

  const team = await live.request("PLATFORM", defaults.routes.teamWorkspace, { headers: ownerHeaders });
  const targets = team?.items?.filter(item => item?.code === selection.revocation.assignmentCode);
  requireEvidence(team?.owner === "profile" && team.enterpriseCode === selection.owner.enterpriseCode &&
    targets?.length === 1 && targets[0].enterpriseCode === selection.revocation.enterpriseCode &&
    targets[0].revision === selection.revocation.revision && targets[0].status === "REGISTERED" &&
    targets[0].accepted === true && targets[0].actions?.includes("REVOKE"),
  "Reviewed disposable membership is not currently revocable");
  const body = JSON.stringify({ assignmentCode: selection.revocation.assignmentCode,
    revision: selection.revocation.revision, operationId: selection.revocation.operationId });
  const revoked = await live.request("PLATFORM", defaults.routes.revokeMembership,
    { method: "POST", headers: ownerHeaders, body });
  sameRevocation(revoked, revoked, selection, "Committed revocation");
  const replay = await live.request("PLATFORM", defaults.routes.revokeMembership,
    { method: "POST", headers: ownerHeaders, body });
  sameRevocation(replay, revoked, selection, "Revocation replay");
  const revokedMembershipStatus = await expectRefusal(live, defaults, defaults.routes.memberships,
    subjectHeaders, "Revoked membership session");
  const revokedScopeStatus = await expectRefusal(live, defaults, defaults.routes.scopes,
    subjectHeaders, "Revoked scope session");

  return {
    state: "PASSED",
    contractVersion: defaults.contractVersion,
    approvalReference: selection.approvalReference,
    runCode: selection.runCode,
    owner: digest(selection.owner.tenantCode + ":" + selection.owner.enterpriseCode),
    membershipVerified: true,
    requiredScopeCount: selection.owner.requiredScopes.length,
    relatedEnterprise: {
      target: digest(selection.relatedEnterprise.enterpriseCode),
      explicitGrant: digest(selection.relatedEnterprise.grantCode),
      verified: true,
    },
    unrelatedEnterpriseRefusalStatus: unrelatedStatus,
    tenantIsolationRefusalStatus: tenantStatus,
    revocation: {
      assignment: digest(selection.revocation.assignmentCode),
      revision: revoked.revision,
      replayVerified: true,
      membershipRefusalStatus: revokedMembershipStatus,
      scopeRefusalStatus: revokedScopeStatus,
    },
    sameOwnerBoundary: "OWN_ADMINISTRATION_ALLOWED_SELF_RELATIONSHIP_AND_SELF_REVOCATION_FIXTURES_REFUSED",
    authorityOwner: "PROFILE",
    customerDefaultsAdded: false,
  };
}

/** Import-inert command CLI owned and registered by Profile. */
export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help")) {
    console.log("acceptance:enterprise-actor-owner --execute --selection=<json-file>\nRequires a running PLATFORM runtime plus NODICS_PROFILE_ACCEPTANCE_OWNER_TOKEN and NODICS_PROFILE_ACCEPTANCE_SUBJECT_TOKEN. The reviewed fixture must contain existing memberships, scopes, one active explicit related-Enterprise grant, one unrelated Enterprise, one foreign tenant, and one disposable non-administrator membership that can be revoked. The command never provisions identity or authority.");
    return 0;
  }
  const selectionPath = enterpriseActorOwnerAcceptanceArgument(argv);
  const selection = JSON.parse(await readFile(selectionPath, "utf8"));
  const report = await runEnterpriseActorOwnerAcceptance({
    execute: true,
    selection,
    actors: {
      owner: process.env.NODICS_PROFILE_ACCEPTANCE_OWNER_TOKEN,
      subject: process.env.NODICS_PROFILE_ACCEPTANCE_SUBJECT_TOKEN,
    },
  });
  console.log(JSON.stringify(report, null, 2));
  return report.state === "PASSED" ? 0 : 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
