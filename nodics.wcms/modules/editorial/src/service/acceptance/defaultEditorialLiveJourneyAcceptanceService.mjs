/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/acceptance/defaultEditorialLiveJourneyAcceptanceService @description Canonical Editorial authoring, workflow, publication and withdrawal evidence. @owner editorial @layer tooling */
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { parseAcceptanceResponse } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { readProjectEnvironmentConfiguration, projectRuntimeAcceptance, projectRuntime, projectEndpointUrl, projectCorsOrigin } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
const require = createRequire(import.meta.url);

/** Executes only after explicit mutation and publication approval intent; fixtures preserve installed Process provenance. */
export async function runEditorialLiveJourneyAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, acceptance, execute = false, approvePublications = false, fetch: fetchRequest = globalThis.fetch,
} = {}) {
  if (execute !== true || approvePublications !== true) throw new Error('Explicit --execute --approve-publications is required');
  const fetch = (url, options = {}) => fetchRequest(url, { ...options, signal: AbortSignal.timeout(30000) });
const environmentProfile = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.NODICS_ENVIRONMENT || environment.ENV || '');
const config = acceptance || projectRuntimeAcceptance(projectRoot, environmentProfile, { role: 'PLATFORM' }).editorialLive;
if (!config?.siteCode) throw new Error('Select an Editorial site fixture');
const requestOrigin = environment.NODICS_ACCEPTANCE_ORIGIN || projectCorsOrigin(environmentProfile, 'axis');
const platformUrl = environment.AXIS_PLATFORM_URL || projectEndpointUrl(environmentProfile, { role: 'PLATFORM' });
const wcmsUrl = environment.AXIS_WCMS_URL || projectEndpointUrl(environmentProfile, { role: 'WCMS_STAGED' });
const wcmsOnlineUrl = environment.AXIS_WCMS_ONLINE_URL || environment.NODICS_WCMS_ONLINE_URL || projectEndpointUrl(environmentProfile, { role: 'WCMS_ONLINE' });
const processUrl = environment.AXIS_PROCESS_URL || projectEndpointUrl(environmentProfile, { role: 'PROCESS' });
const enterpriseCode = environment.AXIS_ENTERPRISE || 'default';
const tenant = environment.AXIS_TENANT || 'default';
const loginId = environment.AXIS_LOGIN_ID || 'admin';
const password = environment.AXIS_PASSWORD || environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD;

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
  return parseAcceptanceResponse(response, {
    route: path,
    errorLimit: 260,
    malformed: (response, text) => `${path} returned non-JSON response: ${text.slice(0, 180)}`,
  });
}


async function expectOk(baseUrl, path) {
  const response = await fetch(endpoint(baseUrl, path));
  if (!response.ok) throw new Error(`${baseUrl}${path} returned HTTP ${response.status}`);
}

