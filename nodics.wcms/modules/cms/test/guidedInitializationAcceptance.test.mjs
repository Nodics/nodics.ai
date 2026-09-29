/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runGuidedInitializationAcceptance } from '../src/service/acceptance/defaultGuidedInitializationAcceptanceService.mjs';

function fixture({ denyApproval = false, onlineImportAllowed = false, badNoOp = false } = {}) {
  const calls = [];
  let installs = 0, approved = false;
  const profile = () => ({ profileCode: 'partnerFoundation', destinationRole: 'WCMS_STAGED', status: installs ? 'CURRENT' : 'AVAILABLE',
    steps: ['init', 'core'].map(dataType => ({ dataType, releases: [{ status: 'CURRENT' }] })) });
  const options = {
    execute: true, approvePublications: true, log() {},
    environment: { NODICS_PLATFORM_URL: 'https://platform.invalid', NODICS_PROCESS_URL: 'https://process.invalid', AXIS_ORIGIN: 'https://partner.invalid', AXIS_PASSWORD: 'fixture-only' },
    configuration: { environment: 'partnerLocal', topology: { groups: { backends: [
      { server: 'authoring', role: 'WCMS_STAGED', initializationProfiles: [{ code: 'partnerFoundation', template: 'foundation' }] },
    ] } } },
    acceptance: { runtime: { role: 'WCMS_STAGED' }, profileTemplate: 'foundation', publicationProfiles: ['partnerSite'],
      deliveryProbe: { site: 'partnerSite', path: '/home', locale: 'fr', channel: 'web' } },
    fetch: async (input, request = {}) => {
      const url = new URL(input), route = url.pathname;
      calls.push({ url, request });
      if (route.endsWith('/authenticate')) return Response.json({ authToken: 'fixture' });
      if (route.endsWith('/bootstrap')) return Response.json({ modules: { import: [
        { endpoint: 'https://staged.invalid/nodics/import', runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' } },
        { endpoint: 'https://online.invalid/nodics/import', runtimeRole: { code: 'WCMS_ONLINE', publication: 'ONLINE' } },
      ] } });
      if (url.hostname === 'online.invalid' && route.endsWith('/initialization-profiles'))
        return Response.json({ message: 'dataImport disabled' }, { status: onlineImportAllowed ? 200 : 403 });
      if (route.endsWith('/initialization-profiles')) return Response.json([profile()]);
      if (route.endsWith('/partnerFoundation/validate')) return Response.json({ mode: 'VALIDATE' });
      if (route.endsWith('/partnerFoundation/install')) {
        installs++;
        return Response.json({ mode: 'INSTALL', profile: profile(), results: [{ skipped: installs > 1 && !badNoOp }] });
      }
      if (route.endsWith('/run/history')) return Response.json([{ dataType: 'core' }]);
      if (route.endsWith('/init')) return Response.json([{ releaseCode: 'cms:cmsPublicationApproval', version: '1.0.0', status: 'CURRENT' }]);
      if (route.endsWith('/partnerSite/initialization')) return Response.json(approved ? {
        readiness: 'READY', publication: { code: 'publication', state: 'ONLINE' },
        lineage: { publication: { transitions: [{ toState: 'PENDING_APPROVAL' }] } },
      } : { readiness: 'NOT_READY' });
      if (route.endsWith('/initialization/initiate')) return Response.json({ publication: { code: 'publication', state: 'PENDING_APPROVAL' } });
      if (route.endsWith('/instances')) return Response.json({ items: [{ code: 'instance', definitionCode: 'cmsPublicationApproval', context: { publicationCode: 'publication' }, status: 'WAITING' }] });
      if (route.endsWith('/tasks')) return Response.json({ items: [{ code: 'task', instanceCode: 'instance', nodeCode: 'publicationReview', status: 'OPEN' }] });
      if (route.endsWith('/claim')) return Response.json({});
      if (route.endsWith('/complete')) {
        const { decision } = JSON.parse(request.body);
        assert.equal(decision.emergencyOverride, undefined);
        assert.equal(decision.action, 'APPROVE');
        if (denyApproval) return Response.json({ message: 'approval denied' }, { status: 403 });
        approved = true;
        return Response.json({ instance: { status: 'COMPLETED' } });
      }
      if (route.endsWith('/delivery/pages/resolve')) {
        assert.equal(url.searchParams.get('site'), 'partnerSite');
        assert.equal(url.searchParams.get('locale'), 'fr');
        return Response.json({ page: { code: 'partnerHome' } });
      }
      assert.fail('Unexpected API request ' + route);
    },
  };
  return { options, calls };
}

test('suite import is inert and both execution and publication approval require intent', async () => {
  for (const flags of [{}, { execute: true }, { approvePublications: true }])
    await assert.rejects(runGuidedInitializationAcceptance({ ...flags, fetch: () => assert.fail('no request') }), /Explicit/);
});

test('partner-specific inputs consume canonical initialization, denial and publication assertions', async () => {
  const f = fixture();
  const evidence = await runGuidedInitializationAcceptance(f.options);
  assert.equal(evidence.profileCode, 'partnerFoundation');
  assert.equal(evidence.repeatedInstall, 'SKIPPED_CURRENT');
  assert.equal(evidence.onlineDataImport, 'DISABLED');
  assert.equal(evidence.onlineDelivery, 'AVAILABLE');
});

test('normal approval rejection propagates without emergency retry or delivery', async () => {
  const f = fixture({ denyApproval: true });
  await assert.rejects(runGuidedInitializationAcceptance(f.options), /403/);
  assert.equal(f.calls.filter(c => c.url.pathname.endsWith('/complete')).length, 1);
  assert(!f.calls.some(c => c.url.pathname.endsWith('/delivery/pages/resolve')));
});

test('Online import exposure and non-idempotent initialization cannot pass qualification', async () => {
  for (const defect of [{ onlineImportAllowed: true }, { badNoOp: true }]) {
    const f = fixture(defect);
    await assert.rejects(runGuidedInitializationAcceptance(f.options), /Online runtime must reject|idempotent no-op/);
    assert(!f.calls.some(c => c.url.pathname.endsWith('/initialization/initiate')));
  }
});
