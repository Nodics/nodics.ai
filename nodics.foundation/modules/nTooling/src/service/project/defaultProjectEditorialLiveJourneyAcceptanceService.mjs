#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const workspaceRoot = path.resolve(projectRoot, '..');
const axisUrl = process.env.AXIS_URL || 'http://127.0.0.1:3100';
const platformUrl = process.env.AXIS_PLATFORM_URL || 'http://127.0.0.1:4300';
const wcmsUrl = process.env.AXIS_WCMS_URL || 'http://127.0.0.1:4312';
const processUrl = process.env.AXIS_PROCESS_URL || 'http://127.0.0.1:4330';
const enterpriseCode = process.env.AXIS_ENTERPRISE || 'default';
const tenant = process.env.AXIS_TENANT || 'default';
const loginId = process.env.AXIS_LOGIN_ID || 'admin';
const password = process.env.AXIS_PASSWORD || 'adminPassword';

function endpoint(baseUrl, path) {
  return new URL(path, baseUrl).toString();
}

function payload(body) {
  if (!body || typeof body !== 'object') return body;
  if ('result' in body) return body.result;
  if ('data' in body) return body.data;
  return body;
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(endpoint(baseUrl, path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${path} returned non-JSON response: ${text.slice(0, 180)}`);
  }
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 260)}`);
  }
  return body;
}

async function optionalDelete(baseUrl, path, headers) {
  const response = await fetch(endpoint(baseUrl, path), {
    headers: { Accept: 'application/json', ...headers },
    method: 'DELETE',
  });
  if (response.ok || response.status === 404 || response.status === 400) return;
  const text = await response.text();
  throw new Error(`${path} cleanup returned HTTP ${response.status}: ${text.slice(0, 180)}`);
}

async function expectOk(baseUrl, path) {
  const response = await fetch(endpoint(baseUrl, path));
  if (!response.ok) throw new Error(`${baseUrl}${path} returned HTTP ${response.status}`);
}

async function authenticate() {
  const auth = payload(
    await requestJson(platformUrl, '/nodics/profile/v0/employee/browser/authenticate', {
      body: JSON.stringify({ loginId, password }),
      headers: { Origin: axisUrl, 'x-enterprise-code': enterpriseCode },
      method: 'POST',
    }),
  );
  if (!auth?.authToken) throw new Error('Platform authentication returned no auth token');
  return {
    Authorization: `Bearer ${auth.authToken}`,
    tenant,
    'x-enterprise-code': enterpriseCode,
  };
}

async function saveModel(path, model, headers) {
  return payload(
    await requestJson(wcmsUrl, path, {
      body: JSON.stringify(model),
      headers,
      method: 'PUT',
    }),
  );
}

async function updateModel(path, query, model, headers) {
  return payload(
    await requestJson(wcmsUrl, path, {
      body: JSON.stringify({ options: { returnModified: true }, query, model }),
      headers,
      method: 'PATCH',
    }),
  );
}

async function ensureEditorialProcessDefinitions(headers) {
  const definitions = require(path.join(projectRoot, 'envs/kickoffLocal/processServer/data/init-v001/records/editorial/defaultEditorialProcessDefinitionData.js'));
  for (const definition of Object.values(definitions)) {
    let existing;
    try {
      existing = payload(await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}`, { headers }));
    } catch (error) {
      if (!String(error.message || '').includes('HTTP 404')) throw error;
    }
    if (!existing) {
      existing = payload(await requestJson(processUrl, '/nodics/process/v0/definitions', {
        body: JSON.stringify({
          code: definition.code,
          name: definition.name,
          description: definition.description || definition.name,
          category: definition.category,
          ownerModule: definition.ownerModule,
          graph: definition.graph,
        }),
        headers,
        method: 'POST',
      }));
    }
    let versions = [];
    try {
      versions = [].concat(payload(await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}/versions`, { headers })) || []);
    } catch (error) {
      if (!String(error.message || '').includes('HTTP 404')) throw error;
    }
    if (existing.status === 'DRAFT' || versions.length === 0) {
      await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}/draft/validate`, { headers, method: 'POST' });
      await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}/draft/publish`, { headers, method: 'POST' });
    }
  }
}

function requireItem(items, predicate, message) {
  const item = []
    .concat(items || [])
    .find(predicate);
  if (!item) throw new Error(message);
  return item;
}

async function runNexusEvidence() {
  await execFileAsync('npm', ['run', 'nexus:check'], {
    cwd: projectRoot,
  });
  await execFileAsync('npm', ['--prefix', '../nodics.exp/nodics.nexus', 'test', '--', 'EditorialRenderers.test.tsx'], {
    cwd: projectRoot,
  });
}

async function runRollbackContractEvidence() {
  await execFileAsync('node', ['--test', 'modules/nPublish/test/publicationLifecycleService.test.js', 'modules/nPublish/test/publicationWithdrawalContract.test.js'], {
    cwd: path.join(workspaceRoot, 'nodics.ai', 'nodics.foundation'),
  });
}

