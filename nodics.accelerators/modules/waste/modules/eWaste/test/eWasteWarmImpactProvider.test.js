/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteWarmImpactProvider @description Checks sourced WARM factors, weight uncertainty, unsupported boundaries and provider provenance through the real dispatcher. @owner eWaste @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const provider = require("../src/service/defaultEWasteWarmImpactProviderService");
const root = "../../../../../../nodics.waste/modules/wasteImpact/";
const calculator = require(
  root + "src/service/defaultWasteImpactCalculationService",
);
const defaults = require(root + "config/properties").wasteImpact.calculation;
const domain = require("../config/properties").wasteImpact.calculation;
let settings;
beforeEach(() => {
  settings = structuredClone({
    ...defaults,
    ...domain,
    providerService: "WarmProvider",
    failureMode: "ERROR",
  });
  global.CONFIG = { get: () => ({ calculation: settings }) };
  global.SERVICE = {
    WarmProvider: provider,
    DefaultWastePersistenceService: {
      fail(code, message) {
        throw Object.assign(new Error(message), { code });
      },
    },
  };
});
const request = (facts) => ({
  sourceRef: {
    module: "wasteSubmission",
    schema: "wasteSubmission",
    code: "A",
  },
  profile: { code: "P", formulaType: "EXTERNAL_PROVIDER" },
  facts,
});
test("uses EPA source units for a ten kilogram desktop and retains every basis field", async () => {
  const result = await calculator.calculate(
    request({
      itemTypeCode: "DESKTOP_TOWER",
      categoryCode: "DESKTOP_COMPUTER",
      weight: "10",
      quantity: 2,
    }),
    { tenant: "t" },
  );
  assert.equal(result.metrics[0].value, "16.644901");
  assert.equal(result.metrics[1].value, "0.016645");
  const env = result.metadata.environmentalAssessment,
    provenance = result.metadata.impactProvider;
  assert.equal(env.inputs.weightKg, 10); // Weight is total, never multiplied by quantity twice.
  assert.equal(env.factors.baselineFactor, 0.02);
  assert.equal(env.factors.treatmentFactor, -1.49);
  assert.equal(env.factors.factorSetVersion, "EPA_WARM_V16_DEC2023");
  assert.equal(env.methodology.providerVersion, "5");
  assert.equal(env.methodology.assessmentBasis, "POTENTIAL");
  assert.equal(provenance.isMock, false);
  assert.equal(env.carbonCredits.issuedQuantity, null);
  for (const key of [
    "geography",
    "baselineScenario",
    "treatmentScenario",
    "systemBoundary",
    "factorDatasetRef",
  ])
    assert.ok(env.methodology[key]);
});
test("preserves AI per-item range, confidence and total savings bounds", async () => {
  const result = await calculator.calculate(
    request({
      itemTypeCode: "LAPTOP",
      quantity: 2,
      weightEstimate: {
        min: 1,
        max: 3,
        unit: "KG",
        basis: "INFERRED",
        confidence: 0.7,
      },
    }),
  );
  const env = result.metadata.environmentalAssessment;
  assert.equal(env.inputs.weightKg, 4);
  assert.equal(env.inputs.weightMinKg, 2);
  assert.equal(env.inputs.weightMaxKg, 6);
  assert.equal(env.inputs.weightConfidence, 0.7);
  assert.equal(env.inputs.weightBasis, "INFERRED");
  assert.equal(env.factors.savingsMinKgCO2e, 2.380992);
  assert.equal(env.factors.savingsMaxKgCO2e, 7.142977);
});
test("strict policy rejects missing weights and unsupported profiles without fallback", async () => {
  settings.warm.allowPartialAssessment = false;
  for (const facts of [
    { itemTypeCode: "LAPTOP" },
    { itemTypeCode: "LOOSE_LITHIUM_BATTERY", weight: 2 },
    {
      itemTypeCode: "LAPTOP",
      weight: "",
      weightEstimate: { min: 1, max: 2, unit: "KG", basis: "INFERRED" },
    },
    { itemTypeCode: "LAPTOP", weight: true },
    { itemTypeCode: "LAPTOP", quantity: 0, weight: 2 },
  ])
    await assert.rejects(calculator.calculate(request(facts)), {
      code: "ERR_WASTE_IMPACT_INPUT_INVALID",
    });
});
test("future configured category mapping is an explicit supported extension", async () => {
  settings.warm.itemTypes.PROJECT_PRINTER = "HARD_COPY_DEVICES";
  const result = await calculator.calculate(
    request({ itemTypeCode: "PROJECT_PRINTER", weight: 10 }),
  );
  assert.equal(result.metrics[0].value, "6.393406");
});
test("changing provider leaves the first detached result unchanged", async () => {
  const first = await calculator.calculate(
    request({ itemTypeCode: "LAPTOP", weight: 2 }),
  );
  const snapshot = JSON.stringify(first);
  SERVICE.NextProvider = {
    calculate: () => ({
      provider: { code: "NEXT", version: "2", isMock: false },
      formulaVersion: "NEXT_V2",
      calculationStatus: "ESTIMATED",
      metrics: [
        {
          metricCode: "ESTIMATED_CO2E_SAVED_KG",
          value: "7",
          unitOfMeasure: "KG_CO2E",
        },
      ],
    }),
  };
  settings.providerService = "NextProvider";
  assert.equal(
    (await calculator.calculate(request({ weight: 2 }))).metrics[0].value,
    "7",
  );
  assert.equal(JSON.stringify(first), snapshot);
});


