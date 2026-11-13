/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaMonetaryOutletPack @description Verifies approved fictional outlet source packs against canonical owner contracts using isolated ports; no native import or qualification. @layer test @owner circa.ewaste */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { frameworkRoot, loadRuntime } = require("../../../test/helpers/configuration");
const proposal = require("./fixtures/circaMonetaryOutletProposal.json");
const selection = require("./fixtures/circaMonetaryOutletSetupSelection.json");
const manifest = require("../data/manifest.json");
const { historicalSection } = require("./helpers/releasePortability");
const dataRoot = path.resolve(__dirname, "../data");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const owner = (domain, name) => require(path.join(frameworkRoot,
  `nodics.commerce/modules/baseCommerce/modules/${domain}/src/service/${name}`));
const issuerTitle = pack => ({ greenperks: "GreenPerks", renewworks: "RenewWorks", loopcycle: "LoopCycle" })[pack.slug];
const rows = (pack, name) => Object.values(require(path.join(dataRoot,
  `sample-v001/merchant-outlets/${pack.slug}/commerce/records/circaLocal${issuerTitle(pack)}Outlet${name}Data.js`)));
const payload = (pack, kind, name) => require(path.join(dataRoot,
  `sample-v001/merchant-outlets/${pack.slug}/${kind}/records/${name}.json`));
const sectionCodes = proposal.issuerPacks.flatMap(pack =>
  [pack.commerceSection, pack.publicationSection, pack.openingSection]);
const coordinatedRoleSections = ["circaLocalDemoCreditStaffAssignment", "circaLocalOpeningStaffAssignments"];

test("nine explicit portable additions retain current payload hashes and separate frozen historical seals", () => {
  const laterRefundSections = ["circaLocalUnusedRefundExceptionRole", "circaLocalUnusedRefundExceptionStaffAssignment"];
  assert.equal(sha(JSON.stringify(Object.fromEntries(laterRefundSections.map(code => [code, historicalSection(code)])))),
    "71062dcc473c480b1498d24bba2325481865b4997415a2b7396df0d673c0388c");
  const before = require("./fixtures/circaPreExtractionManifest.json");
  const prior = { ...before, sections: Object.fromEntries(Object.entries(before.sections)
    .filter(([code]) => !sectionCodes.includes(code) && !coordinatedRoleSections.includes(code) && !["circaLocalDemoCreditRole", "circaLocalOpeningRole"].includes(code) && !laterRefundSections.includes(code))
    .map(([code]) => [code, historicalSection(code)])) };
  assert.equal(sha(JSON.stringify(prior)), "57a73a6ac5486624d3889943946631fd6a6bc75dd2889be0999f8ebe18d8cce7");
  assert.equal(sectionCodes.length, 9);
  const claimed = new Set();
  for (const [code, section] of Object.entries(manifest.sections)) {
    for (const [file, hash] of Object.entries(section.files || {})) {
      assert.equal(sha(fs.readFileSync(path.join(dataRoot, file))), hash, file);
      if (!sectionCodes.includes(code)) continue;
      assert(!claimed.has(file)); claimed.add(file);
      assert(file.startsWith("sample-v001/merchant-outlets/"));
    }
    if (!sectionCodes.includes(code)) continue;
    assert.equal(section.kind, "DATA_RELEASE");
    assert.equal(section.dataType, "sample");
    assert.equal(section.sourceRoot, "sample-v001");
    assert.equal(section.version, "0.0.1");
    assert.equal(section.selectionPolicy, "EXPLICIT");
    assert.equal(section.versioningPolicy, "IMMUTABLE");
    assert.deepEqual(section.environmentScope, ["ALL"]);
  }
  assert.equal(claimed.size, 33);
  const approvedBytes = fs.readFileSync(path.join(__dirname, "fixtures/circaMonetaryOutletProposalApproved20261009.json"));
  assert.equal(sha(approvedBytes), selection.approval.proposalSha256, "Retained human approval binds the original bytes");
  const approved = JSON.parse(approvedBytes);
  assert.deepEqual({ ...proposal, sourceTerms: { ...proposal.sourceTerms, sha256: approved.sourceTerms.sha256 } }, approved,
    "Only the explicit current source-byte reference changed; all approved business terms and approval evidence remain exact");
  assert.equal(selection.approval.independentOwnerGatesWaived, false);
  assert.equal(selection.approval.operationalAuthority, false);
});

