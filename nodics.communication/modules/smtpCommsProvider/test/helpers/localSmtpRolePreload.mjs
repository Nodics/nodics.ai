/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/test/helpers/localSmtpRolePreload @description Explicit test-only child-process binding isolation; no shared runtime configuration. @owner smtpCommsProvider @layer test */
import cp from 'node:child_process';
import path from 'node:path';
import { syncBuiltinESMExports } from 'node:module';
import { readBinding } from '../localSmtpCapture.mjs';

const controls = ['NODICS_LOCAL_SMTP_CAPTURE_DIRECTORY', 'NODICS_LOCAL_SMTP_CAPTURE_PROJECT',
  'NODICS_LOCAL_SMTP_CAPTURE_ENVIRONMENT', 'NODICS_LOCAL_SMTP_CAPTURE_SERVER', 'NODICS_LOCAL_SMTP_CAPTURE_SCRIPT'];
const switches = ['NODICS_EMPLOYEE_SMTP_ENABLED', 'NODICS_EMPLOYEE_VERIFICATION_STORE_ENABLED'];

/** Removes all provider bindings except for the exact approved command, cwd and environment. */
export function scopedOptions(command, args, options, binding, selection) {
  const env = { ...(options?.env || process.env) };
  for (const key of [...Object.keys(binding), ...switches, ...controls]) delete env[key];
  const name = path.basename(command), actual = JSON.stringify(args);
  const selected = path.resolve(options?.cwd || process.cwd()) === selection.project &&
    env.ENV === selection.environment &&
    (name === 'npm' && actual === JSON.stringify(['run', selection.script]) ||
      name === 'nodics' && ['build', 'start'].some(action => actual === JSON.stringify([
        action, '--environment=' + selection.environment, '--server=' + selection.server])));
  if (selected) Object.assign(env, binding, Object.fromEntries(switches.map(key => [key, 'true'])));
  return { ...options, env };
}

/** Installs only in the explicitly operated supervisor; secrets remain in a closure, never argv. */
export function installRoleBinding(binding, selection) {
  for (const method of ['spawn', 'spawnSync']) {
    const original = cp[method];
    cp[method] = function(command, args, options) {
      return original.call(this, command, args, scopedOptions(command, args, options, binding, selection));
    };
  }
  for (const key of [...Object.keys(binding), ...switches, ...controls]) delete process.env[key];
  syncBuiltinESMExports();
}

if (!process.env.NODE_TEST_CONTEXT && process.env.NODICS_LOCAL_SMTP_CAPTURE_DIRECTORY) {
  try {
    const selection = { project: process.env.NODICS_LOCAL_SMTP_CAPTURE_PROJECT,
      environment: process.env.NODICS_LOCAL_SMTP_CAPTURE_ENVIRONMENT,
      server: process.env.NODICS_LOCAL_SMTP_CAPTURE_SERVER, script: process.env.NODICS_LOCAL_SMTP_CAPTURE_SCRIPT };
    if (!selection.project || path.resolve(selection.project) !== selection.project ||
        ['environment', 'server', 'script'].some(key => !/^[A-Za-z][A-Za-z0-9:_-]{0,100}$/.test(selection[key] || '')) ||
        process.env.ENV !== selection.environment) throw new Error();
    installRoleBinding(readBinding(process.env.NODICS_LOCAL_SMTP_CAPTURE_DIRECTORY), selection);
  } catch { process.stderr.write('LOCAL_SMTP_ROLE_BINDING_REFUSED\n'); process.exit(1); }
}
