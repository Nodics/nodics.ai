/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/helpers/installedOnboardingOwnerInspection
 * @description Reads authenticated identity assessment and exact installed assignment indexes without identity, index or qualification mutations.
 * @layer test
 * @owner profile
 * @override Selected Local layers retain real human admission, bounded evidence and database-owner read-only inspection; unsupported providers refuse.
 */
const path = require("node:path");
const { isDeepStrictEqual } = require("node:util");
const { createHash } = require("node:crypto");
const foundation = "../../../../../nodics.foundation/modules/";
const assessmentPath = "/nodics/profile/v0/identity/migration/assessment";
// Runner-only opaque-input ceiling, not an issuer guarantee or a server header-size override.
const maximumOperatorProofLength = 131072;
const countKeys = ["tenants", "enterprises", "assignments", "employees", "customers", "servicePrincipals", "passwords"];
const refusalCodes = new Set([
  "OWNER_SELECTION_INVALID", "OWNER_ORIGIN_INVALID", "OWNER_ASSESSMENT_NOT_READY",
  "OWNER_CLAIM_INDEX_NOT_READY", "OWNER_OPERATOR_PROOF_REQUIRED", "OWNER_ASSESSMENT_ADMISSION_REFUSED",
  "OWNER_ASSESSMENT_RESPONSE_INVALID", "OWNER_ASSESSMENT_TRANSPORT_REFUSED", "OWNER_RUNTIME_UNSUPPORTED",
  "OWNER_RUNTIME_TARGET_MISMATCH", "OWNER_PROVIDER_UNSUPPORTED", "OWNER_ASSIGNMENT_COLLECTION_MISSING",
  "OWNER_INDEX_CHANGED", "OWNER_INDEX_INSPECTION_REFUSED", "OWNER_CONNECTION_CLOSE_FAILED",
  "OWNER_WORKER_REFUSED", "OWNER_CONTEXT_UNAVAILABLE",
]);
const indexMetadataOwner = require(foundation + "nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService");

/** Allows only reviewed fixed refusal codes, never arbitrary provider/transport error strings. @param {Object} error Private failure. @returns {string} Safe diagnostic code. */
function sanitizeRefusal(error) {
  return refusalCodes.has(error?.code) ? error.code : "OWNER_CONTEXT_UNAVAILABLE";
}