test("ordinary goods pass real placement preflight without adding missing Product/Pricing/Tax validators", async t => {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const runtime = loadRuntime("commerceStagedServer", "kickoffLocal");
  const imports = require(path.join(frameworkRoot,
    "nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService"));
  global.CONFIG = { get: key => runtime[key] };
  global.NODICS = { getRawModule: () => ({ path: path.resolve(__dirname, "..") }) };
  global.SERVICE = { DefaultInventoryOperationService: owner("inventory", "defaultInventoryOperationService") };
  global.CLASSES = { DataImportError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  for (const domain of ["product", "pricing", "tax"])
    assert.equal(runtime.data.dataReleases.targetValidators[domain], undefined);
  for (const pack of proposal.issuerPacks) {
    const section = manifest.sections[pack.commerceSection];
    const release = imports.inspectManifest({ name: "circa.ewaste", index: "3100.90" }, "sample",
      path.join(dataRoot, "manifest.json"), section, pack.commerceSection, true);
    assert.equal(await imports.validateReleaseTargets(release, "default"), true);
    const header = require(path.join(dataRoot,
      `sample-v001/merchant-outlets/${pack.slug}/commerce/headers/circaLocalOutletHeader.js`));
    const unsupported = structuredClone(header);
    for (const entries of Object.values(unsupported))
      for (const entry of Object.values(entries)) entry.options.enterpriseCode = pack.issuerEnterpriseCode;
    const rejected = Object.create(imports);
    rejected.requireReleaseFile = () => unsupported;
    await assert.rejects(rejected.validateReleaseTargets(release, "default"),
      error => error.code === "ERR_IMP_00003" && /placement validator is unavailable/.test(error.message));
  }
});

test("owner-bound headers import only four ordinary goods with exact prices, bilingual text and warehouse policy", () => {
  const names = { product: ["Product", "ProductVariant", "ProductLocalization", "ProductVariantLocalization"],
    pricing: ["PriceBook", "PriceRow"], tax: ["TaxPolicy"], inventory: ["Warehouse"] };
  for (const pack of proposal.issuerPacks) {
    const goods = proposal.outletGoods.filter(g => g.issuerEnterpriseCode === pack.issuerEnterpriseCode);
    const header = require(path.join(dataRoot, `sample-v001/merchant-outlets/${pack.slug}/commerce/headers/circaLocalOutletHeader.js`));
    assert.deepEqual(Object.keys(header).sort(), Object.keys(names).sort());
    assert.equal(Object.keys(manifest.sections[pack.commerceSection].files).length, 9);
    for (const [domain, families] of Object.entries(names)) {
      assert.equal(Object.keys(header[domain]).length, families.length);
      for (const family of families) {
        const prefix = `circaLocal${issuerTitle(pack)}Outlet${family}Data`;
        assert.deepEqual(header[domain][prefix], { options: { enabled: true,
          schemaName: family[0].toLowerCase() + family.slice(1), operation: "saveAll", dataFilePrefix: prefix }, query: { code: "$code" } });
        for (const row of rows(pack, family)) {
          assert.equal(row.tenant, "default");
          assert.equal(row.enterpriseCode, pack.issuerEnterpriseCode);
          assert.equal(row.revision, 1);
          assert.equal(row.active, true);
          for (const key of ["productType", "fulfillmentStrategy", "digitalDeliveryType", "sellerAuthorizations", "available", "reserved", "allocated"])
            assert.equal(row[key], undefined, `${family}.${key}`);
        }
      }
    }
    assert.deepEqual(rows(pack, "PriceBook").map(row => [row.code, row.currency, row.validFrom]),
      [[pack.priceBookCode, "AED", proposal.commonSourceValues.validFrom]]);
    assert.deepEqual(rows(pack, "TaxPolicy").map(row => [row.code, row.jurisdiction, row.taxCode, row.rate]),
      [[pack.taxPolicyCode, "CIRCA_LOCAL_DEMO", "LOCAL_DEMO_ZERO", "0"]]);
    assert.equal(rows(pack, "Product").length, goods.length);
    assert.equal(rows(pack, "ProductVariant").length, goods.length);
    assert.equal(rows(pack, "ProductLocalization").length, goods.length * 2);
    assert.equal(rows(pack, "ProductVariantLocalization").length, goods.length * 2);
    assert.equal(rows(pack, "PriceRow").length, goods.length);
    assert.equal(rows(pack, "Warehouse").length, goods.length);
    for (const good of goods) {
      const product = rows(pack, "Product").find(row => row.code === good.productCode);
      assert.equal(product.name, good.name);
      assert.equal(product.catalogVersion, "circaLocalOutletStaged");
      assert.equal(product.status, "ACTIVE");
      const variant = rows(pack, "ProductVariant").find(row => row.productCode === good.productCode);
      assert.equal(variant.code, good.variantCode);
      assert.equal(variant.sku, good.sku);
      assert.deepEqual(variant.attributes, { sample: true, localDemoOnly: true });
      assert.deepEqual(rows(pack, "PriceRow").filter(row => row.productCode === good.productCode).map(row =>
        [row.code, row.priceBookCode, row.unitAmount, row.currency, row.minQuantity, row.variantCode]),
      [[good.priceRowCode, pack.priceBookCode, good.unitAmount, "AED", "1", undefined]]);
      for (const locale of ["en", "ar"]) {
        const localized = rows(pack, "ProductLocalization").find(row => row.productCode === product.code && row.locale === locale);
        assert.equal(localized.name, good.localizedNames[locale]);
        assert.equal(localized.status, "READY");
        assert.deepEqual(localized.attributes, variant.attributes);
        const localizedVariant = rows(pack, "ProductVariantLocalization").find(row => row.variantCode === variant.code && row.locale === locale);
        assert.equal(localizedVariant.productCode, product.code);
        assert.deepEqual(localizedVariant.attributes, {});
      }
      const warehouse = rows(pack, "Warehouse").find(row => row.code === good.warehouseCode);
      assert.equal(warehouse.storeCode, good.storeCode);
      assert.deepEqual(warehouse.fulfillmentTypes, ["SHIP_TO_HOME"]);
      assert.equal(warehouse.pickupEnabled, false);
      assert.equal(warehouse.priority, 1);
    }
  }
});

test("14 new governed roots have exact issuer-bound Product inputs and owner-captured financial pins", async t => {
  const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS };
  t.after(() => Object.assign(global, prior));
  global.CONFIG = { get: () => ({ publication: { runtimeRole: "STAGED", sourceVersioningQualified: true } }) };
  global.UTILS = { createModelName: name => name };
  const roots = new Set();
  for (const pack of proposal.issuerPacks) {
    const plan = payload(pack, "publication", "publicationPlan");
    assert.equal(plan.contractVersion, 1);
    assert.equal(plan.items.length, pack.uniquePublicationRoots);
    const goods = proposal.outletGoods.filter(g => g.issuerEnterpriseCode === pack.issuerEnterpriseCode);
    const expected = [ ...goods.map(g => ["product", g.productCode]), ["priceBook", pack.priceBookCode],
      ["taxPolicy", pack.taxPolicyCode], ...goods.map(g => ["warehouse", g.warehouseCode]) ];
    assert.deepEqual(plan.items.map(item => [item.rootType, item.rootCode]), expected);
    for (const item of plan.items) {
      assert(!roots.has(item.code)); roots.add(item.code);
      assert.equal(item.input.publicationCode, item.code);
      if (item.domain === "product") {
        const good = goods.find(g => g.productCode === item.rootCode);
        assert.equal(item.sourceVersion, "1");
        assert.deepEqual(item.input, { publicationCode: item.code, productCode: good.productCode, storeCode: good.storeCode, versionId: 0 });
        continue;
      }
      const title = item.domain[0].toUpperCase() + item.domain.slice(1);
      const publication = owner(item.domain, `default${title}PublicationService`);
      const sources = Object.fromEntries(item.input.references.map(ref => [ref.schema,
        rows(pack, ref.schema[0].toUpperCase() + ref.schema.slice(1))]));
      global.NODICS = { getModels: () => Object.fromEntries(Object.keys(sources).map(schema =>
        [schema, { versioned: true, rawSchema: { versionedReadMode: "CURRENT" } }])) };
      global.SERVICE = {};
      const retained = new Map();
      for (const suffix of ["Release", "Pointer", "Receipt"])
        global.SERVICE[`Default${title}Policy${suffix}Service`] = {
          get: async request => ({ result: retained.has(request.query.code) ? [retained.get(request.query.code)] : [] }),
          save: async request => { retained.set(request.model.code, structuredClone(request.model)); },
          update: async () => { assert.fail("Source capture must remain insert-only"); },
        };
      for (const [schema, data] of Object.entries(sources))
        global.SERVICE[`Default${schema[0].toUpperCase() + schema.slice(1)}Service`] = {
          get: async request => ({ result: data.map(row => ({ ...row, versionId: 0 }))
            .filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value)) }),
        };
      const request = { tenant: "default", enterpriseCode: pack.issuerEnterpriseCode };
      const capture = await publication.capture(request, item.input);
      assert.equal(capture.code, item.sourceVersion);
      if (item.domain === "pricing")
        assert.deepEqual(capture.payload.records.filter(row => row.schema === "priceRow").map(row => row.policy.code).sort(),
          goods.map(g => g.priceRowCode).sort());
      await assert.rejects(publication.capture({ ...request, enterpriseCode: "FOREIGN" }, item.input), /Exact policy version unavailable/);
    }
    for (const sectionCode of [pack.commerceSection, pack.publicationSection]) {
      const section = manifest.sections[sectionCode];
      assert.equal(section.lifecycle, "PUBLISHABLE");
      assert.equal(section.destinationRole, "COMMERCE_STAGED");
      assert.equal(section.publicationPolicy, "REQUIRED");
      assert.equal(section.initialPublicationPolicy, "ADMIN_INITIATED");
    }
  }
  assert.equal(roots.size, 14);
});

