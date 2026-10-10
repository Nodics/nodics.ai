/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const amounts = require("../../../loyaltyCore/src/service/defaultLoyaltyAmountService");
const counters = ["available", "reserved", "earned", "spent", "expired", "reversed"];
const persistenceSchemas = [["loyaltyWallet", "loyaltyWallet"], ["loyaltyWallet", "loyaltyWalletRewardBalance"], ["loyaltyLedger", "rewardLedgerEntry"]];
const persistenceSchemaNames = new Set(persistenceSchemas.map(([moduleName, schemaName]) => moduleName + "." + schemaName));

/**
 * @module loyaltyWallet/service/DefaultLoyaltySampleCreditContributionService
 * @description Posts explicitly reviewed Local sample credits through nImport and
 * Loyalty's ledger/balance owner. Never imports snapshots or opens a wallet.
 * @owner loyaltyWallet @layer service
 * @override Later layers may narrow approval and eligibility; preserve independent
 * human permission, exact source/intent binding and atomic posting/readback.
 */
module.exports = {
  /** Throws a content-free owner status. */
  fail: function (code = "ERR_LOYALTY_SAMPLE_CREDIT_INVALID", gate, schema) {
    try { return SERVICE.DefaultLoyaltyRewardOperationService.fail(code, "Reviewed Local sample credit is unavailable"); }
    catch (error) {
      if (gate) Object.defineProperty(error, "sampleCreditGate", { value: gate });
      if (persistenceSchemaNames.has(schema)) Object.defineProperty(error, "sampleCreditSchema", { value: schema });
      throw error;
    }
  },
  /** Requires an authenticated human sample-credit permission and independently selected Local policy. */
  context: function (request) {
    const auth = request.authData || {}, policy = CONFIG.get("loyalty")?.sampleCredits;
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    const actorCode = auth.principalId || auth.code || auth.loginId;
    const environment = NODICS.getSelectedEnvironmentName();
    if (policy?.enabled !== true || CONFIG.get("environment")?.class !== "LOCAL" ||
        CONFIG.get("runtimeRole")?.code !== "LOYALTY" ||
        !Array.isArray(policy.allowedEnvironments) || !policy.allowedEnvironments.includes(environment) ||
        auth.principalType !== "human" || auth.tokenType !== "access" || auth.isSystem ||
        !auth.tenant || auth.tenant !== request.tenant || !enterpriseCode ||
        typeof actorCode !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:@-]{0,191}$/.test(actorCode) ||
        [auth.entCode, auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== enterpriseCode) ||
        !security?.getGrantedPermissions || !security?.isPermissionGranted ||
        !security.isPermissionGranted("loyalty.sampleCredit.apply", security.getGrantedPermissions(request), {}))
      this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "HUMAN_CONTEXT");
    return { ...request, authData: structuredClone(auth), enterpriseCode, environment, actorCode };
  },
  /** Accepts bounded scalar instructions and the exact original six-counter balance revision. */
  instruction: function (input) {
    const fields = ["code", "customerCode", "walletCode", "programCode", "rewardTypeCode", "amount", "approvalReference", "expectedBalance"];
    if (!input || Object.keys(input).sort().join(",") !== fields.sort().join(",") ||
        fields.filter(key => !["amount", "expectedBalance"].includes(key)).some(key =>
          typeof input[key] !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:@-]{0,191}$/.test(input[key])) ||
        typeof input.amount !== "string" || !/^\d{1,12}(\.\d{1,8})?$/.test(input.amount) ||
        !input.expectedBalance || Object.keys(input.expectedBalance).sort().join(",") !== [...counters, "revision"].sort().join(",") ||
        !Number.isSafeInteger(input.expectedBalance.revision) || input.expectedBalance.revision < 0 ||
        counters.some(key => typeof input.expectedBalance[key] !== "string" || !/^\d{1,12}(\.\d{1,8})?$/.test(input.expectedBalance[key]))) this.fail();
    return structuredClone(input);
  },
  /** Loads only a qualified immutable JSON contribution; file paths and source flags grant no credit authority. */
  load: async function (request) {
    request = this.context(request);
    const contribution = structuredClone(request.contribution);
    if (contribution?.destinationRole !== "LOYALTY" || contribution.lifecycle !== "OPERATIONAL_VERSIONED" ||
        contribution.selectionPolicy !== "EXPLICIT" || contribution.dataType !== "sample" ||
        !/^[a-f0-9]{64}$/.test(contribution.checksum || "")) this.fail();
    const payload = await SERVICE.DefaultDataReleaseService.readContributionPayload(contribution, "LOYALTY_SAMPLE_CREDITS", "loyaltyCredits.json");
    const maximum = CONFIG.get("loyalty")?.sampleCredits?.maximumInstructions;
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 1000 || !payload ||
        Object.keys(payload).sort().join(",") !== "contractVersion,credits" || payload.contractVersion !== 1 ||
        !Array.isArray(payload.credits) || !payload.credits.length || payload.credits.length > maximum) this.fail();
    const credits = payload.credits.map(row => this.instruction(row));
    if (new Set(credits.map(row => row.code)).size !== credits.length ||
        new Set(credits.map(row => [row.walletCode, row.programCode, row.rewardTypeCode].join("|"))).size !== credits.length) this.fail();
    const source = { releaseCode: contribution.releaseCode, version: contribution.version, checksum: contribution.checksum };
    for (const input of credits) this.approval(request, input, source);
    return { request, credits, source };
  },
  /** Matches the exact source and human-reviewed instruction to deployment selection, never to body authority. */
  approval: function (request, input, source) {
    const policy = CONFIG.get("loyalty")?.sampleCredits;
    const grants = Array.isArray(policy?.approvedSources) ? policy.approvedSources : [];
    if (grants.filter(row => row.environmentCode === request.environment && row.enterpriseCode === request.enterpriseCode &&
        row.releaseCode === source.releaseCode && row.version === source.version && row.checksum === source.checksum &&
        row.instructionCode === input.code && row.approvalReference === input.approvalReference).length !== 1)
      this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "PINNED_APPROVAL");
  },
  /** Rejects failed or ambiguous generated reads and retains the established private Loyalty storage actor. */
  read: async function (request, serviceName, query) {
    const service = SERVICE[serviceName], operations = SERVICE.DefaultLoyaltyRewardOperationService;
    if (typeof service?.get !== "function") this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "GENERATED_READ_OWNER");
    const response = await service.get({ ...operations.serviceRequest(request, { query: structuredClone(query) }),
      options: { skipItemCache: true, recursive: false }, searchOptions: { pageSize: 2, pageNumber: 1 } });
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
        response.errors?.length || !Array.isArray(response.result) || response.result.length > 1 ||
        response.result.some(row => row.active === false || row.tenant !== undefined && row.tenant !== request.tenant ||
          Object.entries(query).some(([key, value]) => row[key] !== value))) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "GENERATED_READ_ENVELOPE");
    return response.result[0];
  },
  /** Binds one posting to its original reviewed source, scope and instruction. */
  posting: function (request, input, source, scale) {
    const key = "sample-credit-" + crypto.createHash("sha256").update(JSON.stringify({ tenant: request.tenant,
      enterpriseCode: request.enterpriseCode, releaseCode: source.releaseCode, instructionCode: input.code })).digest("hex");
    return { ...request, walletCode: input.walletCode, programCode: input.programCode, rewardTypeCode: input.rewardTypeCode,
      amount: amounts.assertPositive(input.amount, scale), scale, idempotencyKey: key, correlationId: key,
      sourceType: "SAMPLE_DATA_RELEASE", sourceCode: source.releaseCode + "@" + source.version,
      targetType: "CUSTOMER", targetCode: input.customerCode,
      metadata: { operatorCode: request.actorCode,
        sampleCredit: { source, instruction: input, enterpriseCode: request.enterpriseCode, localDemoOnly: true } } };
  },
  /** Verifies installed atomic provider, eligible schemas and unique posting/balance identities without writes. */
  persistence: async function (request) {
    const transaction = SERVICE.DefaultLoyaltyTransactionService;
    if (CONFIG.get("loyalty")?.transactions?.enabled !== true || !transaction?.run || !transaction?.qualify)
      this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "TRANSACTION_SELECTION");
    const qualified = transaction.qualify(request);
    let database;
    try {
      database = qualified?.owner?.resolve(qualified.scope)?.database;
    } catch (_) {
      this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "DATABASE_OWNER");
    }
    if (!database) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "DATABASE_OWNER");
    const handler = SERVICE.DefaultDatabaseModelHandlerService;
    if (!handler?.inspectIndexes) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "INDEX_INSPECTION_OWNER");
    for (const [moduleName, schemaName] of persistenceSchemas) {
      const model = NODICS.getModels(moduleName, request.tenant)?.[UTILS.createModelName(schemaName)];
      const conditions = [
        ["SCHEMA_MODEL", Boolean(model)],
        ["SCHEMA_DATABASE", model?.dataBase === database],
        ["SCHEMA_VERSIONING", model?.versioned !== true],
        ["SCHEMA_TRANSACTION", model?.rawSchema?.transaction?.enabled === true && model.rawSchema.transaction.sideEffects === "none"],
        ["SCHEMA_CACHE", model?.rawSchema?.cache?.enabled === false],
        ["SCHEMA_EVENT", model?.rawSchema?.event?.enabled === false],
        ["SCHEMA_COMPARE_AND_SET", schemaName !== "loyaltyWalletRewardBalance" || typeof model?.compareAndSetItem === "function"],
      ];
      const refused = conditions.find(([, admitted]) => !admitted);
      if (refused) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", refused[0], moduleName + "." + schemaName);
      const evidence = await handler.inspectIndexes(model);
      if (evidence?.versioned !== false || !evidence.indexes?.some(index => index.unique === true && !index.sparse &&
          !index.partialFilterExpression && (!index.collation || index.collation.locale === "simple") &&
          Object.keys(index.key || {}).join(",") === "code" && index.key.code === 1)) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "UNIQUE_IDENTITY_INDEX");
    }
  },
  /** Inspects original evidence and expected balance; replay does not require an unchanged post-spend balance. */
  inspect: async function (request, input, source, scale) {
    request = this.context(request); this.approval(request, input, source);
    const wallet = await this.read(request, "DefaultLoyaltyWalletService", { code: input.walletCode, ownerType: "CUSTOMER", ownerCode: input.customerCode });
    if (!wallet || wallet.status !== "OPEN" || wallet.metadata?.sample !== true) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "SAMPLE_WALLET_ELIGIBILITY");
    const posting = this.posting(request, input, source, scale), operations = SERVICE.DefaultLoyaltyRewardOperationService;
    const original = await this.read(request, "DefaultRewardLedgerEntryService", { code: operations.ledgerCode(posting, "EARN") });
    const balance = await this.read(request, "DefaultLoyaltyWalletRewardBalanceService", { walletCode: input.walletCode,
      programCode: input.programCode, rewardTypeCode: input.rewardTypeCode });
    if (!balance || balance.metadata?.sample !== true) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "SAMPLE_BALANCE_ELIGIBILITY");
    if (original) {
      for (const key of ["walletCode", "programCode", "rewardTypeCode", "amount", "sourceType", "sourceCode", "targetType", "targetCode", "idempotencyKey", "correlationId"])
        if (original[key] !== posting[key]) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
      if (original.entryType !== "EARN" || !isDeepStrictEqual(original.metadata?.sampleCredit, posting.metadata.sampleCredit))
        this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
      return { action: "CURRENT", posting, balance, ledgerEntry: original };
    }
    if (balance.revision !== input.expectedBalance.revision || counters.some(key =>
      amounts.compare(balance[key], input.expectedBalance[key], scale) !== 0)) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
    return { action: "CREDIT_ONCE", posting, balance };
  },
  /** Resolves active POINT precision/program policy before any transaction; no carbon or other unit funding. */
  scale: async function (request, input) {
    const program = await this.read(request, "DefaultLoyaltyProgramService", { code: input.programCode });
    const reward = await this.read(request, "DefaultLoyaltyRewardTypeService", { code: input.rewardTypeCode });
    if (!program || program.status !== "ACTIVE" || program.earningEnabled !== true || !reward || reward.status !== "ACTIVE" ||
        reward.unitType !== "POINT" || !Number.isSafeInteger(reward.precision) || reward.precision < 0 || reward.precision > 8)
      this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", "PROGRAM_POLICY");
    return reward.precision;
  },
  /** Read-only nImport preflight with bounded owner blockers. */
  preflightContribution: async function (request) {
    try {
      const loaded = await this.load(request), plans = [];
      await this.persistence(loaded.request);
      for (const input of loaded.credits) plans.push(await this.inspect(loaded.request, input, loaded.source, await this.scale(loaded.request, input)));
      return { ready: true, plan: { creditCount: plans.length, currentCount: plans.filter(row => row.action === "CURRENT").length } };
    } catch (error) {
      if (!/^ERR_LOYALTY_(SAMPLE_CREDIT|TRANSACTION)/.test(error.code || "")) throw error;
      const gates = new Set(["HUMAN_CONTEXT", "PINNED_APPROVAL", "GENERATED_READ_OWNER", "GENERATED_READ_ENVELOPE",
        "TRANSACTION_SELECTION", "DATABASE_OWNER", "INDEX_INSPECTION_OWNER", "SCHEMA_PARTICIPATION", "UNIQUE_IDENTITY_INDEX",
        "SCHEMA_MODEL", "SCHEMA_DATABASE", "SCHEMA_VERSIONING", "SCHEMA_TRANSACTION", "SCHEMA_CACHE", "SCHEMA_EVENT", "SCHEMA_COMPARE_AND_SET",
        "SAMPLE_WALLET_ELIGIBILITY", "SAMPLE_BALANCE_ELIGIBILITY", "PROGRAM_POLICY"]);
      return { ready: false, blocker: { owner: "loyaltyWallet", code: error.code,
        ...(gates.has(error.sampleCreditGate) ? { gate: error.sampleCreditGate,
          ...(error.sampleCreditGate.startsWith("SCHEMA_") && persistenceSchemaNames.has(error.sampleCreditSchema)
            ? { schema: error.sampleCreditSchema } : {}) } : {}) } };
    }
  },
  /** Posts each reviewed credit atomically with original replay evidence and in-transaction durable readback. */
  installContribution: async function (request) {
    const loaded = await this.load(request), plans = [];
    await this.persistence(loaded.request);
    for (const input of loaded.credits) plans.push({ input, scale: await this.scale(loaded.request, input) });
    for (const row of plans) await this.inspect(loaded.request, row.input, loaded.source, row.scale);
    const receipts = [];
    for (const row of plans) {
      const scoped = { ...loaded.request };
      const result = await SERVICE.DefaultLoyaltyTransactionService.run(scoped, async () => {
        const plan = await this.inspect(scoped, row.input, loaded.source, row.scale);
        const operations = SERVICE.DefaultLoyaltyRewardOperationService;
        if (plan.action === "CURRENT") return { ledgerEntryCode: plan.ledgerEntry.code, action: "CURRENT" };
        const after = operations.changeBalance(plan.balance, plan.posting, { available: plan.posting.amount, earned: plan.posting.amount });
        const entry = operations.ledgerEntry(plan.posting, after, "EARN");
        const savedBalance = await operations.saveBalance(plan.posting, after);
        if (savedBalance?.error || savedBalance?.success === false || savedBalance?.acknowledged === false ||
            savedBalance?.errors?.length || /^ERR_/.test(savedBalance?.code || "")) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
        const service = SERVICE.DefaultRewardLedgerEntryService;
        if (!service?.save) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE");
        const savedEntry = await service.save({ ...operations.serviceRequest(plan.posting, { model: operations.persistenceModel(entry) }), options: { insertOnly: true } });
        if (!/^SUC_/.test(savedEntry?.code || "") || savedEntry.error || savedEntry.success === false ||
            savedEntry.acknowledged === false || savedEntry.errors?.length || savedEntry.result?.acknowledged === false)
          this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
        const observed = await this.inspect(scoped, row.input, loaded.source, row.scale);
        if (observed.action !== "CURRENT" || observed.balance.revision !== after.revision ||
            counters.some(key => amounts.compare(observed.balance[key], after[key], row.scale) !== 0)) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT");
        return { ledgerEntryCode: entry.code, action: "CREDITED" };
      });
      receipts.push({ instructionCode: row.input.code, ...result });
    }
    return { data: { ...loaded.source, receipts, localDemoOnly: true } };
  },
};