/** Emits fixed content-free refusals, never transport/provider diagnostics. @param {string} code Reviewed stage code. @returns {never} Throws. */
function refuse(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

/** Validates bounded HTTP bearer syntax, not JWT structure or authentication; proof remains opaque and unmodified. @param {string} token Private current operator proof. @returns {void} */
function assertOperatorProof(token) {
  if (typeof token !== "string" || token.length < 32 ||
      token.length > maximumOperatorProofLength || !/^[A-Za-z0-9._~+/-]+=*$/.test(token))
    refuse("OWNER_OPERATOR_PROOF_REQUIRED");
}

/** Parses explicit project/runtime coordinates only; credentials and raw provider selectors are never CLI options. @param {Array<string>} args CLI arguments. @returns {Object} Bounded selections. */
function parseOptions(args) {
  const values = {};
  for (const argument of args) {
    if (argument === "--confirm-bootstrap-review" && !values.confirmBootstrapReview) {
      values.confirmBootstrapReview = true;
      continue;
    }
    const match = argument.match(/^--(project-root|environment|server|origin)=(.+)$/);
    if (!match || Object.hasOwn(values, match[1])) refuse("OWNER_SELECTION_INVALID");
    values[match[1]] = match[2];
  }
  if (!path.isAbsolute(values["project-root"] || "") ||
      ["environment", "server"].some((key) => !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(values[key] || "")))
    refuse("OWNER_SELECTION_INVALID");
  assertLoopbackOrigin(values.origin);
  return Object.freeze(values);
}

/** Admits exact native loopback origins without userinfo, paths or query selectors. @param {string} origin Explicit origin. @returns {void} */
function assertLoopbackOrigin(origin) {
  let url;
  try { url = new URL(origin); } catch { refuse("OWNER_ORIGIN_INVALID"); }
  if (!["http:", "https:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.origin !== origin || url.username || url.password || url.search || url.hash)
    refuse("OWNER_ORIGIN_INVALID");
}

/** Projects only complete, recent, conflict-free owner evidence; does not turn observed consistency into atomicity or qualification. @param {Object} response Actual HTTP owner envelope. @param {number} startedAt Request boundary. @returns {Object} Aggregate evidence only. */
function projectAssessment(response, startedAt, confirmBootstrapReview = false) {
  const data = response?.data;
  const review = data?.bootstrapReview;
  const reviewed = confirmBootstrapReview === true &&
    review && Object.keys(review).sort().join() === "auditRecorded,disposition,effects,evidenceDigest,findingCount,qualificationGranted,reviewedAt,reviewerDigest,version" &&
    review.auditRecorded === true && /^[a-f0-9]{64}$/.test(review.evidenceDigest || "") &&
    /^[a-f0-9]{64}$/.test(review.reviewerDigest || "") &&
    review.version === 1 && review.disposition === "REVIEWED_SOURCE_MATCH" && review.effects === false &&
    review.qualificationGranted === false && Number.isSafeInteger(review.findingCount) && review.findingCount > 0 &&
    review.findingCount <= 100 && review.findingCount === data.findings?.length &&
    Number.isFinite(Date.parse(review.reviewedAt)) && Date.parse(review.reviewedAt) >= startedAt - 30000 &&
    Date.parse(review.reviewedAt) <= Date.now() + 30000 &&
    Array.isArray(data.findings) && data.findings.every((f) => f && Object.keys(f).sort().join() === "code,references" &&
      f.code === "RSN_PROFILE_IDENTITY_NON_EMAIL_LOGIN_REVIEW" && Array.isArray(f.references) &&
      f.references.length === 1 && /^[a-f0-9]{64}$/.test(f.references[0]));
  if (response?.code !== "SUC_SYS_00000" || response.success === false || response.error ||
      response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
      !data || data.contractVersion !== 1 || data.inventoryComplete !== true ||
      data.consistency !== "TWO_PASS_OBSERVED_MATCH" || data.atomicSnapshot !== false || data.readyForApply !== false ||
      !Array.isArray(data.findings) ||
      (reviewed ? data.reviewRequired !== true : data.reviewRequired !== false || data.findings.length !== 0 || review !== undefined) ||
      !/^[a-f0-9]{64}$/.test(data.fingerprint || "") ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(data.assessmentId || "") ||
      Object.keys(data).sort().join() !== ["counts", "findings", "reviewRequired", "contractVersion", "assessmentId", "observedAt", "inventoryComplete", "consistency", "atomicSnapshot", "readyForApply", "fingerprint", ...(reviewed ? ["bootstrapReview"] : [])].sort().join() ||
      !Number.isFinite(Date.parse(data.observedAt)) || Date.parse(data.observedAt) < startedAt - 30000 || Date.parse(data.observedAt) > Date.now() + 30000 ||
      !data.counts || Object.keys(data.counts).sort().join() !== countKeys.slice().sort().join() ||
      countKeys.some((key) => !Number.isSafeInteger(data.counts[key]) || data.counts[key] < 0 || data.counts[key] > 50000) || data.counts.tenants < 1 || data.counts.enterprises < 1)
    refuse("OWNER_ASSESSMENT_NOT_READY");
  return { inventoryComplete: true, consistency: data.consistency, atomicSnapshot: false,
    observedAt: data.observedAt, counts: Object.fromEntries(countKeys.map((key) => [key, data.counts[key]])),
    ...(reviewed ? { reviewRequired: true, bootstrapReview: {
      disposition: review.disposition, findingCount: review.findingCount, reviewedAt: review.reviewedAt,
      auditRecorded: true, evidenceDigest: review.evidenceDigest, reviewerDigest: review.reviewerDigest,
      qualificationGranted: false,
    } } : {}) };
}

/** Requires exactly the reviewed source claim index with no competing uniqueness or changed comparison semantics. @param {Array} indexes Native index specs. @param {Object} expected Effective source descriptor. @returns {Object} Content-free index observation. */
function inspectClaimIndex(indexes, expected) {
  if (!isDeepStrictEqual(expected.fields, { normalizedEmail: 1 }) || expected.options?.unique !== true ||
      !isDeepStrictEqual(expected.options.partialFilterExpression, { identityClaimed: true }) ||
      !Array.isArray(indexes) || indexes.length < 1 || indexes.length > 128)
    refuse("OWNER_CLAIM_INDEX_NOT_READY");
  const candidates = indexes.filter((index) => index?.unique === true && Object.hasOwn(index.key || {}, "normalizedEmail"));
  const index = candidates[0];
  if (candidates.length !== 1 || indexMetadataOwner.hash(index.key) !== indexMetadataOwner.hash(expected.fields) ||
      !isDeepStrictEqual(index.partialFilterExpression, expected.options.partialFilterExpression) ||
      index.sparse === true || index.hidden === true ||
      index.collation && !isDeepStrictEqual(index.collation, { locale: "simple" }) ||
      Object.keys(index).some((key) => !["v", "ns", "name", "key", "unique", "partialFilterExpression", "sparse", "hidden", "collation", "background"].includes(key)))
    refuse("OWNER_CLAIM_INDEX_NOT_READY");
  return { exactPartialUniqueClaimIndex: true, installedIndexCount: indexes.length };
}

/** Reads the fixed existing administrative endpoint once under real bearer admission; redirects and oversized bodies refuse. @param {string} origin Configuration-bound loopback origin. @param {string} token Private current human access token. @returns {Promise<Object>} Parsed owner envelope, never printed. */
async function requestAssessment(origin, token) {
  return requestOwnerObservation(origin, token, assessmentPath, {});
}

/** Sends only an explicitly confirmed owner challenge to the fixed read-only review endpoint. @param {string} origin Bound origin. @param {string} token Private human access proof. @param {string} reviewToken Owner challenge. @returns {Promise<Object>} Preserved assessment plus reviewed evidence. */
async function requestBootstrapReview(origin, token, reviewToken) {
  if (typeof reviewToken !== "string" || reviewToken.length > 2048 ||
      !/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/.test(reviewToken)) refuse("OWNER_ASSESSMENT_NOT_READY");
  return requestOwnerObservation(origin, token, assessmentPath + "/bootstrap-review", { confirmed: true, reviewToken });
}

/** Fixed internal observation/review transport; no caller-selected endpoint is exported. @param {string} origin Bound origin. @param {string} token Human bearer. @param {string} endpoint Fixed owner path. @param {Object} body Exact command. @returns {Promise<Object>} Private response. */
async function requestOwnerObservation(origin, token, endpoint, body) {
  assertLoopbackOrigin(origin);
  assertOperatorProof(token);
  try {
    const response = await fetch(origin + endpoint, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body),
    });
    if (response.status !== 200 || !/^application\/json(?:;|$)/i.test(response.headers.get("content-type") || ""))
      refuse("OWNER_ASSESSMENT_ADMISSION_REFUSED");
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        length += next.value.length;
        if (length > 262144) refuse("OWNER_ASSESSMENT_RESPONSE_INVALID");
        chunks.push(Buffer.from(next.value));
      }
    } finally { await reader.cancel(); }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (refusalCodes.has(error?.code)) throw error;
    refuse("OWNER_ASSESSMENT_TRANSPORT_REFUSED");
  }
}