test("opening packs carry only four canonical first-intake instructions with no stock snapshots", () => {
  const inventory = owner("inventory", "defaultInventoryOpeningReceiptService");
  const identities = new Set();
  for (const pack of proposal.issuerPacks) {
    const section = manifest.sections[pack.openingSection];
    assert.equal(section.installer, "INVENTORY_OPENING_RECEIPTS");
    assert.equal(section.lifecycle, "OPERATIONAL_VERSIONED");
    assert.equal(section.destinationRole, "COMMERCE");
    assert.equal(section.publicationPolicy, "NONE");
    assert.equal(section.initialPublicationPolicy, "NONE");
    const input = payload(pack, "operations", "inventoryOpening");
    assert.deepEqual(Object.keys(input).sort(), ["contractVersion", "receipts"]);
    assert.equal(input.contractVersion, 1);
    const expected = proposal.outletGoods.filter(g => g.issuerEnterpriseCode === pack.issuerEnterpriseCode).map(g =>
      ({ code: g.openingReceiptCode, storeCode: g.storeCode, locale: "en", warehouseCode: g.warehouseCode,
        productCode: g.productCode, variantCode: g.variantCode, sku: g.sku, quantity: "100", referenceCode: "CIRCA-LOCAL-OUTLET-OPENING-001" }));
    assert.deepEqual(input.receipts, expected);
    for (const receipt of input.receipts) {
      assert.deepEqual(inventory.instruction(receipt), receipt);
      assert(!identities.has(receipt.warehouseCode + ":" + receipt.sku));
      identities.add(receipt.warehouseCode + ":" + receipt.sku);
    }
  }
  assert.equal(identities.size, 4);
});