test("calculates independent energy and prospective input mass without claiming diversion or recovery yield", async () => {
  const result = await calculator.calculate(request({ itemTypeCode: "LAPTOP", quantity: 2,
    weightEstimate: { min: 1, max: 3, unit: "KG", basis: "INFERRED" } }));
  const metrics = Object.fromEntries(result.metrics.map(m => [m.metricCode, Number(m.value)]));
  const factor = (0.27 + 20.95) * 293.0710701722222 / 907.18474;
  assert.ok(Math.abs(metrics.ENERGY_SAVED_KWH - 4 * factor) < 0.000001);
  assert.equal(metrics.POTENTIAL_RECYCLING_INPUT_KG, 4);
  assert.equal(metrics.RECYCLING_INPUT_ITEM_COUNT, 2);
  assert.equal(metrics.DIVERTED_FROM_LANDFILL_KG, undefined);
  assert.equal(metrics.RECOVERABLE_MATERIAL_ESTIMATE_KG, undefined);
  const env = result.metadata.environmentalAssessment;
  assert.ok(Math.abs(env.factors.energyMinKWh - 2 * factor) < 0.000001);
  assert.ok(Math.abs(env.factors.energyMaxKWh - 6 * factor) < 0.000001);
  assert.equal(env.indicators.find(x => x.key === "waterSaved").value, null);
  settings.warm.kWhPerMillionBtu = 0;
  await assert.rejects(calculator.calculate(request({ itemTypeCode: "LAPTOP", weight: 2 })), { code: "ERR_WASTE_IMPACT_CONFIGURATION_INVALID" });
});


test("a configured carbon-only row remains usable without inventing an energy factor", async () => {
  delete settings.warm.energyRows.PORTABLE_ELECTRONICS;
  const result = await calculator.calculate(request({ itemTypeCode: "LAPTOP", weight: 2 }));
  assert.equal(result.metrics.some(x => x.metricCode === "ENERGY_SAVED_KWH"), false);
  assert.equal(result.metadata.environmentalAssessment.indicators.find(x => x.key === "energySaved").value, null);
  assert.equal(result.metrics[0].value, "2.380992");
});