/** Loads effective Local configuration and schemas through existing maintenance loaders without hooks, initialization or index creation. @param {Object} options Reviewed coordinates. @returns {Promise<Object>} Private resolved target and selected read owners. */
async function loadContext(options) {
  const tooling = foundation + "nTooling/src/service/project/";
  const credentials = require(tooling + "defaultProjectLocalRuntimeCredentialService");
  const variables = credentials.readExistingEnvironment(options["project-root"], options.environment);
  const snapshot = require(foundation + "nConfig/src/service/defaultDeploymentConfigurationProjectionService").resolve({
    projectRoot: options["project-root"], environment: options.environment, server: options.server,
    variables: { ...variables, S: options.server, SERVER: options.server,
      E: options.environment, ENV: options.environment, NODICS_NODE: "", N: "", NODE: "" },
  });
  if (CONFIG.get("environment")?.class !== "LOCAL" || !snapshot.modules.includes("profile")) refuse("OWNER_RUNTIME_UNSUPPORTED");
  const { readProjectEnvironmentConfiguration } = await import(require("node:url").pathToFileURL(require.resolve(tooling + "defaultProjectEnvironmentConfigurationService.mjs")));
  const deployment = readProjectEnvironmentConfiguration(options["project-root"], options.environment);
  const runtime = deployment.topology.groups.backends.find((item) => item.server === options.server);
  const origin = new URL(options.origin);
  if (!runtime || origin.protocol !== "http:" || Number(origin.port) !== runtime.port) refuse("OWNER_RUNTIME_TARGET_MISMATCH");
  const initializer = require(foundation + "nConfig/src/service/DefaultFrameworkInitializerService");
  await initializer.loadMaintenanceServices();
  const raw = SERVICE.DefaultFilesLoaderService.loadSchemaFiles("/src/schemas/schemas.js", null);
  await SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(raw);
  NODICS.setActiveChannel("master");
  const tenant = SERVICE.DefaultEnterpriseManagementService.assignmentTenant();
  const moduleName = SERVICE.DefaultProfileService.getProfileModuleName();
  const module = NODICS.getModule(moduleName);
  const schemaName = "enterpriseAccessAssignment", schema = module?.rawSchema?.[schemaName];
  const config = SERVICE.DefaultDatabaseConfigurationService.getDatabaseConfiguration(moduleName, tenant);
  let uri;
  try { uri = new URL(config.master.URI); } catch { refuse("OWNER_PROVIDER_UNSUPPORTED"); }
  if (!schema || schema.versioned === true || config.options.databaseType !== "mongodb" ||
      uri.protocol !== "mongodb:" || !["localhost", "127.0.0.1", "[::1]"].includes(uri.hostname) ||
      config.options.connectionHandler !== "DefaultMongodbDatabaseConnectionHandlerService" ||
      config.options.installedVersionMigrationService !== "DefaultMongodbInstalledVersionMigrationService")
    refuse("OWNER_PROVIDER_UNSUPPORTED");
  const indexOwner = SERVICE.DefaultMongodbDatabaseModelHandlerService;
  await indexOwner.prepareDatabaseOptions({ moduleObject: module, schemaName, tntCode: tenant,
    dataBase: { master: { getOptions: () => config.options } } });
  const claim = schema.schemaOptions[tenant].indexedFields.filter((index) => Object.hasOwn(index.fields, "normalizedEmail"));
  if (claim.length !== 1) refuse("OWNER_CLAIM_INDEX_NOT_READY");
  return { origin: options.origin, project: deployment.projectCode, environment: options.environment, server: options.server,
    tenant, moduleName, schemaName, schema, config, expectedIndex: claim[0], collection: UTILS.createModelName(schemaName),
    connector: { ...SERVICE[config.options.connectionHandler], LOG: { debug() {}, info() {}, warn() {}, error() {} } },
    indexReader: SERVICE[config.options.installedVersionMigrationService] };
}