test("all nine monetary cases price the actual new source goods through the exact-money owners", t => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const exact = owner("pricing", "defaultExactAmountService");
  const prices = owner("pricing", "defaultPriceSelectionService");
  const decision = owner("pricing", "defaultPricingDecisionService");
  const benefit = owner("promotion", "defaultPromotionMerchantBenefitService");
  const tax = owner("tax", "defaultTaxDecisionEngineService");
  global.SERVICE = { DefaultExactAmountService: exact };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  for (const scenario of proposal.monetaryCases) {
    const good = proposal.outletGoods.find(g => g.storeCode === scenario.storeCode);
    const pack = proposal.issuerPacks.find(p => p.issuerEnterpriseCode === good.issuerEnterpriseCode);
    const request = { tenant: "default", enterpriseCode: pack.issuerEnterpriseCode, storeCode: good.storeCode,
      productCode: good.productCode, currency: "AED", quantity: "1", now: "2026-10-09T00:00:00.000Z" };
    const selected = prices.select(request, rows(pack, "PriceBook"), rows(pack, "PriceRow"), exact);
    assert.deepEqual(selected.conflicts, []);
    const priced = decision.decide(request, selected.selected, exact);
    const discount = benefit.calculate(priced.totalAmount, { percent: scenario.discountType === "PERCENT",
      declared: scenario.declared, ...(scenario.minimumSubtotal === null ? {} : { minimum: scenario.minimumSubtotal }),
      ...(scenario.cap === null ? {} : { cap: scenario.cap }) });
    const net = exact.add(priced.totalAmount, exact.multiply(discount, "-1"));
    assert.deepEqual([priced.totalAmount, discount, net], [scenario.expectedSubtotal, scenario.expectedDiscount, scenario.expectedNet]);
    assert.equal(tax.calculate({ ...request, jurisdiction: "CIRCA_LOCAL_DEMO", taxableAmount: net },
      rows(pack, "TaxPolicy")[0], exact).taxAmount, "0");
    assert.equal(prices.select({ ...request, enterpriseCode: "GREENPERKS_ONLINE" }, rows(pack, "PriceBook"), rows(pack, "PriceRow"), exact).selected, undefined);
    assert.equal(prices.select({ ...request, currency: "POINTS" }, rows(pack, "PriceBook"), rows(pack, "PriceRow"), exact).selected, undefined);
  }
});

