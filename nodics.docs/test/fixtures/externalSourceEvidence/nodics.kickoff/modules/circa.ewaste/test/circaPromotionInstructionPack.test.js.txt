/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaPromotionInstructionPack @description Verifies approved Circa source terms, immutable issuer instructions and canonical owner reads without installed or live acceptance claims. @layer test @owner circa.ewaste */
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const moduleRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(moduleRoot, "data");
const framework = path.resolve(moduleRoot, "../../../nodics.ai");
const promotionRoot = path.join(framework, "nodics.commerce/modules/baseCommerce/modules/promotion");
const publication = require(path.join(promotionRoot, "src/service/defaultPromotionPublicationService"));
test.beforeEach(t => {
  const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, prior));
  global.CONFIG = { get: () => require(path.join(promotionRoot, "config/properties")).promotion };
  global.SERVICE = { DefaultCouponOfferService: require(path.join(promotionRoot, "src/service/defaultCouponOfferService")) };
});
const setup = require(path.join(promotionRoot, "src/service/defaultPromotionSetupContributionService"));
const proposal = require("./fixtures/circaDemoPolicyProposal.json");
const manifest = require("../data/manifest.json");
const plan = require("../data/sample-v001/publication/records/publicationPlan.json");
const policies = Object.values(require("./fixtures/history/circaPromotionReviewedData"));
const stores = Object.values(require("../data/sample-v001/store/records/circaStoreData"));
const groups = [["GreenPerks", "greenperks", "GREENPERKS_RETAIL"],
  ["RenewWorks", "renewworks", "RENEWWORKS_REPAIR_REUSE"],
  ["LoopCycle", "loopcycle", "LOOPCYCLE_RECYCLING"]];
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const shortCode = row => row.code.replace("CIRCA_COUPON_", "").replace(/_PROMO$/, "");
const payload = section => JSON.parse(fs.readFileSync(path.join(dataRoot, Object.keys(section.files)[0]), "utf8"));
const checksum = section => sha(Object.keys(section.files).sort().map(file => file + ":" + section.files[file]).join("|"));

test("approved policies retain every exact budget, item bundle, issuer and outlet without live consent", () => {
  assert.equal(policies.length, 38);
  for (const row of policies) {
    const short = shortCode(row), original = proposal.originalOffers.find(item => item.campaign === short);
    const issuer = original?.issuerEnterprise || proposal.greenPerks.issuerEnterprise;
    for (const key of ["enterpriseRef", "issuerEnterpriseRef", "vendorEnterpriseRef"])
      assert.deepEqual(row[key], { moduleName: "profile", schemaName: "enterprise",
        code: key === "vendorEnterpriseRef" ? proposal.marketplaceEnterprise : issuer });
    assert.equal(row.enterpriseCode, issuer);
    assert.deepEqual(row.budget, { limit: original?.budget || proposal.greenPerks.monetaryBudgets[short] || "0" });
    assert.equal(row.sellerAuthorizations, undefined);
    assert.equal(row.budgetAdmission, undefined);
    assert.equal(row.purchasedCouponPolicy, undefined);
    assert.deepEqual(row.couponOffer.expiry, { mode: "FIXED", at: "2026-11-08T19:59:59.999Z" });
    if (original) {
      assert.deepEqual(row.conditions.storeCodes, [original.outlet]);
      assert.equal(row.actions.discountValue, original.percent || original.amount);
      assert.equal(row.actions.maximumDiscountAmount, original.maximumDiscountAmount);
    }
    if (proposal.greenPerks.itemsByCampaign[short]) {
      assert.deepEqual(row.actions.items, proposal.greenPerks.itemsByCampaign[short].map(item => ({ ...item, unit: "EACH" })));
      assert(row.couponOffer.terms.includes("Exact listed SKU quantities only; no substitutions."));
    }
    for (const code of row.conditions.storeCodes) assert.equal(stores.find(store => store.code === code)?.enterpriseRef.code, issuer);
  }
  assert.equal(stores.find(row => row.code === proposal.marketplaceStore).enterpriseRef.code, proposal.marketplaceEnterprise);
});

