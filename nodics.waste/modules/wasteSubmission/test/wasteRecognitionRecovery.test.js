/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteSubmission/test/wasteRecognitionRecovery @description Verifies configured generic matching preserves observable facts without inventing taxonomy or accepting unsupported evidence. @layer test @owner wasteSubmission */
const assert = require('node:assert/strict');
const service = require('../src/service/defaultWasteMetadataAnalysisService');
const defaults = require('../config/properties').wasteSubmission.metadataSuggestion;
let settings, parsed, saved, writes, prompt;
const items = [
  { code: 'PHONE', categoryCode: 'DEVICES', name: { en: 'Phone' }, allowedConditionGrades: ['UNKNOWN'] },
  { code: 'GENERIC_DEVICE', categoryCode: 'MIXED', name: { en: 'Unclassified device' }, allowedConditionGrades: ['UNKNOWN'] },
];
global.CONFIG = { get: key => key === 'wasteSubmission' ? { metadataSuggestion: settings } : { providers: {} } };
global.SERVICE = {
  DefaultWasteItemDescriptorService: require("../../wasteMaterial/src/service/defaultWasteItemDescriptorService"),
  DefaultWasteSubmissionOperationService: { read: async () => ({ code: 'DRAFT', revision: 3, submissionStatus: 'MEDIA_STAGED', metadata: { photo: { code: 'PHOTO' } } }) },
  DefaultWastePersistenceService: {
    revision() {},
    fail(code, message) { throw Object.assign(new Error(message), { code }); },
    list: async schema => schema === 'wasteItemType' ? items : [],
    create: async () => { writes++; },
    update: async (_schema, _request, current, patch) => { writes++; saved = { ...current, ...patch }; return saved; },
  },
  DefaultCopilotProviderService: { invoke: async request => { prompt = request.messages[0].content; return { content: JSON.stringify(parsed), provider: 'test', model: 'test' }; } },
};
SERVICE.DefaultWastePersistenceService.page = async schema => { const items = await SERVICE.DefaultWastePersistenceService.list(schema); return { items, total: items.length }; };
const request = { expectedRevision: 3, photo: { code: 'PHOTO', contentBase64: 'bounded-test-photo' } };
const suggest = () => service.suggest(request);
(async () => {
  assert.equal(defaults.enabled, false);
  assert.equal(defaults.fallbackItemTypeCode, null);
  settings = { ...defaults, enabled: true, subjectLabel: 'electronic item', fallbackItemTypeCode: 'GENERIC_DEVICE' };
  SERVICE.DefaultCopilotProviderService.invoke = async () => { throw Error('COPILOT_SECRET_NOT_FOUND'); };
  await assert.rejects(suggest(), { code: 'ERR_WASTE_RECOGNITION_UNAVAILABLE' });
  SERVICE.DefaultCopilotProviderService.invoke = async request => { prompt = request.messages[0].content; return { content: JSON.stringify(parsed), provider: 'test', model: 'test' }; };
  parsed = { contractVersion: 1, imageEvidence: {sourceType:'ITEM_PHOTOGRAPH',confidence:.95,reason:'Direct item photo'}, assessment: 'SUPPORTED', name: 'Remote control', description: 'Black handheld remote.', itemTypeCode: 'UNREGISTERED_REMOTE', categoryCode: 'INVENTED', qualityFlags: [], confidence: .8, carbon: 500 };
  writes = 0;
  await suggest();
  assert.equal(saved.metadata.suggestion.facts.name, 'Remote control');
  assert.equal(saved.metadata.suggestion.facts.itemTypeCode, 'GENERIC_DEVICE');
  assert.equal(saved.metadata.suggestion.facts.categoryCode, 'MIXED');
  assert.equal(saved.metadata.suggestion.facts.carbon, undefined);
  assert.equal(saved.metadata.suggestion.recognition.taxonomyMatch.kind, 'GENERIC_FALLBACK');
  assert.equal(saved.metadata.suggestion.recognition.weight.value, null);
  assert.equal(saved.submissionStatus, 'METADATA_SUGGESTED');
  assert.equal(saved.metadata.photo.code, 'PHOTO');
  assert.equal(writes, 2);
  assert(prompt.includes('GENERIC_DEVICE'));
  assert(prompt.includes('qualityFlags defaults to []'));
  assert(prompt.includes('foreground electronic item'));
  assert(!prompt.includes('UNKNOWN_ELECTRONIC_ITEM'));
  for (const fallback of [null, 'INACTIVE_OR_MISSING']) {
    settings.fallbackItemTypeCode = fallback;
    await assert.rejects(suggest(), { code: 'ERR_WASTE_RECOGNITION_INVALID' });
  }
  settings.fallbackItemTypeCode = 'GENERIC_DEVICE';
  const before = writes;
  parsed.name = '';
  await assert.rejects(suggest(), { code: 'ERR_WASTE_RECOGNITION_INVALID' });
  parsed.name = 'Plastic bottle';
  parsed.description = 'A bottle with a yellow cap.';
  parsed.assessment = 'UNSUPPORTED';
  await assert.rejects(suggest(), error => error.code === 'ERR_WASTE_ITEM_UNSUPPORTED' && /Plastic bottle/.test(error.message) && /yellow cap/.test(error.message) && /can’t accept/.test(error.message));
  for (const assessment of ['UNSUPPORTED', 'UNCERTAIN']) {
    parsed.assessment = assessment;
    await assert.rejects(suggest(), { code: assessment === 'UNSUPPORTED' ? 'ERR_WASTE_ITEM_UNSUPPORTED' : 'ERR_WASTE_RECOGNITION_INVALID' });
  }
  parsed.assessment = 'SUPPORTED';
  for (const flag of ['BLURRY', 'MULTIPLE_ITEMS', 'MISMATCH']) {
    parsed.qualityFlags = [flag];
    await assert.rejects(suggest(), { code: 'ERR_WASTE_RECOGNITION_INVALID' });
  }
  assert.equal(writes, before, 'Rejected evidence must never write a suggestion');
  parsed.qualityFlags = ['LABEL_UNREADABLE']; parsed.itemTypeCode = 'PHONE'; parsed.brand = null;
  await suggest();
  assert.equal(saved.metadata.suggestion.recognition.taxonomyMatch.kind, 'EXACT');
  assert.equal(saved.metadata.suggestion.facts.categoryCode, 'DEVICES');
  assert.equal(saved.metadata.suggestion.facts.brand, undefined);
  parsed.itemTypeCode = 'GENERIC_DEVICE';
  await suggest();
  assert.equal(saved.metadata.suggestion.recognition.taxonomyMatch.kind, 'GENERIC_FALLBACK');
  settings.subjectLabel = 'recyclable packaging';
  assert(service.buildPrompt(items, [], settings).includes('foreground recyclable packaging'));
  settings.allowBundles = true;
  parsed.qualityFlags = ['MULTIPLE_ITEMS']; parsed.quantity = 8; parsed.itemTypeCode = 'PHONE';
  parsed.weightEstimate = {min:.2,max:.5,unit:'KG',basis:'INFERRED',confidence:.7};
  await suggest();
  assert.equal(saved.metadata.suggestion.facts.submissionUnit, 'BUNDLE');
  const operations=require('../src/service/defaultWasteSubmissionOperationService');
  assert.equal(operations.facts(saved.metadata.suggestion.facts).submissionUnit,'BUNDLE');
  assert.equal(operations.clearAnalysisFacts({submissionUnit:'BUNDLE'}).submissionUnit,undefined);
  assert.equal(saved.metadata.suggestion.facts.quantity, 1);
  assert.equal(saved.metadata.suggestion.facts.itemTypeCode, 'GENERIC_DEVICE');
  assert.equal(saved.metadata.suggestion.facts.weightEstimate.max, .5);
  assert(prompt.includes('Ignore non-domain objects'));
  console.log('Recognition recovery: configured taxonomy fallback, customization and rejection boundaries passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