/** Reads at most 128 installed index specifications through the native cursor and always closes it. @param {Object} cursor Native index cursor. @returns {Promise<Object[]>} Bounded metadata, never truncated success. */
async function readBoundedIndexCursor(cursor) {
  try {
    if (!cursor || typeof cursor.next !== "function" || typeof cursor.close !== "function")
      refuse("OWNER_INDEX_INSPECTION_REFUSED");
    const indexes = [];
    for (let count = 0; count <= 128; count++) {
      const value = await cursor.next();
      if (value === null) return indexes;
      if (!value || typeof value !== "object" || Array.isArray(value) || count === 128)
        refuse("OWNER_INDEX_INSPECTION_REFUSED");
      indexes.push(value);
    }
    refuse("OWNER_INDEX_INSPECTION_REFUSED");
  } finally {
    if (cursor && typeof cursor.close === "function") await cursor.close();
  }
}

/** Runs authenticated inventory before opening one exact index-only connection and always closes the held handle. @param {Object} context Resolved source target. @param {string} token Private human proof. @param {Function} [assessment] Test-only transport boundary; CLI uses real HTTP. @returns {Promise<Object>} Read-only prerequisite receipt, never activation authority. */
async function inspectInstalledOwners(context, token, assessment = requestAssessment, confirmBootstrapReview = false) {
  const startedAt = Date.now();
  let response = await assessment(context.origin, token);
  if (confirmBootstrapReview && response?.data?.bootstrapReview?.disposition === "REVIEW_REQUIRED")
    response = await requestBootstrapReview(context.origin, token, response.data.bootstrapReview.reviewToken);
  const inventory = projectAssessment(response, startedAt, confirmBootstrapReview);
  let handle;
  let indexes;
  try {
    handle = await context.connector.createConnection({ ...context.config.master,
      options: { ...context.config.master.options, serverSelectionTimeoutMS: 5000, readPreference: "primary" } });
    if (handle.connection.databaseName !== context.config.master.databaseName || !Array.isArray(handle.collections) ||
        !handle.collections.some((item) => (typeof item === "string" ? item : item.name) === context.collection))
      refuse("OWNER_ASSIGNMENT_COLLECTION_MISSING");
    const model = context.indexReader.bindMaintenanceModel({ connection: handle, schema: context.schema,
      scope: { moduleName: context.moduleName, schemaName: context.schemaName, tenant: context.tenant, channel: "master",
        database: context.config.master.databaseName, collection: context.collection }, databaseOptions: context.config.options });
    const nativeList = model.listIndexes.bind(model);
    model.listIndexes = (options) => ({
      toArray: async () => readBoundedIndexCursor(nativeList(options)),
    });
    const before = await context.indexReader.readIndexes(model);
    indexes = inspectClaimIndex(before, context.expectedIndex);
    const after = await context.indexReader.readIndexes(model);
    if (!context.indexReader.sameIndexes(before, after)) refuse("OWNER_INDEX_CHANGED");
  } catch (error) {
    if (refusalCodes.has(error?.code)) throw error;
    refuse("OWNER_INDEX_INSPECTION_REFUSED");
  } finally {
    if (handle) {
      try { await handle.client.close(); } catch { refuse("OWNER_CONNECTION_CLOSE_FAILED"); }
    }
  }
  const sourceFingerprint = createHash("sha256").update(JSON.stringify(context.schema)).digest("hex");
  return { contractVersion: 1, kind: "PROFILE_INSTALLED_ONBOARDING_PREREQUISITES", evidence: "READ_ONLY_INSTALLED_OWNER_OBSERVATION",
    nodeVersion: process.version, observedAt: new Date().toISOString(), sourceSchemaFingerprint: sourceFingerprint,
    scope: { project: context.project, environment: context.environment, server: context.server, moduleName: context.moduleName,
      tenant: context.tenant, databaseName: context.config.master.databaseName, collection: context.collection },
    inventory, indexes, installedRuntimeSourceMatch: "NOT_ESTABLISHED", registrationQualified: false, browserAccepted: false,
    effects: { identityWrites: 0, indexWrites: 0, qualificationChanges: 0 } };
}

module.exports = { parseOptions, assertLoopbackOrigin, assertOperatorProof, projectAssessment, inspectClaimIndex, requestAssessment, requestBootstrapReview, loadContext, readBoundedIndexCursor, inspectInstalledOwners, sanitizeRefusal };
