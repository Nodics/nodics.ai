/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict');
const participation = require('../../src/service/defaultDigitalParticipationService');
const schemas = require('../../src/schemas/schemas').digitalCore;
const clone = value => structuredClone(value);
/** @module digitalCore/test/helpers/participationFixture @description Composes the real participation owner/private guards with isolated atomic generated repositories. No live persistence or activation. @layer test @owner digitalCore */
/** Adds private participation records without replacing other owners' transaction fixtures. */
module.exports = function install() {
  SERVICE.DefaultDigitalParticipationService = participation;
  SERVICE.DefaultDigitalBundleService = require('../../src/service/defaultDigitalBundleService');
  SERVICE.DefaultDigitalBundleAuthorityService = require('../../src/service/defaultDigitalBundleAuthorityService');
  SERVICE.DefaultDigitalCommerceEntitlementService = require('../../src/service/defaultDigitalCommerceEntitlementService');
  const rows = Object.fromEntries(participation.schemas().map(n => [n, []]));
  const models = Object.fromEntries(participation.schemas().map(schemaName => [schemaName, { primaryKey: 'code', schemaName,
    moduleName: 'digitalCore', rawSchema: schemas[schemaName], compareAndSetItem() {}, guardProtectedRead() {}, projectReadResult() {} }]));
  const priorModels = NODICS.getModels;
  NODICS.getModels = (module, tenant) => module === 'digitalCore' ? { ...priorModels?.(module, tenant), ...models } : priorModels(module, tenant);
  SERVICE.DefaultModelSaveInitializerService ||= { applyDefaultValues: (_r, _response, callback) => callback.nextSuccess() };
  const priorHooks = SERVICE.DefaultDatabaseConfigurationService?.getSchemaInterceptors;
  SERVICE.DefaultDatabaseConfigurationService = { ...SERVICE.DefaultDatabaseConfigurationService,
    getSchemaInterceptors: name => rows[name] ? Object.fromEntries(['preSave', 'preUpdate', 'preRemove'].map(k =>
      [k, [{ active: true, handler: 'DefaultDigitalParticipationService.protect' }]])) : priorHooks?.(name) };
  const priorField = SERVICE.DefaultModelConcurrencyService?.getField;
  SERVICE.DefaultModelConcurrencyService = { getField: s => s?.readProtection?.owner === 'DefaultDigitalParticipationService' ? undefined : priorField?.(s) };
  const priorIndexes = SERVICE.DefaultDatabaseModelHandlerService?.inspectIndexes;
  SERVICE.DefaultDatabaseModelHandlerService = { ...SERVICE.DefaultDatabaseModelHandlerService,
    inspectIndexes: m => m.moduleName === 'digitalCore' ? { versioned: false, indexes: [{ unique: true, key: { code: 1 } }] } : priorIndexes(m) };
  const priorTransaction = SERVICE.DefaultDatabaseTransactionService;
  let queue = Promise.resolve(), loseAcknowledgement = false;
  SERVICE.DefaultDatabaseTransactionService = { ...priorTransaction, execute: async (input, action) => {
    if (input.moduleName !== 'digitalCore') return priorTransaction.execute(input, action);
    const result = queue.then(async () => {
      const before = clone(rows);
      let value;
      try { value = await action(Object.freeze({ tenant: input.tenant, moduleName: input.moduleName })); }
      catch (error) { for (const name of Object.keys(rows)) rows[name] = before[name]; throw error; }
      if (loseAcknowledgement) { loseAcknowledgement = false; throw Error('lost commit acknowledgement'); }
      return value;
    });
    queue = result.catch(() => {});
    return result;
  } };
  for (const schema of Object.keys(rows)) SERVICE['Default' + schema[0].toUpperCase() + schema.slice(1) + 'Service'] = {
    get: async r => {
      participation.providerRead(r, models[schema]);
      const selected = rows[schema].filter(row => Object.entries(r.query).every(([k, v]) => row[k] === v));
      return { code: 'SUC_READ', count: selected.length, result: clone(selected) };
    },
    save: async r => {
      participation.protect(r); assert.equal(r.options.insertOnly, true);
      if (rows[schema].some(row => row.code === r.model.code)) throw Error('duplicate');
      rows[schema].push(clone(r.model)); return { code: 'SUC_SAVE' };
    },
    update: async r => {
      participation.protect(r);
      const row = rows[schema].find(row => Object.entries(r.query).every(([k, v]) => row[k] === v));
      if (row) Object.assign(row, clone(r.model));
      return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: row ? 1 : 0 } };
    },
  };
  return { rows, loseAcknowledgement: () => { loseAcknowledgement = true; } };
};