async function authenticate() {
  const auth = payload(
    await requestJson(platformUrl, '/nodics/profile/v0/employee/browser/authenticate', {
      body: JSON.stringify({ loginId, password }),
      headers: { Origin: requestOrigin, 'x-enterprise-code': enterpriseCode },
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

/** Verifies definitions installed by the existing Process-owned contribution lifecycle. */
async function ensureEditorialProcessDefinitions(headers) {
  const runtime = projectRuntime(environmentProfile, { role: 'PROCESS' });
  const root = fs.realpathSync(path.join(projectRoot, 'envs', environmentProfile.environment, runtime.server));
  const readFixture = relative => {
    if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.split(/[\\\\/]/).includes('..')) throw new Error('Select a runtime-relative Editorial contribution fixture');
    const file = fs.realpathSync(path.join(root, relative));
    const child = path.relative(root, file);
    if (!child || child.startsWith('..' + path.sep) || path.isAbsolute(child)) throw new Error('Editorial fixture escapes its runtime');
    return require(file);
  };
  const contribution = readFixture(config.contributionPath);
  const manifest = readFixture(config.manifestPath);
  const release = manifest?.sections?.[config.contributionSection];
  if (!release?.version || !Array.isArray(contribution?.definitions) || !contribution.definitions.length || !config.contributionCode)
    throw new Error('Editorial contribution provenance is required');
  for (const definition of contribution.definitions) {
    const existing = payload(await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}`, { headers }));
    if (!existing || !existing.currentVersion || !existing.contributionChecksum || existing.status !== 'PUBLISHED' || existing.contributionCode !== config.contributionCode || existing.contributionVersion !== release.version || !isDeepStrictEqual(existing.graph, definition.graph)) {
      throw new Error(`Process contribution is not installed/current for ${definition.code}`);
    }
    const versions = [].concat(payload(await requestJson(processUrl, `/nodics/process/v0/definitions/${encodeURIComponent(definition.code)}/versions`, { headers })) || []);
    if (!versions.some(version => version.version === existing.currentVersion && version.contributionChecksum === existing.contributionChecksum && isDeepStrictEqual(version.graph, definition.graph))) {
      throw new Error(`Process published version is missing for ${definition.code}`);
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

async function main() {
  console.log('Editorial live journey acceptance started');
  await expectOk(platformUrl, '/nodics/system/v0/health/ready');
  await expectOk(wcmsUrl, '/nodics/system/v0/health/ready');
  await expectOk(wcmsOnlineUrl, '/nodics/system/v0/health/ready');
  await expectOk(processUrl, '/nodics/system/v0/health/ready');
  console.log('PASS local Platform, WCMS Staged, WCMS Online, and Process APIs are reachable');

  const baseHeaders = await authenticate();
  const journeyId = randomUUID().slice(0, 8);
  const correlationId = `editorial-live-${journeyId}`;
  const headers = { ...baseHeaders, 'x-correlation-id': correlationId };
  await ensureEditorialProcessDefinitions(headers);
  console.log('PASS verified Editorial definitions installed by the Process contribution lifecycle');

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
    siteCodes: [config.siteCode],
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
  if (task.status === 'OPEN') await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, {
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
  if (approvedArticle?.code !== articleCode || approvedArticle?.status !== 'APPROVED') throw new Error(`Editorial article was not approved by workflow: ${JSON.stringify(approvedArticle)}`);
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
  if (publication?.state !== 'ONLINE' || publication?.code !== `editorial-${articleCode}-r1` || !Number.isSafeInteger(publication?.revision) || publication.revision < 0) throw new Error(`nPublish did not move Editorial publication ONLINE with matching identity and revision: ${JSON.stringify(publication)}`);
  console.log(`PASS 5 published through nPublish to ONLINE publication ${publication.code}`);

  const list = payload(
    await requestJson(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/articles?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web&limit=5`, {
      headers: baseHeaders,
    }),
  );
  requireItem(list?.items, item => item.articleCode === articleCode && item.slug === slug, 'Published article was missing from delivery listing');
  const detail = payload(
    await requestJson(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/articles/${encodeURIComponent(slug)}?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web`, {
      headers: baseHeaders,
    }),
  );
  if (detail?.articleCode !== articleCode || detail?.title !== localization.title) throw new Error(`Published article detail was incorrect: ${JSON.stringify(detail)}`);
  console.log('PASS 6 verified Online listing and detail delivery projections');

  const structured = payload(
    await requestJson(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/articles/structured?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web&limit=5`, {
      headers: baseHeaders,
    }),
  );
  requireItem(structured?.items, item => item.article?.articleCode === articleCode && item.structuredData?.['@type'] === 'BlogPosting', 'Structured data did not include published BlogPosting');
  const rss = payload(
    await requestJson(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/rss?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web&limit=5`, {
      headers: baseHeaders,
    }),
  );
  requireItem(rss, item => item.title === localization.title, 'RSS projection did not include published article');
  const sitemap = payload(
    await requestJson(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/sitemap?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web&limit=5`, {
      headers: baseHeaders,
    }),
  );
  requireItem(sitemap, item => item.loc === slug, 'Sitemap projection did not include published article');
  console.log('PASS 7 verified structured-data, RSS, and sitemap delivery projections');


  const withdrawn = payload(
    await requestJson(wcmsUrl, `/nodics/editorial/v0/authoring/articles/${encodeURIComponent(articleCode)}/withdraw`, {
      body: JSON.stringify({ publicationCode: publication.code, expectedRevision: publication.revision }),
      headers,
      method: 'POST',
    }),
  );
  if (withdrawn?.state !== 'WITHDRAWN') throw new Error(`Editorial withdrawal did not finish through nPublish: ${JSON.stringify(withdrawn)}`);
  const withdrawnDetail = await fetch(endpoint(wcmsOnlineUrl, `/nodics/editorial/v0/delivery/articles/${encodeURIComponent(slug)}?siteCode=${encodeURIComponent(config.siteCode)}&localeCode=en&channel=web`), { headers: baseHeaders });
  if (withdrawnDetail.status !== 404) throw new Error('Withdrawn article must return 404, not an authorization or server failure');
  console.log('PASS 8 verified live withdrawal through publishing and delivery APIs');

  console.log(`Editorial live journey acceptance completed successfully (${correlationId})`);
}

  return main();
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Editorial live journey requires configured site/contribution fixtures and --execute --approve-publications. No runtime startup or permission changes.');
  else await runEditorialLiveJourneyAcceptance({ execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications') });
}
