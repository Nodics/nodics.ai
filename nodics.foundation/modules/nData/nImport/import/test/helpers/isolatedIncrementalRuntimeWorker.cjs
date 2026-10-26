/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module import/test/helpers/isolatedIncrementalRuntimeWorker @description Normal build/start child for a private test deployment; no registry substitution or custom authority. @layer test @owner import */
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const c = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const foundation = require(path.join(c.frameworkRoot, 'nodics.foundation'));
  const options = {
    NODICS_HOME: path.join(c.frameworkRoot, 'nodics.foundation'), CUSTOM_HOME: c.root,
    MODULE_ROOTS: ['nodics.foundation', 'nodics.platform'].map(name => path.join(c.frameworkRoot, name)).concat(c.root),
    defaultEnvironment: c.environmentName, defaultServer: c.serverName,
  };
  const stop = async () => {
    if (global.SERVICE?.DefaultRuntimeLifecycleService)
      await SERVICE.DefaultRuntimeLifecycleService.requestShutdown({ reason: 'isolated-import-acceptance' });
    process.exit(0);
  };
  process.on('message', message => { if (message === 'stop') stop().catch(() => process.exit(1)); });
  process.on('SIGTERM', () => stop().catch(() => process.exit(1)));
  if (process.argv[3] === 'build') {
    await foundation.buildAll(options);
    process.send?.({ state: 'BUILT' });
    return;
  }
  if (process.argv[3] !== 'start') throw new Error('Unknown isolated runtime mode');
  await foundation.start(options);
  if (!NODICS.getActiveModules().includes('importAcceptanceFixture') || !NODICS.getActiveModules().includes('import'))
    throw new Error('Canonical runtime must load both fixture and implementing Import owner');
  process.send?.({ state: 'STARTED' });
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
  if (process.connected) process.disconnect();
});
