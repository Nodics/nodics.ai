/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const DEFINITIONS = require('../utils/descriptorDefinitions');
const DEFAULTS = require('../../config/properties').wasteMaterial.descriptor;

/**
 * @module wasteMaterial/service/defaultWasteItemDescriptorService
 * @description Normalizes typed, advisory material/physical/environmental facts and projects one public-safe item descriptor from authorized Waste records. Does not infer measurements, calculate impact, authorize access or persist records.
 * @owner wasteMaterial @layer service
 * @override Override documented members or wasteMaterial.descriptor policy in a later module; preserve provenance, canonical references and unknown values. Callers must authorize the source before projection.
 */
module.exports = {
  /** Returns bounded descriptor policy; limits can be refined by later modules. */
  settings: function () {
    return (CONFIG.get('wasteMaterial') || {}).descriptor || { maximumMaterials: 24, maximumWeightKg: 10000, maximumDimensionCm: 10000 };
  },
  /** Returns a clamped confidence; absent confidence is explicitly unknown. */
  confidence: function (value) {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : null;
  },
  /** Rejects malformed operator corrections; AI normalization drops unsupported suggestions. */
  invalid: function () {
    return SERVICE.DefaultWastePersistenceService.fail('ERR_WASTE_DESCRIPTOR_INVALID', 'An item property or material reference is invalid');
  },
  /** Copies short plain text without allowing arbitrary objects or embedded operational data. */
  text: function (value, limit = 180) {
    return typeof value === 'string' ? value.trim().slice(0, limit) : null;
  },
  /** Normalizes a coded observation with explicit provenance and optional confidence. */
  observation: function (input, values, operator = false) {
    const source = input && typeof input === 'object' ? input : {};
    const value = values.includes(source.value) ? source.value : 'UNKNOWN';
    if (operator && source.value !== undefined && !values.includes(source.value)) return this.invalid();
    return { value, basis: value === 'UNKNOWN' ? 'UNKNOWN' : operator ? 'OPERATOR_VERIFIED' : ['OBSERVED', 'INFERRED'].includes(source.basis) ? source.basis : 'INFERRED', confidence: value === 'UNKNOWN' ? null : this.confidence(source.confidence) };
  },
  /** Normalizes approximate numeric ranges. Image estimates are never promoted to measured values. */
  range: function (input, unit, maximum, operator = false) {
    if (!input || (input.min === null && input.max === null)) return { min: null, max: null, unit, basis: 'UNKNOWN', confidence: null };
    if (typeof input !== 'object' || input.unit !== unit || !Number.isFinite(input.min) || !Number.isFinite(input.max) || input.min <= 0 || input.max < input.min || input.max > maximum) {
      if (operator) return this.invalid();
      return { min: null, max: null, unit, basis: 'UNKNOWN', confidence: null };
    }
    return { min: input.min, max: input.max, unit, basis: operator ? 'OPERATOR_VERIFIED' : 'INFERRED', confidence: this.confidence(input.confidence) };
  },
  /** Accepts bounded canonical material references. Composition quantities/decomposition are intentionally not accepted in this contract. */
  materials: function (input, catalogue, operator = false) {
    if (input === undefined || input === null) return [];
    if (!Array.isArray(input) || input.length > this.settings().maximumMaterials) {
      if (operator) return this.invalid();
      return [];
    }
    const result = [], seen = new Set();
    input.forEach(hint => {
      const code = hint && (hint.code || hint.ref && hint.ref.code);
      const material = catalogue && catalogue.find(item => item.code === code && item.status !== 'INACTIVE');
      if (!hint || !material || seen.has(code) || (!operator && !['OBSERVED', 'INFERRED', 'OPERATOR_VERIFIED'].includes(hint.basis))) {
        if (operator) this.invalid();
        return;
      }
      seen.add(code);
      result.push({ ref: { module: 'wasteMaterial', schema: 'wasteMaterialType', code }, name: material.name, kind: material.materialKind || 'MATERIAL', basis: operator ? 'OPERATOR_VERIFIED' : hint.basis === 'OPERATOR_VERIFIED' ? 'INFERRED' : hint.basis, confidence: this.confidence(hint.confidence) });
    });
    return result;
  },
  /** Builds normalized environmental observations; absence of visible hazards is never a safety certification. */
  environment: function (input = {}, operator = false) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) { if (operator) return this.invalid(); input = {}; }
    const hazards = Array.isArray(input.hazards) ? input.hazards : [];
    if (operator && (hazards.length > DEFINITIONS.hazards.length || hazards.some(value => !value || !DEFINITIONS.hazards.includes(value.code)))) return this.invalid();
    return {
      recyclability: this.observation(input.recyclability, DEFINITIONS.recyclability, operator),
      contamination: this.observation(input.contamination, DEFINITIONS.contamination, operator),
      hazards: [...new Map(hazards.filter(value => value && DEFINITIONS.hazards.includes(value.code)).map(value => [value.code, { code: value.code, basis: operator ? 'OPERATOR_VERIFIED' : ['OBSERVED', 'INFERRED'].includes(value.basis) ? value.basis : 'INFERRED', confidence: this.confidence(value.confidence) }])).values()],
      hazardAssessment: operator ? 'REVIEWED' : 'UNVERIFIED',
      recoveryPotential: this.observation(input.recoveryPotential, ['POTENTIAL', 'UNKNOWN'], operator),
    };
  },
  /** Normalizes additive descriptor facts returned by recognition or an authorized reviewer. */
  normalize: function (input = {}, catalogue = [], operator = false) {
    const result = {};
    if (input.materials !== undefined) result.materials = this.materials(input.materials, catalogue, operator);
    if (input.weightEstimate !== undefined) result.weightEstimate = this.range(input.weightEstimate, 'KG', this.settings().maximumWeightKg, operator);
    if (input.dimensionsEstimate !== undefined) {
      result.dimensionsEstimate = Object.fromEntries(['length', 'width', 'height'].map(axis => [axis, this.range(input.dimensionsEstimate && input.dimensionsEstimate[axis], 'CM', this.settings().maximumDimensionCm, operator)]));
    }
    if (input.environment !== undefined) result.environment = this.environment(input.environment, operator);
    return result;
  },
  /** Normalizes advisory image-source analysis and retains an irreversible automatic-approval hold once evidence is flagged. */
  normalizeImageEvidence: function (input, previous, evidenceRef) {
    const policy = { ...DEFAULTS.imageEvidence, ...(this.settings().imageEvidence || {}) };
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const sourceType = DEFINITIONS.imageSourceTypes.includes(source.sourceType) ? source.sourceType : 'UNCERTAIN';
    const confidence = this.confidence(source.confidence);
    const reasons = sourceType === 'ITEM_PHOTOGRAPH' ? [] : [sourceType];
    if (sourceType === 'ITEM_PHOTOGRAPH' && (confidence === null || confidence < policy.minimumPhotoConfidence)) reasons.push('LOW_SOURCE_CONFIDENCE');
    const held = previous && previous.manualApprovalRequired === true;
    const reasonCodes = [...new Set([...(held ? previous.reasonCodes || ['UNCERTAIN'] : []), ...reasons])];
    const reason = this.text(source.reason, 500);
    const now = new Date().toISOString();
    return {
      contractVersion: 1, sourceType, confidence, reason, assessedAt: now, evidenceRef, advisory: true,
      manualApprovalRequired: held || reasons.length > 0, reasonCodes,
      firstFlaggedAt: held ? previous.firstFlaggedAt || previous.assessedAt : reasons.length ? now : null,
      flaggedEvidenceRef: held ? previous.flaggedEvidenceRef || previous.evidenceRef : reasons.length ? evidenceRef : null,
      flagReason: held ? previous.flagReason || previous.reason : reasons.length ? reason : null,
    };
  },
  /** Projects the single server-owned evidence hold; an unassessed/replaced image never qualifies for automated review. Legacy records retain their existing human confirmation flow. */
  evidenceReview: function (record) {
    const metadata = record.metadata || {}, source = metadata.evidenceReview;
    const policy = { ...DEFAULTS.imageEvidence, ...(this.settings().imageEvidence || {}) };
    const sameEvidence = source && source.contractVersion === 1 && source.evidenceRef && source.evidenceRef.code === metadata.photo?.code;
    const sourceType = sameEvidence && DEFINITIONS.imageSourceTypes.includes(source.sourceType) ? source.sourceType : 'UNCERTAIN';
    const flagged = Boolean(source && (source.manualApprovalRequired === true || source.sourceType !== 'ITEM_PHOTOGRAPH' || typeof source.confidence !== 'number' || source.confidence < policy.minimumPhotoConfidence));
    const required = !sameEvidence || flagged;
    return {
      assessed: Boolean(sameEvidence), sourceType, sourceLabel: policy.sourceLabels[sourceType],
      manualApprovalRequired: required, acknowledgementRequired: flagged,
      label: flagged && metadata.manualEvidenceApproval ? policy.reviewedLabel : flagged ? policy.manualLabel : !sameEvidence ? policy.unassessedLabel : policy.sourceLabels[sourceType],
      message: flagged && metadata.manualEvidenceApproval ? policy.reviewedMessage : flagged ? policy.manualMessage : !sameEvidence ? policy.unassessedMessage : null,
      acknowledgementLabel: policy.acknowledgementLabel,
      customerMessage: metadata.manualEvidenceApproval ? policy.customerReviewedMessage : ['APPROVED', 'REJECTED'].includes(record.submissionStatus) || record.assetStatus ? policy.customerRecordedMessage : policy.customerMessage,
      reason: flagged ? source.flagReason || source.reason || null : sameEvidence ? source.reason || null : null,
      reasonCodes: flagged ? source.reasonCodes || ['UNCERTAIN'] : !sameEvidence ? ['NOT_ASSESSED'] : [],
      manualApprovalRecorded: Boolean(metadata.manualEvidenceApproval),
    };
  },
  /** Derives unknown fields from normalized effective facts so AI labels cannot contradict retained values or later corrections. */
  unknownFields: function (facts = {}) {
    const unknown = [];
    for (const key of ['brand', 'model']) if (!facts[key] || !String(facts[key]).trim()) unknown.push(key);
    if (!facts.conditionGrade || facts.conditionGrade === 'UNKNOWN') unknown.push('conditionGrade');
    if (!facts.materials || !facts.materials.length) unknown.push('materials');
    if (!(Number(facts.weight) > 0) && !(facts.weightEstimate && facts.weightEstimate.min > 0 && facts.weightEstimate.max >= facts.weightEstimate.min)) unknown.push('weight');
    if (!['length', 'width', 'height'].every(axis => facts.dimensionsEstimate && facts.dimensionsEstimate[axis] && facts.dimensionsEstimate[axis].min > 0 && facts.dimensionsEstimate[axis].max >= facts.dimensionsEstimate[axis].min)) unknown.push('dimensions');
    if (!facts.sizeClass || facts.sizeClass === 'UNKNOWN') unknown.push('sizeClass');
    return unknown;
  },
  /** Resolves the catalogue once per request so list projection does not create per-item taxonomy reads. */
  catalogue: async function (request) {
    const store = SERVICE.DefaultWastePersistenceService;
    const maximum = this.settings().maximumCatalogueRecords || 5000;
    const read = async schema => {
      const records = [];
      for (let page = 1; ; page++) {
        const result = await store.page(schema, request, { status: 'ACTIVE' }, page, 500);
        if (result.total > maximum || (!result.items.length && records.length < result.total))
          store.fail('ERR_WASTE_CATALOGUE_UNAVAILABLE', 'The active catalogue cannot be loaded completely');
        records.push(...result.items);
        if (records.length >= result.total) return records;
      }
    };
    const [families, categories, items, materials] = await Promise.all(['wasteFamily', 'wasteCategory', 'wasteItemType', 'wasteMaterialType'].map(read));
    return { families, categories, items, materials };
  },
  /** Adds a descriptor to authorized response records and removes internal customer metadata. Uses one catalogue read for any response size. */
  projectResponse: async function (data, request) {
    const catalogue = await this.catalogue(request);
    const employee = request.authData && ['human', 'employee', 'service'].includes(request.authData.principalType);
    const project = value => {
      if (!value || typeof value !== 'object') return value;
      if (Array.isArray(value)) return value.map(project);
      if (value.submissionStatus || value.assetStatus) {
        const output = { ...value, descriptor: this.describe(value, catalogue) };
        if (!employee) {
          const metadata = value.metadata || {};
          output.metadata = Object.fromEntries(['facts', 'photo', 'suggestion', 'estimate', 'estimatePending', 'arrival', 'depositInstruction', 'conversation', 'submittedAt', 'reviewedAt', 'publicReason', 'valuation', 'openingReward', 'illustrativeCarbonUnits', 'settlementStatus', 'commerceProductRef', 'askingPrice'].filter(key => metadata[key] !== undefined).map(key => [key, metadata[key]]));
          if (metadata.origin) output.metadata.origin = { channel: metadata.origin.channel, allowsWrite: metadata.origin.allowsWrite };
          if (metadata.reviewAssignment) output.metadata.reviewAssignment = { status: metadata.reviewAssignment.status || (metadata.reviewAssignment.queueCode || metadata.reviewAssignment.principalCode ? 'ASSIGNED' : 'PENDING'), label: metadata.reviewAssignment.label };
          if (output.metadata.suggestion) output.metadata.suggestion = { facts: metadata.suggestion.facts, recognition: metadata.suggestion.recognition, confidence: metadata.suggestion.confidence, advisory: true };
          for (const key of ['idempotencyKey', 'correlationId', 'sourceContext']) delete output[key];
        }
        return output;
      }
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, ['items', 'submissions', 'assets', 'submission', 'asset', 'draft'].includes(key) ? project(item) : item]));
    };
    return project(data);
  },
  /** Builds one full customer-safe descriptor using reviewed facts only after a final decision; internal notes and identities never appear. */
  describe: function (record, catalogue = {}) {
    const metadata = record.metadata || {}, final = ['APPROVED', 'REJECTED'].includes(record.submissionStatus) || Boolean(record.assetStatus);
    const facts = record.assetStatus ? metadata.facts || {} : final ? metadata.reviewedFacts || metadata.verifiedFacts || record.confirmedFacts || record.submittedFacts || {} : record.confirmedFacts || { ...(metadata.suggestion && metadata.suggestion.facts || {}), ...(record.submittedFacts || {}) };
    const recognition = metadata.suggestion && metadata.suggestion.recognition || {};
    const item = (catalogue.items || []).find(value => value.code === facts.itemTypeCode);
    const category = (catalogue.categories || []).find(value => value.code === facts.categoryCode);
    const familyCode = category && category.familyCode || facts.familyCode || null;
    const family = (catalogue.families || []).find(value => value.code === familyCode);
    const impact = final ? metadata.acceptedEstimate || metadata.approvedEstimate || metadata.verifiedEstimate : metadata.estimate;
    const assessment = impact && impact.metadata && impact.metadata.environmentalAssessment;
    const materialFacts = facts.materials || (!final && recognition.materials) || [];
    return {
      contractVersion: 1, code: record.code, sourceSubmissionCode: record.sourceSubmissionCode || record.code, photo: metadata.photo || null,
      status: record.submissionStatus || record.assetStatus, requiresClassificationReview: Boolean(metadata.manualReviewRequired && !final),
      stage: final ? 'REVIEWED' : record.confirmedFacts ? 'SUBMITTED' : 'SUGGESTED',
      evidenceReview: this.evidenceReview(record),
      identity: { name: facts.name || null, description: facts.description || null, brand: facts.brand || null, model: facts.model || null },
      classification: { family: { code: familyCode, name: family && family.name || null }, category: { code: facts.categoryCode || null, name: category && category.name || null }, itemType: { code: facts.itemTypeCode || null, name: item && item.name || null } },
      physical: { quantity: facts.quantity ?? null, size: { value: facts.sizeClass || 'UNKNOWN', basis: facts.sizeClass ? facts.sizeProvenance && facts.sizeProvenance.basis || recognition.size && recognition.size.basis || 'INFERRED' : 'UNKNOWN' }, weight: { value: facts.weight === undefined || facts.weight === null ? null : String(facts.weight), unit: 'KG', basis: facts.weightProvenance && facts.weightProvenance.basis || 'UNKNOWN' }, weightEstimate: facts.weightEstimate || this.range(null, 'KG', this.settings().maximumWeightKg), dimensionsEstimate: facts.dimensionsEstimate || null },
      materials: materialFacts.map(hint => { const code = hint.ref && hint.ref.code || hint.code; const material = (catalogue.materials || []).find(value => value.code === code); return { ref: { module: 'wasteMaterial', schema: 'wasteMaterialType', code }, name: material && material.name || hint.name || null, kind: material && material.materialKind || hint.kind || 'MATERIAL', basis: hint.basis || 'UNKNOWN', confidence: this.confidence(hint.confidence) }; }),
      condition: { value: facts.conditionGrade || 'UNKNOWN', basis: facts.conditionGrade && facts.conditionGrade !== 'UNKNOWN' ? facts.conditionProvenance && facts.conditionProvenance.basis || 'INFERRED' : 'UNKNOWN' },
      environment: { observations: facts.environment || this.environment(), assessment: assessment || null, metrics: impact && impact.metrics || [], status: impact && impact.calculationStatus || 'NOT_ASSESSED', provisional: !final, publicClaimAllowed: false },
      review: { decision: final ? record.submissionStatus || 'APPROVED' : null, comment: final ? metadata.publicReason || null : null, reviewedAt: metadata.reviewedAt || null },
      customerEditableFields: final || record.confirmedFacts ? [] : ['name', 'description'],
      unknownFields: this.unknownFields(facts),
    };
  },
};
