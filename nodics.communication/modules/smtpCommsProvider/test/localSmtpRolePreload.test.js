/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/test/localSmtpRolePreload @description Artificial child environment isolation proofs, not installed qualification. @owner smtpCommsProvider @layer test */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
test('exact selected build/start receives binding; other roles and authority mismatches do not', async () => {
  const { scopedOptions } = await import(pathToFileURL(path.join(__dirname, 'helpers/localSmtpRolePreload.mjs')));
  const binding = { NODICS_EMPLOYEE_SMTP_PASSWORD: 'artificial-only-binding', NODICS_EMPLOYEE_SMTP_HOST: '127.0.0.1' };
  const selection = { project: '/isolated/project', environment: 'isolatedLocal', server: 'deliveryServer', script: 'start:delivery' };
  const options = { cwd: selection.project, env: { ENV: selection.environment, UNRELATED: 'preserve',
    ...binding, NODICS_EMPLOYEE_SMTP_ENABLED: 'true', NODICS_EMPLOYEE_VERIFICATION_STORE_ENABLED: 'true',
    NODICS_LOCAL_SMTP_CAPTURE_DIRECTORY: '/private/fixture' } };
  const snapshot = structuredClone(options);
  for (const [command, args, patch, admitted] of [
    ['npm', ['run', selection.script], {}, true],
    ['nodics', ['build', '--environment=isolatedLocal', '--server=deliveryServer'], {}, true],
    ['nodics', ['start', '--environment=isolatedLocal', '--server=deliveryServer'], {}, true],
    ...['platform', 'process', 'commerce', 'waste', 'loyalty', 'location', 'wcmsOnline', 'wcmsStaged', 'commerceStaged']
      .map(role => ['npm', ['run', 'start:' + role], {}, false]),
    ['npm', ['run', selection.script], { cwd: '/other/project' }, false],
    ['npm', ['run', selection.script], { env: { ...options.env, ENV: 'otherLocal' } }, false],
    ['node', ['run', selection.script], {}, false],
    ['npm', ['run', selection.script, '--extra'], {}, false],
  ]) {
    const output = scopedOptions(command, args, { ...options, ...patch }, binding, selection);
    assert.equal(Object.hasOwn(output.env, 'NODICS_EMPLOYEE_SMTP_PASSWORD'), admitted);
    assert.equal(Object.hasOwn(output.env, 'NODICS_EMPLOYEE_SMTP_ENABLED'), admitted);
    assert.equal(Object.hasOwn(output.env, 'NODICS_EMPLOYEE_VERIFICATION_STORE_ENABLED'), admitted);
    assert.equal(Object.hasOwn(output.env, 'NODICS_LOCAL_SMTP_CAPTURE_DIRECTORY'), false);
    assert.equal(output.env.UNRELATED, 'preserve');
  }
  assert.deepEqual(options, snapshot);
});
