/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderProjectIndependenceContract
 * @description Exercises a second customer with unrelated frontend, pack, composition and renderer identities through generation and real disposable starter-runtime qualification.
 * @layer test
 * @owner nTooling
 * @override Preserve explicit source discovery, negative selection coverage and absence of reference-application dependencies.
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const catalogueService = require("../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService");
const guidedService = require("../src/service/applicationBuilder/defaultApplicationBuilderGuidedService");
const planningService = require("../src/service/applicationBuilder/defaultApplicationBuilderPlanningService");
const generationService = require("../src/service/applicationBuilder/defaultApplicationBuilderGenerationService");
const qualificationService = require("../src/service/applicationBuilder/defaultApplicationBuilderQualificationService");
const workspace = require("./helpers/applicationBuilderWorkspace")();
const framework = path.resolve(__dirname, "../../../..");
const metadata = {
  presets: {
    clothing: {
      label: "Independent clothing application",
      explanation: "Customer-selected retail composition.",
      selected: ["nodics.commerce", "apparel"],
      domains: ["APPAREL"],
      excluded: ["electronics", "telco"],
      storefront: "BAZAAR",
      frontends: ["BAZAAR", "CONTROL"],
      composition: "customLook",
      routes: ["/", "/clothing"],
      renderers: ["retail.clothing.card"],
      rendererByDomain: { apparel: "retail.clothing.card" },
      stores: ["boutiqueStore"],
      catalogs: ["boutiqueCatalog"],
      packs: ["clothingData"],
      packDomains: { clothingData: "apparel" },
      journeys: ["retail.discovery"],
      backendRuntimes: ["PLATFORM", "COMMERCE"],
      market: { country: "GB", locale: "en-GB", currency: "GBP" },
    },
  },
  compositions: [
    {
      code: "customLook",
      frontend: "BAZAAR",
      domains: ["apparel"],
      rendererKeys: ["retail.clothing.card"],
      dataPacks: ["clothingData"],
    },
  ],
  frontends: [
    { code: "BAZAAR", role: "Customer storefront" },
    { code: "CONTROL", role: "Customer operations" },
  ],
};
const packagePath = path.join(workspace.customer, "package.json");
fs.writeFileSync(
  packagePath,
  JSON.stringify({
    name: "independent.customer",
    nodics: { applicationBuilder: metadata },
  }),
);
const packRoot = path.join(workspace.customer, "modules", "clothingData");
fs.mkdirSync(packRoot);
fs.writeFileSync(
  path.join(packRoot, "package.json"),
  JSON.stringify({
    name: "clothingData",
    nodics: { applicationBuilder: { dataPack: true } },
  }),
);
const input = {
  framework,
  frontend: workspace.frontend,
  customer: workspace.customer,
};
const catalogue = catalogueService.discover(input);
const answers = guidedService.createAnswersTemplate(
  { projectCode: "boutiqueApp", customerCode: "boutique", preset: "clothing" },
  catalogue,
);
assert.deepStrictEqual(answers.frontends, ["BAZAAR", "CONTROL"]);
assert.strictEqual(answers.market.currency, "GBP");
const guided = guidedService.guide(answers, catalogue);
assert.strictEqual(guided.solution.experience.storefront, "BAZAAR");
assert.deepStrictEqual(guided.solution.commerce.stores, ["boutiqueStore"]);
assert.deepStrictEqual(guided.solution.data.packs, ["clothingData"]);
assert(guided.plan.frontendGraph.nodes.includes("bazaar.customLook"));
const approved = generationService.approvePlan(
  guided.plan,
  "INDEPENDENT-CUSTOMER-TEST",
);
const output = path.join(workspace.root, "generated");
generationService.generate(approved, guided.solution, catalogue, output);
const productData = JSON.parse(
  fs.readFileSync(
    path.join(output, "data/clothingData/products/starter-products.json"),
    "utf8",
  ),
);
assert.strictEqual(
  productData.products[0].domain,
  "apparel",
  "Pack ownership must follow explicit metadata, independent of its spelling",
);
assert.strictEqual(productData.products[0].rendererKey, "retail.clothing.card");
assert(fs.existsSync(path.join(output, "integrations/control-wiring.md")));
const qualification = qualificationService.qualify(
  approved,
  guided.solution,
  catalogue,
  output,
);
assert.strictEqual(qualification.qualified, true);
assert(qualification.gates.includes("generated.runtime"));
const denied = JSON.parse(JSON.stringify(guided.solution));
denied.experience.rendererKeys = ["unavailable.card"];
assert.strictEqual(
  planningService.validateSolution(denied, catalogue).valid,
  false,
);
denied.experience = guided.solution.experience;
denied.topology.frontends.push("UNDECLARED");
assert.strictEqual(
  planningService.validateSolution(denied, catalogue).valid,
  false,
);
const originalCi = process.env.CI;
try {
  process.env.CI = "true";
  assert.throws(
    () =>
      catalogueService.discover({
        ...input,
        customer: path.join(workspace.root, "missing-customer"),
      }),
    /repository root is unavailable/,
  );
  assert.throws(
    () =>
      catalogueService.discover({
        ...input,
        frontend: path.join(workspace.root, "missing-frontend"),
      }),
    /repository root is unavailable/,
  );
} finally {
  if (originalCi === undefined) delete process.env.CI;
  else process.env.CI = originalCi;
}
const before = catalogue.catalogueDigest;
metadata.compositions[0].rendererKeys.push("retail.new.card");
fs.writeFileSync(
  packagePath,
  JSON.stringify({
    name: "independent.customer",
    nodics: { applicationBuilder: metadata },
  }),
);
assert.notStrictEqual(
  catalogueService.discover(input).catalogueDigest,
  before,
  "Declared composition changes must invalidate approved catalogue digests",
);
metadata.frontends.push({ code: "bazaar" });
fs.writeFileSync(
  packagePath,
  JSON.stringify({
    name: "independent.customer",
    nodics: { applicationBuilder: metadata },
  }),
);
assert.throws(
  () => catalogueService.discover(input),
  /ambiguous frontend code/,
);
console.log(
  "Application Builder independent customer source, generation, runtime and rejection contracts validated",
);
