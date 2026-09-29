/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module engagementApi/acceptance/defaultEngagementJourneyAcceptanceService @description Owns feedback lifecycle and public projection acceptance. @owner engagementApi @layer tooling */
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createAcceptanceContext } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';

/** Proves customer intake, correlated operator transitions and public projections through secured owner APIs. */
export async function runEngagementJourneyAcceptance(options = {}) {
  if (options.execute !== true) throw new Error('Explicit --execute is required');
  const { request, authenticate } = await createAcceptanceContext(options);
  const headers = await authenticate();
  const correlation = 'engagement-acceptance-' + randomUUID();
  const submitted = await request('ENGAGEMENT', '/nodics/engagement/v0/public/feedback', {
    method: 'POST', headers: { 'x-correlation-id': correlation }, body: JSON.stringify({ type: 'SUGGESTION',
      subject: 'Functional acceptance', message: correlation, anonymous: true }),
  });
  if (submitted?.status !== 'RECEIVED' || !submitted.code) throw new Error('Feedback intake did not return a received reference');
  let revision = submitted.revision;
  if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Feedback revision is missing');
  const secured = { ...headers, 'x-correlation-id': correlation };
  const records = await request('ENGAGEMENT', `/nodics/engagement/v0/operator/feedback?code=${encodeURIComponent(submitted.code)}&limit=1`, { headers: secured });
  if (!Array.isArray(records) || !records.some(record => record.code === submitted.code)) throw new Error('Operator queue omitted the submitted feedback');
  for (const [action, status] of [['TRIAGE', 'TRIAGED'], ['ASSIGN', 'ASSIGNED'], ['START', 'IN_PROGRESS'], ['RESOLVE', 'RESOLVED'], ['CONFIRM', 'CLOSED']]) {
    const updated = await request('ENGAGEMENT', `/nodics/engagement/v0/operator/feedback/${encodeURIComponent(submitted.code)}/actions/${action}`, {
      method: 'POST', headers: secured, body: JSON.stringify({ expectedRevision: revision, reason: 'Framework feedback lifecycle acceptance' }),
    });
    if (updated?.code !== submitted.code || updated?.status !== status) throw new Error('Feedback action returned an incorrect record or status: ' + action);
    if (!Number.isSafeInteger(updated.revision) || updated.revision <= revision) throw new Error('Feedback action did not advance its revision: ' + action);
    revision = updated.revision;
  }
  const testimonials = await request('ENGAGEMENT', '/nodics/engagement/v0/public/testimonials');
  if (!Array.isArray(testimonials)) throw new Error('Public Engagement projections returned an invalid contract');
  const reviews = await request('ENGAGEMENT', '/nodics/engagement/v0/public/reviews');
  if (!Array.isArray(reviews?.items)) throw new Error('Public Engagement projections returned an invalid contract');
  return { feedbackCode: submitted.code, revision, state: 'PASSED' };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Engagement feedback lifecycle and public projections; requires running runtimes and --execute.');
  else console.log(JSON.stringify(await runEngagementJourneyAcceptance({ execute: process.argv.includes('--execute') })));
}