test("native fresh setup exposes all goods and bounded role stages and rejects the superseded observation revision", t => {
  const savedGlobals = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, savedGlobals));
  const runtime = loadRuntime("platformServer", "kickoffLocal");
  const initialization = require(path.join(frameworkRoot,
    "nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService"));
  const observer = require(path.join(frameworkRoot,
    "nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupObservationService"));
  const imports = require(path.join(frameworkRoot,
    "nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService"));
  const config = runtime.backofficeApplicationInitialization;
  const profile = { ...config.profiles.circa, target: { ...config.target, ...config.profiles.circa.target } };
  const steps = initialization.preparationSteps(profile);
  const publications = steps.filter(step => step.type === "GOVERNED_PUBLICATIONS");
  const expectedPublications = [
    ["circaCataloguePublicationPlan", "GREENPERKS_ONLINE", 46],
    ["circaGreenPerksL08PublicationPlan", "GREENPERKS_RETAIL", 35],
    ["circaRenewWorksL08PublicationPlan", "RENEWWORKS_REPAIR_REUSE", 2],
    ["circaLoopCycleL08PublicationPlan", "LOOPCYCLE_RECYCLING", 1],
    ["circaGreenPerksOutletPublicationPlan", "GREENPERKS_RETAIL", 6],
    ["circaRenewWorksOutletPublicationPlan", "RENEWWORKS_REPAIR_REUSE", 4],
    ["circaLoopCycleOutletPublicationPlan", "LOOPCYCLE_RECYCLING", 4],
  ];
  assert.deepEqual(publications.map(step => step.code).sort(),
    expectedPublications.map(([code]) => "circa.ewaste:" + code).sort());
  for (const [code, enterprise, roots] of expectedPublications) {
    const step = publications.find(step => step.code === "circa.ewaste:" + code);
    assert.equal(step.required, true, code);
    assert.equal(step.phase, "AFTER_PUBLICATION", code);
    assert.equal(step.operatorEnterpriseCode, enterprise, code);
    assert.equal(step.publicationPlan.items.length, roots, code);
  }
  const groups = initialization.preparationGroups(profile, {}, steps.filter(step => step.phase === "BEFORE_PUBLICATION"));
  const order = groups.flatMap(group => group.steps.map(step => step.code));
  const predecessor = require("../config/setup-observation/history/circa-native-reviewed-revision-3.json");
  const previousObservation = require("../config/setup-observation/history/circa-native-reviewed-revision-7.json");
  const selectedPlan = runtime.publish.setup.observation.plans["circa-native-reviewed"];
  const plan = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", selectedPlan.path), "utf8"));
  assert.equal(predecessor.revision, 3);
  assert.equal(previousObservation.revision, 7);
  assert.equal(plan.revision, runtime.publish.setup.observation.plans[plan.code].revision);
  assert(plan.revision > previousObservation.revision);
  const retained = require("../config/setup-observation/history/circa-native-reviewed-revision-4.json");
  const historical = require("../config/setup-observation/history/circa-native-reviewed-revision-18.json");
  assert.notEqual(historical.profileDigest, observer.digest(profile));
  assert.equal(plan.profileDigest, observer.digest(profile));
  const corrected = new Set(proposal.issuerPacks.map(pack => "circa.ewaste:" + pack.commerceSection));
  for (const original of predecessor.stages) {
    const current = retained.stages.find(stage => stage.code === original.code);
    if (!corrected.has(original.code)) assert.deepEqual(current, original);
    else {
      assert.deepEqual({ ...current, release: original.release }, original);
      assert.deepEqual({ ...current.release, checksum: original.release.checksum }, original.release);
      assert.notEqual(current.release.checksum, original.release.checksum);
    }
  }
  global.CONFIG = { get: key => runtime[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.SERVICE = { DefaultPublicationSetupObservationService: { ...observer,
    resolvePlan: () => ({ plan: historical, reference: { moduleName: profile.owner } }) } };
  assert.throws(() => initialization.setupObservationPlan(profile, { tenant: runtime.defaultTenant }),
    { code: "ERR_BOF_00081" }, "Real BackOffice refuses the historical profile before any owner dispatch");
  for (const code of [...sectionCodes, ...coordinatedRoleSections, "circaLocalDemoCredit"]) {
    const releaseCode = "circa.ewaste:" + code;
    const step = steps.find(step => step.code === releaseCode);
    assert(step, releaseCode);
    assert.equal(step.required, true);
    assert.equal(step.trigger, "USER");
    const stage = plan.stages.find(stage => stage.code === releaseCode);
    const descriptor = observer.stepIdentity(step);
    if (code === "circaLocalDemoCredit") {
      assert.equal(stage.server, "commerceServer");
      const receiver = loadRuntime(descriptor.targetServer, "kickoffLocal");
      assert.equal(descriptor.targetServer, "commerceServer");
      assert.equal(receiver.data.dataReleases.installers.LOYALTY_SAMPLE_CREDITS,
        "DefaultLoyaltySampleCreditContributionService");
      assert.equal(descriptor.targetRuntimeRole, receiver.runtimeRole.code);
    }
    assert.deepEqual(stage.descriptor, descriptor);
    if (step.type !== "DATA_RELEASE") continue;
    const actual = imports.inspectManifest({ name: "circa.ewaste", index: "3100.90" }, "sample",
      path.join(dataRoot, "manifest.json"), manifest.sections[code], code, true);
    assert.equal(stage.release.checksum, actual.checksum);
    assert.deepEqual(stage.release.declaredFiles, actual.declaredFiles);
    assert.deepEqual(actual.declaredFiles, Object.keys(manifest.sections[code].files).sort(), "No sibling issuer file may expand into this release");
  }
  for (const [role, staff] of [["loyaltyWallet:specialAccessRoles", "circaLocalDemoCreditStaffAssignment"],
    ["import:specialAccessRoles", "circaLocalDemoCreditStaffAssignment"],
    ["inventory:specialAccessRoles", "circaLocalOpeningStaffAssignments"]]) {
    assert(order.indexOf("circa.ewaste:operations") < order.indexOf("circa.ewaste:" + staff));
    assert(order.indexOf(role) < order.indexOf("circa.ewaste:" + staff));
  }
  for (const pack of proposal.issuerPacks) {
    const commerce = steps.find(step => step.code === "circa.ewaste:" + pack.commerceSection);
    const publication = steps.find(step => step.code === "circa.ewaste:" + pack.publicationSection);
    const opening = steps.find(step => step.code === "circa.ewaste:" + pack.openingSection);
    assert.equal(commerce.phase, "BEFORE_PUBLICATION");
    assert.equal(commerce.targetRuntimeRole, "COMMERCE_STAGED");
    assert.equal(publication.phase, "AFTER_PUBLICATION");
    assert.equal(opening.phase, "AFTER_PUBLICATION");
    assert.equal(publication.operatorEnterpriseCode, pack.issuerEnterpriseCode);
    assert.equal(opening.operatorEnterpriseCode, pack.issuerEnterpriseCode);
    assert(publication.order < opening.order);
  }
  const nativeDelivery = loadRuntime("commerceServer", "kickoffLocal");
  for (const good of proposal.outletGoods) {
    const pack = proposal.issuerPacks.find(p => p.issuerEnterpriseCode === good.issuerEnterpriseCode);
    assert(nativeDelivery.product.discovery.activationScopes.some(scope => scope.tenant === "default" && scope.storeCode === good.storeCode));
    for (const [domain, root] of [["pricing", pack.priceBookCode], ["tax", pack.taxPolicyCode], ["inventory", good.warehouseCode]])
      assert.deepEqual(nativeDelivery[domain].publication.delivery.rootCodesByStore[good.storeCode], [root]);
  }
  const dockerSteps = initialization.preparationSteps(loadRuntime("platformServer", "kickoffDockerLocal").backofficeApplicationInitialization.profiles.circa);
  assert(!dockerSteps.some(step => [...sectionCodes, ...coordinatedRoleSections].includes(step.code.split(":")[1])));
});

