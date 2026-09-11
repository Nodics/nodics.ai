/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteResumeJourney @description Verifies owner/application filtering before pagination and durable recovery without browser state. @layer test @owner eWaste */
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultEWasteExperienceService');
const persistence = require('../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService');
let records, calls;
const request = () => ({ tenant: 'tenant-a', authData: { tenant: 'tenant-a', principalType: 'customer', loginId: 'owner@example.com', code: 'owner-a' }, query: {} });
const record = (code, owner = 'owner-a', application = 'APP_A', status = 'DRAFT', updated = '2026-09-09T10:00:00.000Z') => ({ code, active: true, submitterRef: { module: 'profile', schema: 'customer', code: owner }, sourceContext: { applicationCode: application }, submissionStatus: status, submittedFacts: { name: code }, metadata: { private: 'not in recovery projection' }, updated });
beforeEach(() => {
  records = []; calls = [];
  global.CONFIG = { get: key => key === 'eWaste' ? { applicationCode: 'APP_A' } : undefined };
  global.SERVICE = { DefaultWastePersistenceService: persistence, DefaultWasteSubmissionService: { get: async input => {
    calls.push(input);
    const matches = records.filter(row => Object.entries(input.query).every(([key, value]) => {
      const found = key.split('.').reduce((current, part) => current?.[part], row);
      return value && typeof value === 'object' && value.$in ? value.$in.includes(found) : found === value;
    })).sort((a,b) => b.updated.localeCompare(a.updated) || a.code.localeCompare(b.code));
    const start = (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize;
    return { count: matches.length, result: matches.slice(start, start + input.searchOptions.pageSize) };
  } } };
});
afterEach(() => { delete global.CONFIG; delete global.SERVICE; });
test('hidden owners and other applications never consume the saved-draft page', async () => {
  records = Array.from({ length: 600 }, (_, i) => record('foreign-'+i, 'other-owner'));
  records.push(record('other-app', 'owner-a', 'APP_B'));
  for(let i=0;i<12;i++) records.push(record('mine-'+String(i).padStart(2,'0')));
  const input = request(); input.query = { owner: 'other-owner', applicationCode: 'APP_B', pageSize: 500 };
  const result = await service.resumeJourney(input);
  assert.equal(result.drafts.total, 12); assert.equal(result.drafts.items.length, 10);
  assert.equal(calls[0].tenant, 'tenant-a'); assert.equal(calls[0].query['submitterRef.code'], 'owner-a');
  assert.equal(calls[0].searchOptions.pageSize, 10);
  assert.equal(result.latestSubmission, null);
  assert.deepEqual(Object.keys(result.drafts.items[0]).sort(), ['code','name','status','updated']);
  assert.equal((await service.resumeJourney({ ...input, query: { page: 2 } })).drafts.items.length, 2);
});
test('a customer with no drafts resumes their latest submitted outcome without private metadata', async () => {
  records = [record('older', 'owner-a', 'APP_A', 'SUBMITTED'), record('latest', 'owner-a', 'APP_A', 'REJECTED', '2026-09-09T11:00:00.000Z'), record('foreign', 'other-owner', 'APP_A', 'APPROVED', '2026-09-09T12:00:00.000Z'), record('archived', 'owner-a', 'APP_A', 'ARCHIVED', '2026-09-09T12:00:00.000Z')];
  const result = await service.resumeJourney(request());
  assert.equal(result.drafts.total, 0); assert.equal(result.latestSubmission.code, 'latest');
  assert.equal(result.latestSubmission.metadata, undefined); assert.equal(calls.length, 2);
});
test('fresh accounts return no journey, while non-customers and invalid pagination fail closed', async () => {
  assert.deepEqual(await service.resumeJourney(request()), { drafts: { items: [], total: 0, page: 1, pageSize: 10 }, latestSubmission: null });
  await assert.rejects(service.resumeJourney({ ...request(), authData: { principalType: 'employee', loginId: 'operator' } }), { code: 'ERR_WASTE_CUSTOMER_REQUIRED' });
  for(const page of [-1, 0, 1.5, 'garbage', 10001]) await assert.rejects(service.resumeJourney({ ...request(), query: { page } }), { code: 'ERR_WASTE_INPUT_INVALID' });
});