test("each issuer has a budget-only original and exact replay-only issuance of 100 units per campaign", () => {
  const covered = [], batches = new Set(), commands = new Set();
  assert.equal(manifest.sections["commerce-operational"], undefined);
  for (const [title, , issuer] of groups) {
    const budgetSection = manifest.sections[`circa${title}Budget`], issuanceSection = manifest.sections[`circa${title}Issuance`];
    const budget = payload(budgetSection), issuance = payload(issuanceSection);
    assert.deepEqual(budget.couponBatches, []);
    assert.equal(budget.campaigns.length, policies.filter(row => row.enterpriseCode === issuer).length);
    assert.equal(issuance.couponBatches.length, budget.campaigns.length);
    for (const campaign of budget.campaigns) {
      const row = policies.find(row => row.code === campaign.promotionCode);
      assert.equal(row.enterpriseCode, issuer);
      assert.equal(campaign.storeCode, proposal.marketplaceStore);
      const policy = publication.capturePolicy("promotion", { ...row, versionId: 0 }, { tenant: row.tenant, enterpriseCode: issuer });
      assert.equal(campaign.policyFingerprint, publication.fingerprint(policy));
      assert.deepEqual(issuance.campaigns.find(item => item.promotionCode === row.code), { ...campaign,
        admissionContribution: { moduleName: "circa.ewaste", releaseCode: `circa.ewaste:circa${title}Budget`,
          version: "0.0.1", checksum: checksum(budgetSection) } });
      covered.push(row.code);
    }
    for (const intent of issuance.couponBatches) {
      assert.deepEqual(Object.keys(intent).sort(), ["batchCode", "commandReference", "promotionCode", "quantity"]);
      assert.equal(intent.quantity, proposal.quantityPerCouponCampaign);
      assert(!batches.has(intent.batchCode)); batches.add(intent.batchCode);
      assert(!commands.has(intent.commandReference)); commands.add(intent.commandReference);
    }
    for (const section of [budgetSection, issuanceSection]) {
      assert.equal(section.installer, "PROMOTION_CAMPAIGN_ISSUANCE");
      assert.equal(section.selectionPolicy, "EXPLICIT");
      assert.equal(section.lifecycle, "OPERATIONAL_VERSIONED");
      assert.equal(section.destinationRole, "COMMERCE");
      assert.equal(section.version, "0.0.1");
      assert.deepEqual(section.environmentScope, ["ALL"]);
      assert.equal(Object.keys(section.files).length, 1);
      for (const [file, hash] of Object.entries(section.files)) assert.equal(sha(fs.readFileSync(path.join(dataRoot, file))), hash);
      const text = JSON.stringify(payload(section));
      for (const forbidden of ["sellerAuthorizations", "protectedToken", "tokenHash", "authData", "enterpriseCode", "spent", "approval"])
        assert(!text.includes(`"${forbidden}"`), forbidden);
    }
  }
  assert.deepEqual(covered.sort(), policies.map(row => row.code).sort());
  assert.equal(batches.size, 38);
  assert.equal(policies.reduce((sum, row) => sum + BigInt(row.budget.limit), 0n), 25500n);
  assert.equal(groups.flatMap(([title]) => payload(manifest.sections[`circa${title}Issuance`]).couponBatches)
    .reduce((sum, row) => sum + row.quantity, 0), 3800);
});

test("four independently signed publication plans preserve all 84 roots without scope overrides", () => {
  const subsets = [payload(manifest.sections.circaCataloguePublicationPlan),
    ...groups.map(([title]) => payload(manifest.sections[`circa${title}PublicationPlan`]))];
  const items = subsets.flatMap(subset => subset.items);
  assert.equal(items.length, 84);
  assert.equal(new Set(items.map(item => item.code)).size, 84);
  assert.deepEqual(items.slice().sort((a, b) => a.code.localeCompare(b.code)), plan.items.slice().sort((a, b) => a.code.localeCompare(b.code)));
  for (const item of items) assert.deepEqual(Object.keys(item).sort(), ["code", "domain", "input", "rootCode", "rootType", "sourceVersion"]);
});