test("inert setup steps and outlet-only delivery declarations consume current owner selection contracts", async t => {
  const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, prior));
  assert.equal(selection.selectionOnly, true);
  assert.equal(selection.declarationsAreOutletOnly, true);
  const initialization = require(path.join(frameworkRoot,
    "nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService"));
  assert.deepEqual(selection.steps.map(step => step.code).sort(), sectionCodes.map(code => "circa.ewaste:" + code).sort());
  for (const [index, step] of selection.steps.entries()) {
    const normalized = initialization.normalizePreparationStep(step, index);
    assert.equal(normalized.required, true);
    assert.equal(normalized.trigger, "USER");
    if (step.phase === "AFTER_PUBLICATION") assert(proposal.issuerPacks.some(pack => pack.issuerEnterpriseCode === step.operatorEnterpriseCode));
  }
  const delivery = selection.deliveryDeclarations;
  const discoveryPolicy = delivery.product.runtimeRoleProfiles.COMMERCE.discovery;
  assert.equal(discoveryPolicy.activationService, "DefaultProductPublicationTargetService");
  assert.deepEqual(discoveryPolicy.activationScopes.value, proposal.outletGoods.map(g => ({ tenant: "default", storeCode: g.storeCode })));
  global.SERVICE = { DefaultProductPublicationTargetService: { activeVersions: async request => [request.storeCode] } };
  const discovery = owner("product", "defaultProductDiscoveryService");
  global.CONFIG = { get: () => ({ discovery: { ...discoveryPolicy, activationScopes: discoveryPolicy.activationScopes.value } }) };
  for (const good of proposal.outletGoods)
    assert.deepEqual(await discovery.activeSelection({ tenant: "default", enterpriseCode: good.issuerEnterpriseCode, storeCode: good.storeCode }), [good.storeCode]);
  assert.equal(await discovery.activeSelection({ tenant: "default", storeCode: "circaMainStore" }), undefined);
  for (const domain of ["pricing", "tax", "inventory"]) {
    const configured = delivery[domain].runtimeRoleProfiles.COMMERCE.publication.delivery;
    const resolved = { enabled: configured.enabled, storeCodes: configured.storeCodes.value,
      rootCodesByStore: configured.rootCodesByStore.value };
    assert.deepEqual(resolved.storeCodes, proposal.outletGoods.map(g => g.storeCode));
    global.CONFIG = { get: () => ({ publication: { delivery: resolved } }) };
    const publication = owner(domain, `default${domain[0].toUpperCase() + domain.slice(1)}PublicationService`);
    for (const good of proposal.outletGoods) {
      const pack = proposal.issuerPacks.find(p => p.issuerEnterpriseCode === good.issuerEnterpriseCode);
      assert.deepEqual(publication.deliveryRoots({ storeCode: good.storeCode }),
        [domain === "pricing" ? pack.priceBookCode : domain === "tax" ? pack.taxPolicyCode : good.warehouseCode]);
    }
    assert.equal(publication.deliveryEnabled({ storeCode: "circaMainStore" }), false);
    assert.equal(publication.deliveryEnabled({ storeCode: "agoraApparelStore" }), false);
  }
  for (const issuer of selection.issuers) {
    const pack = proposal.issuerPacks.find(p => p.issuerEnterpriseCode === issuer.operatorEnterpriseCode);
    assert.deepEqual(issuer.commerceRequest, { releaseCodes: ["circa.ewaste:" + pack.commerceSection],
      expectedReleases: { ["circa.ewaste:" + pack.commerceSection]: "0.0.1" } });
    assert.deepEqual(issuer.openingRequest, { releaseCodes: ["circa.ewaste:" + pack.openingSection],
      expectedReleases: { ["circa.ewaste:" + pack.openingSection]: "0.0.1" } });
    const publicationStep = selection.steps.find(step => step.code === "circa.ewaste:" + pack.publicationSection);
    assert.deepEqual(publicationStep.publicationPlan, payload(pack, "publication", "publicationPlan"));
  }
});