async function main() {
  console.log('Editorial live journey acceptance started');
  await expectOk(platformUrl, '/nodics/system/v0/health/ready');
  await expectOk(wcmsUrl, '/nodics/system/v0/health/ready');
  await expectOk(processUrl, '/nodics/system/v0/health/ready');
  await expectOk(axisUrl, '/content/editorial');
  console.log('PASS local Platform, WCMS, Process, and Axis are reachable');

  const baseHeaders = await authenticate();
  const journeyId = randomUUID().slice(0, 8);
  const correlationId = `editorial-live-${journeyId}`;
  const headers = { ...baseHeaders, 'x-correlation-id': correlationId };
  await ensureEditorialProcessDefinitions(headers);
  console.log('PASS installed Editorial Process definitions into the Process runtime');

  const articleCode = `editorial-live-${journeyId}`;
  const authorCode = `editorial-author-${journeyId}`;
  const taxonomyCode = `editorial-taxonomy-${journeyId}`;
  const localizationCode = `${articleCode}-en`;
  const slug = `editorial-live-${journeyId}`;
  const article = {
    code: articleCode,
    accessGroups: ['userGroup'],
    active: true,
    contentTypeCode: 'BLOG',
    description: 'Generated Editorial live acceptance article.',
    internalName: 'Editorial live acceptance article',
    slug,
    siteCodes: ['nexusCorporateSite'],
    authorCodes: [authorCode],
    taxonomyTermCodes: [taxonomyCode],
    status: 'DRAFT',
    revision: 1,
  };
  const localization = {
    code: localizationCode,
    accessGroups: ['userGroup'],
    active: true,
    articleCode,
    localeCode: 'en',
    title: 'Editorial live acceptance article',
    summary: 'Evidence that Editorial can move from authoring to Online delivery.',
    body: { blocks: [{ type: 'paragraph', text: 'Live acceptance content body.' }] },
    seo: { title: 'Editorial live acceptance article' },
    slug,
    status: 'READY',
    revision: 1,
  };

  await optionalDelete(wcmsUrl, `/nodics/editorial/v0/editorialarticlelocalization/code/${encodeURIComponent(localizationCode)}`, headers);
  await optionalDelete(wcmsUrl, `/nodics/editorial/v0/editorialarticle/code/${encodeURIComponent(articleCode)}`, headers);
  await optionalDelete(wcmsUrl, `/nodics/editorial/v0/editorialauthor/code/${encodeURIComponent(authorCode)}`, headers);
  await optionalDelete(wcmsUrl, `/nodics/editorial/v0/editorialtaxonomyterm/code/${encodeURIComponent(taxonomyCode)}`, headers);

  await saveModel('/nodics/editorial/v0/editorialauthor', {
    code: authorCode,
    accessGroups: ['userGroup'],
    active: true,
    displayName: 'Editorial Acceptance Author',
    description: 'Generated Editorial live acceptance author.',
    biography: { en: 'Acceptance evidence author.' },
    status: 'ACTIVE',
  }, headers);
  await saveModel('/nodics/editorial/v0/editorialtaxonomyterm', {
    code: taxonomyCode,
    accessGroups: ['userGroup'],
    active: true,
    taxonomyCode: 'topic',
    description: 'Generated Editorial live acceptance taxonomy.',
    name: 'Acceptance',
    slug: 'acceptance',
    }, headers);
  await saveModel('/nodics/editorial/v0/editorialarticle', article, headers);
  await saveModel('/nodics/editorial/v0/editorialarticlelocalization', localization, headers);
  console.log('PASS 1 created Editorial Article and related records in Staged authoring');

  const validation = payload(
    await requestJson(wcmsUrl, '/nodics/editorial/v0/authoring/articles/validate', {
      body: JSON.stringify({ article, localizations: [localization] }),
      headers,
      method: 'POST',
    }),
  );
  if (!validation?.valid || validation?.article?.status !== 'READY') throw new Error(`Editorial validation blocked: ${JSON.stringify(validation)}`);
  const readyArticle = Object.assign({}, article, validation.article);
  console.log('PASS 2 validated Editorial content and marked article READY before workflow');

  const submitted = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/authoring/articles/${encodeURIComponent(articleCode)}/submit`, {
      body: JSON.stringify({ article: readyArticle, localizations: [localization] }),
      headers,
      method: 'POST',
    }),
  );
  const workflowInstanceCode = submitted?.workflowInstanceCode || submitted?.processResult?.instance?.code;
  if (!workflowInstanceCode) throw new Error(`Editorial submit did not return workflow instance evidence: ${JSON.stringify(submitted)}`);
  console.log(`PASS 3 started Editorial approval workflow ${workflowInstanceCode}`);

  const tasks = payload(
    await requestJson(processUrl, `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(workflowInstanceCode)}&limit=10`, {
      headers,
    }),
  );
  const task = requireItem(tasks?.items || tasks, item => item.instanceCode === workflowInstanceCode && ['OPEN', 'CLAIMED', 'ESCALATED'].includes(item.status), 'No open Editorial workflow task was found');
  await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, {
    headers,
    method: 'POST',
  });
  const completed = payload(
    await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
      body: JSON.stringify({ decision: { approved: true, action: 'APPROVE' } }),
      headers,
      method: 'POST',
    }),
  );
  if (completed?.instance?.status !== 'COMPLETED') throw new Error(`Editorial workflow did not complete: ${JSON.stringify(completed)}`);
  const approvedRead = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/editorialarticle/code/${encodeURIComponent(articleCode)}`, {
      headers,
    }),
  );
  const approvedArticle = Array.isArray(approvedRead) ? approvedRead[0] : approvedRead;
  if (approvedArticle?.status !== 'APPROVED') throw new Error(`Editorial article was not approved by workflow: ${JSON.stringify(approvedArticle)}`);
  console.log('PASS 4 approved workflow and applied Editorial APPROVED status');

  const publication = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/authoring/articles/${encodeURIComponent(articleCode)}/publish`, {
      body: JSON.stringify({
        article: {
          code: articleCode,
          revision: 1,
          status: 'APPROVED',
          workflowInstanceCode,
        },
        publicationCode: `editorial-${articleCode}-r1`,
      }),
      headers,
      method: 'POST',
    }),
  );
  if (publication?.state !== 'ONLINE') throw new Error(`nPublish did not move Editorial publication ONLINE: ${JSON.stringify(publication)}`);
  console.log(`PASS 5 published through nPublish to ONLINE publication ${publication.code}`);

  const list = payload(
    await requestJson(wcmsUrl, '/nodics/editorial/v0/delivery/articles?siteCode=nexusCorporateSite&localeCode=en&channel=web&limit=5', {
      headers: baseHeaders,
    }),
  );
  requireItem(list?.items, item => item.articleCode === articleCode && item.slug === slug, 'Published article was missing from delivery listing');
  const detail = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/delivery/articles/${encodeURIComponent(slug)}?siteCode=nexusCorporateSite&localeCode=en&channel=web`, {
      headers: baseHeaders,
    }),
  );
  if (detail?.articleCode !== articleCode || detail?.title !== localization.title) throw new Error(`Published article detail was incorrect: ${JSON.stringify(detail)}`);
  console.log('PASS 6 verified Online listing and detail delivery projections');

  const structured = payload(
    await requestJson(wcmsUrl, '/nodics/editorial/v0/delivery/articles/structured?siteCode=nexusCorporateSite&localeCode=en&channel=web&limit=5', {
      headers: baseHeaders,
    }),
  );
  requireItem(structured?.items, item => item.article?.articleCode === articleCode && item.structuredData?.['@type'] === 'BlogPosting', 'Structured data did not include published BlogPosting');
  const rss = payload(
    await requestJson(wcmsUrl, '/nodics/editorial/v0/delivery/rss?siteCode=nexusCorporateSite&localeCode=en&channel=web&limit=5', {
      headers: baseHeaders,
    }),
  );
  requireItem(rss, item => item.title === localization.title, 'RSS projection did not include published article');
  const sitemap = payload(
    await requestJson(wcmsUrl, '/nodics/editorial/v0/delivery/sitemap?siteCode=nexusCorporateSite&localeCode=en&channel=web&limit=5', {
      headers: baseHeaders,
    }),
  );
  requireItem(sitemap, item => item.loc === slug, 'Sitemap projection did not include published article');
  console.log('PASS 7 verified structured-data, RSS, and sitemap delivery projections');

  await runNexusEvidence();
  console.log('PASS 8 verified Nexus Editorial listing/detail renderer contracts and backend content-pack wiring');

  const withdrawn = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/authoring/articles/${encodeURIComponent(articleCode)}/withdraw`, {
      body: JSON.stringify({ publicationCode: publication.code, expectedRevision: publication.revision }),
      headers,
      method: 'POST',
    }),
  );
  if (withdrawn?.state !== 'WITHDRAWN') throw new Error(`Editorial withdrawal did not finish through nPublish: ${JSON.stringify(withdrawn)}`);
  let withdrawnDetailFailed = false;
  try {
    await requestJson(wcmsUrl, `/nodics/editorial/v0/delivery/articles/${encodeURIComponent(slug)}?siteCode=nexusCorporateSite&localeCode=en&channel=web`, {
      headers: baseHeaders,
    });
  } catch {
    withdrawnDetailFailed = true;
  }
  if (!withdrawnDetailFailed) throw new Error('Withdrawn article remained visible in delivery detail');
  await runRollbackContractEvidence();
  console.log('PASS 9 verified live withdrawal and nPublish rollback source-contract evidence');

  console.log(`Editorial live journey acceptance completed successfully (${correlationId})`);
}

main().catch(error => {
  console.error(`[editorial-live] FAIL ${error.stack || error.message}`);
  process.exitCode = 1;
});