test("all six setup payloads pass the actual nImport exact-byte reader and Promotion bounded parser", async t => {
  const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, prior));
  const ports = require(path.join(framework, "nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution"))({
    modules: { "circa.ewaste": { name: "circa.ewaste", path: moduleRoot } }, runtimeRole: "COMMERCE", environment: "kickoffLocal" });
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  const get = CONFIG.get;
  CONFIG.get = key => key === "promotion" ? { budgetAdmission: { maximumCampaignsPerContribution: 50 } } : get(key);
  CONFIG.get("data").dataReleases.installers.PROMOTION_CAMPAIGN_ISSUANCE = "DefaultPromotionSetupContributionService";
  SERVICE.DefaultPromotionSetupContributionService = setup;
  SERVICE.DefaultDataReleaseService = ports.service;
  const discovered = ports.service.discoverReleases("sample");
  for (const [title] of groups) for (const phase of ["Budget", "Issuance"]) {
    const contribution = discovered.find(row => row.sectionCode === `circa${title}${phase}`);
    assert(contribution && !contribution.invalidManifest);
    assert.deepEqual(await setup.payload({ contribution }), payload(manifest.sections[contribution.sectionCode]));
    await assert.rejects(() => setup.payload({ contribution: { ...contribution, checksum: "0".repeat(64) } }), /invalid|changed/);
  }
  assert.equal(ports.imports.length, 0);
  assert.equal(ports.installations.length, 0);
});

test("retired operational snapshots and raw tokens are absent from the active release source", () => {
  for (const dir of ["commerce", "commerce-operational"]) for (const name of ["circaCouponData", "circaCouponBatchData", "circaInventoryBalanceData"])
    assert.equal(fs.existsSync(path.join(dataRoot, `sample-v001/${dir}/records/${name}.js`)), false);
  for (const section of Object.values(manifest.sections)) for (const file of Object.keys(section.files || {}))
    assert(!/circa(Coupon|CouponBatch|InventoryBalance)Data\.js$/.test(file));
});

test("canonical policy capture refuses marketplace or another issuer as promotion owner", () => {
  for (const row of policies) for (const enterpriseCode of ["GREENPERKS_ONLINE", "foreignIssuer"])
    assert.throws(() => publication.capturePolicy("promotion", { ...row, versionId: 0 }, { tenant: row.tenant, enterpriseCode }), /enterprise boundary/);
});

test("all exact ITEM source bundles pass the canonical owner shape without claiming delivery", t => {
  const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, prior));
  global.CONFIG = { get: () => ({ merchantBenefits: { enabled: true, qualified: true, itemEvidenceService: "IsolatedItemEvidence" } }) };
  let evaluations = 0;
  global.SERVICE = { IsolatedItemEvidence: { evaluate: () => { evaluations++; throw new Error("No delivery in source test"); } } };
  const items = require(path.join(promotionRoot, "src/service/defaultPromotionItemBenefitService"));
  const campaigns = policies.filter(row => row.actions.benefitType === "ITEM");
  assert.equal(campaigns.length, 29);
  for (const row of campaigns) assert.deepEqual(items.assertPolicy(row), items.items(row.actions.items));
  assert.equal(evaluations, 0);
});

test("declarative signed selections map exact releases and never import the consent review", () => {
  const selections = require("./fixtures/circaPromotionSetupSelections.json");
  assert.equal(selections.operationalAuthority, false);
  assert.equal(selections.scope, proposal.scope);
  assert.equal(selections.marketplace.signedEnterprise, proposal.marketplaceEnterprise);
  assert.equal(selections.consentReview.expiresAt, proposal.sellerConsentExpiry);
  assert.equal(selections.consentReview.grantsImported, false);
  assert.equal(selections.consentReview.benefitConsumption, "ISSUED_COUPON_BENEFIT_V1");
  assert(!JSON.stringify(manifest).includes("circaPromotionSetupSelections"));
  for (const [index, [title, , issuer]] of groups.entries()) {
    assert.deepEqual(selections.issuers[index], { signedEnterprise: issuer,
      publicationRelease: `circa.ewaste:circa${title}PublicationPlan`,
      budgetRelease: `circa.ewaste:circa${title}Budget`, issuanceRelease: `circa.ewaste:circa${title}Issuance` });
  }
});