test("small charger reference scenario discloses proxy and assumptions and respects measured weight", async () => {
 settings.warm.allowPartialAssessment = false;
 const facts = { itemTypeCode: "CHARGER", categoryCode: "CABLE_CHARGER", sizeClass: "SMALL", quantity: 1,
   weightEstimate: {min:null,max:null,unit:"KG",basis:"UNKNOWN"} };
 const env = (await calculator.calculate(request(facts))).metadata.environmentalAssessment;
 assert.equal(env.methodology.assessmentBasis, "REFERENCE_SCENARIO");
 assert.match(env.methodology.referenceScenarioExplanation, /not a charger-specific/);
 assert.equal(env.inputs.weightSource, "REFERENCE_ASSUMPTION");
 assert.equal(env.inputs.weightMinKg, .05); assert.equal(env.inputs.weightMaxKg,.15);
 assert.equal(env.factors.savingsMinKgCO2e, .020944);
 assert.equal(env.factors.savingsMaxKgCO2e, .062832);
 const measured=(await calculator.calculate(request({...facts,weight:.08,quantity:2}))).metadata.environmentalAssessment;
 assert.equal(measured.inputs.weightKg,.08); assert.equal(measured.inputs.weightSource,"weight");
 assert.equal(measured.methodology.assessmentBasis,"REFERENCE_SCENARIO");
 for(const delta of [{sizeClass:"LARGE"},{itemTypeCode:"CABLE"},{weight:""},{weightEstimate:{min:3,max:1,unit:"KG",basis:"INFERRED"}}])
   await assert.rejects(calculator.calculate(request({...facts,...delta})),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
 settings.warm.referenceScenarios.CHARGER.enabled=false;
 await assert.rejects(calculator.calculate(request(facts)),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
});


test("every accepted catalogue type retains AI mass/count without inventing carbon for unsupported profiles", async () => {
 const items=Object.values(require("../data/core-v001/records/waste/eWasteItemTypeData"));
 for(const item of items) {
  const result=await calculator.calculate(request({itemTypeCode:item.code,categoryCode:item.categoryCode,sizeClass:"SMALL",quantity:2,weightEstimate:{min:.1,max:.3,unit:"KG",basis:"INFERRED",confidence:.7}}));
  const env=result.metadata.environmentalAssessment;
  assert.equal(env.inputs.weightMinKg,.2,item.code);assert.equal(env.inputs.weightMaxKg,.6,item.code);
  assert.equal(env.indicators.find(x=>x.key==="recyclingInputMass").value,"0.400000",item.code);
  if(env.methodology.assessmentBasis==="INPUT_ONLY") {
   assert.equal(env.indicators.find(x=>x.key==="avoidedEmissions").value,null,item.code);
   assert.ok(env.methodology.assessmentLimitation,item.code);
  }
 }
 const unknown=await calculator.calculate(request({itemTypeCode:"LOOSE_LITHIUM_BATTERY",quantity:1}));
 assert.equal(unknown.metrics.length,1);
 assert.equal(unknown.metrics[0].metricCode,"RECYCLING_INPUT_ITEM_COUNT");
 await assert.rejects(calculator.calculate(request({itemTypeCode:"LOOSE_LITHIUM_BATTERY",weight:-1})),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
});


test("missing weight does not hide broken factors and unknown individual electronics do not inherit mixed-load factors", async () => {
 const unknown=(await calculator.calculate(request({itemTypeCode:"UNKNOWN_ELECTRONIC_ITEM",categoryCode:"MIXED_ELECTRONICS",weight:1}))).metadata.environmentalAssessment;
 assert.equal(unknown.methodology.assessmentBasis,"INPUT_ONLY");
 assert.equal(unknown.indicators.find(x=>x.key==="avoidedEmissions").value,null);
 settings.warm.rows.PORTABLE_ELECTRONICS.landfill=NaN;
 await assert.rejects(calculator.calculate(request({itemTypeCode:"LAPTOP"})),{code:"ERR_WASTE_IMPACT_CONFIGURATION_INVALID"});
});

test("a bundle retains total eligible mass without reporting one physical item or multiplying its weight", async () => {
 const facts={itemTypeCode:"UNKNOWN_ELECTRONIC_ITEM",categoryCode:"MIXED_ELECTRONICS",submissionUnit:"BUNDLE",quantity:1,weightEstimate:{min:.2,max:.5,unit:"KG",basis:"INFERRED"}};
 const result=await calculator.calculate(request(facts));
 assert.equal(result.metadata.environmentalAssessment.inputs.weightMaxKg,.5);
 assert.equal(result.metrics.some(x=>x.metricCode==='RECYCLING_INPUT_ITEM_COUNT'),false);
 await assert.rejects(calculator.calculate(request({...facts,quantity:4})),{code:'ERR_WASTE_IMPACT_INPUT_INVALID'});
});


test("bundle reference calculates carbon and energy from total mass and retains its limitations", async () => {
 const facts={itemTypeCode:"UNKNOWN_ELECTRONIC_ITEM",categoryCode:"MIXED_ELECTRONICS",submissionUnit:"BUNDLE",quantity:1,weightEstimate:{min:.25,max:.8,unit:"KG",basis:"INFERRED"}};
 const env=(await calculator.calculate(request(facts))).metadata.environmentalAssessment;
 assert.equal(env.methodology.assessmentBasis,"REFERENCE_SCENARIO");
 assert.match(env.methodology.referenceScenarioExplanation,/composition or local recycling/);
 assert.equal(env.inputs.weightKg,.525);
 assert.equal(env.inputs.weightAggregation,"TOTAL_BUNDLE_RANGE");
 const factor=.92*1000/907.18474;
 assert.equal(Number(env.indicators.find(x=>x.key==="avoidedEmissions").value),Number((.525*factor).toFixed(6)));
 assert.equal(env.factors.savingsMinKgCO2e,Number((.25*factor).toFixed(6)));
 assert.equal(env.factors.savingsMaxKgCO2e,Number((.8*factor).toFixed(6)));
 assert.equal(env.factors.energyMaxKWh,Number((.8*14.29*293.0710701722222/907.18474).toFixed(6)));
 assert.equal(env.carbonCredits.issuedQuantity,null);
 await assert.rejects(calculator.calculate(request({...facts,weightEstimate:undefined})),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
 for(const change of [{submissionUnit:undefined},{categoryCode:"BATTERY"}]) {
  const result=(await calculator.calculate(request({...facts,...change}))).metadata.environmentalAssessment;
  assert.equal(result.methodology.assessmentBasis,"INPUT_ONLY");
 }
 settings.warm.bundleReferenceScenario.enabled=false;
 assert.equal((await calculator.calculate(request(facts))).metadata.environmentalAssessment.methodology.assessmentBasis,"INPUT_ONLY");
 settings.warm.bundleReferenceScenario.enabled=true;
 settings.warm.bundleReferenceScenario.explanation="";
 await assert.rejects(calculator.calculate(request(facts)),{code:"ERR_WASTE_IMPACT_CONFIGURATION_INVALID"});
});


test("catalogue coverage is explicit and every environmental property has a value or assessment reason", async () => {
 const coverage={MOBILE_PHONE:"POTENTIAL",SMARTPHONE:"POTENTIAL",FEATURE_PHONE:"POTENTIAL",LAPTOP:"POTENTIAL",TABLET_DEVICE:"POTENTIAL",DESKTOP_TOWER:"POTENTIAL",CHARGER:"REFERENCE_SCENARIO",COMPUTER_MONITOR:"INPUT_ONLY",CABLE:"INPUT_ONLY",EARPHONES:"INPUT_ONLY",POWER_BANK_DEVICE:"INPUT_ONLY",LOOSE_LITHIUM_BATTERY:"INPUT_ONLY",SMALL_HOME_APPLIANCE:"INPUT_ONLY",UNKNOWN_ELECTRONIC_ITEM:"INPUT_ONLY"};
 const items=Object.values(require("../data/core-v001/records/waste/eWasteItemTypeData"));
 assert.deepEqual(items.map(x=>x.code).sort(),Object.keys(coverage).sort(),"A new accepted type must declare and test its impact coverage");
 for(const item of items) {
  const env=(await calculator.calculate(request({itemTypeCode:item.code,categoryCode:item.categoryCode,sizeClass:"SMALL",quantity:1,weightEstimate:{min:.1,max:.3,unit:"KG",basis:"INFERRED"}}))).metadata.environmentalAssessment;
  assert.equal(env.methodology.assessmentBasis,coverage[item.code],item.code);
  assert.equal(env.indicators.length,14,item.code);
  for(const indicator of env.indicators) {
   if(indicator.value===null) {assert.ok(indicator.reason,item.code+indicator.key);assert.ok(indicator.requirements.length,item.code+indicator.key);}
   else {assert.ok(Number.isFinite(Number(indicator.value)));assert.equal(indicator.status,"ESTIMATED");}
  }
  if(coverage[item.code]==="INPUT_ONLY") assert.ok(env.methodology.assessmentLimitation,item.code);
 }
});