test("separate issuer review instructions retain exact benefit purpose in the canonical consent projection", () => {
  const review = require("./fixtures/circaIssuerConsentReviewInstructions.json");
  const consent = require(path.join(promotionRoot, "src/service/defaultCouponSellerAuthorizationService"));
  assert.equal(review.operationalAuthority, false);
  assert.equal(review.grantsImported, false);
  assert.equal(review.owner, "DefaultCouponSellerAuthorizationService");
  assert.equal(review.issuers.length, 3);
  for (const row of review.issuers) {
    assert.equal(row.vendorEnterprise, proposal.marketplaceEnterprise);
    assert.equal(row.expiresAt, proposal.sellerConsentExpiry);
    assert.equal(row.benefitConsumption, "ISSUED_COUPON_BENEFIT_V1");
    assert.deepEqual(row.campaignCodes, policies.filter(policy => policy.enterpriseCode === row.signedEnterprise).map(policy => policy.code));
    const projected = consent.project({ sellerEnterpriseCode: row.vendorEnterprise, status: "ACTIVE", revision: 1,
      expiresAt: row.expiresAt, benefitConsumption: row.benefitConsumption });
    assert.equal(projected.benefitConsumption, row.benefitConsumption);
  }
  assert(!JSON.stringify(manifest).includes("circaIssuerConsentReviewInstructions"));
  assert.equal(review.issuers.flatMap(row => row.campaignCodes).length, 38);
});

test("new source captures retain approved fixed terms and fingerprint any expiry change", () => {
  const schema = require(path.join(promotionRoot, "src/schemas/schemas"));
  assert.equal(schema.promotion.promotion.definition.purchasedCouponPolicy.type, "object");
  for (const row of policies) {
    const scope = { tenant: row.tenant, enterpriseCode: row.enterpriseCode };
    const policy = publication.capturePolicy("promotion", { ...row, versionId: 0 }, scope);
    assert.deepEqual(policy.couponOffer, row.couponOffer);
    const changed = publication.capturePolicy("promotion", { ...row, versionId: 0,
      couponOffer: { ...row.couponOffer, expiry: { mode: "FIXED", at: "2026-11-09T19:59:59.999Z" } } }, scope);
    assert.notEqual(publication.fingerprint(changed), publication.fingerprint(policy));
  }
});

test("marketplace catalogue source stays with the approved vendor without changing Waste seller ownership", () => {
  for (const name of fs.readdirSync(path.join(dataRoot, "sample-v001/commerce/records"))) {
    if (!name.endsWith("Data.js") || name === "circaPromotionData.js") continue;
    for (const row of Object.values(require(path.join(dataRoot, "sample-v001/commerce/records", name)))) {
      if (Object.hasOwn(row, "enterpriseCode")) assert.equal(row.enterpriseCode, proposal.marketplaceEnterprise, name);
      if (row.attributes?.kind === "ASSET" && Object.hasOwn(row.attributes, "carbonSettlement"))
        assert.equal(row.attributes.carbonSettlement, proposal.assets.carbon);
    }
  }
  assert.equal(stores.find(row => row.code === proposal.marketplaceStore).enterpriseCode, proposal.marketplaceEnterprise);
});

test("all coupon variants and both variant locales select the exact owner-issued batch identity", () => {
  const intents = groups.flatMap(([title]) => payload(manifest.sections[`circa${title}Issuance`]).couponBatches);
  for (const name of ["ProductVariant", "ProductVariantLocalization"]) {
    const coupons = Object.values(require(`../data/sample-v001/commerce/records/circa${name}Data`))
      .filter(row => row.attributes?.kind === "COUPON");
    assert.equal(coupons.length, name === "ProductVariant" ? 38 : 76);
    for (const row of coupons) {
      const intent = intents.find(item => item.promotionCode === row.attributes.promotionCode);
      assert(intent, row.code);
      assert.equal(row.attributes.couponBatchCode, intent.batchCode);
      assert.equal(row.attributes.demoPurchaseUnits, proposal.quantityPerCouponCampaign);
      assert.equal(row.attributes.inventoryStrategy, "COUPON_CODE_POOL");
    }
  }
});
