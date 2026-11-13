/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nConfig/test/deploymentProjectionLifetime @description Verifies isolated CLI completion with retained handles and bounded failure output without loading runtime providers. @owner nConfig @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const owner = require.resolve("../src/service/defaultDeploymentConfigurationProjectionService");

/** Runs a real isolated child with an intentionally retained timer and controlled projection. */
function child(expression) {
  return spawnSync(process.execPath, ["-e", `const owner = require(${JSON.stringify(owner)}); setInterval(() => {}, 1000); owner.resolve = ${expression}; owner.runCli({});`], {
    encoding: "utf8", timeout: 3000, maxBuffer: 2 * 1024 * 1024,
  });
}
test("completed CLI flushes large private output and exits despite retained module timers", () => {
  const result = child('async () => ({ properties: { text: "x".repeat(700000) } })');
  assert.equal(result.status, 0); assert.equal(result.error, undefined);
  assert.equal(JSON.parse(result.stdout).properties.text.length, 700000);
  assert.equal(result.stderr, "");
});
test("failed CLI terminates and never prints dependency errors or credential-like text", () => {
  const result = child('async () => { throw new Error("PRIVATE_FIXTURE_CREDENTIAL"); }');
  assert.equal(result.status, 1); assert.equal(result.error, undefined);
  assert.equal(result.stdout, ""); assert.equal(result.stderr, "Configuration projection failed.\n");
});
test("library read replaces output-bearing child exceptions with bounded coordinates", () => {
  const script = `const cp = require('node:child_process'); cp.execFileSync = () => { throw Object.assign(new Error('PRIVATE_FIXTURE'), {code:'ETIMEDOUT', stdout:'PRIVATE_FIXTURE', stderr:'PRIVATE_FIXTURE'}); }; const owner = require(${JSON.stringify(owner)}); try { owner.read({projectRoot:process.cwd(),environment:'testLocal',server:'testServer'}); process.exit(2); } catch (error) { process.stdout.write(JSON.stringify({message:error.message,keys:Object.keys(error)})); }`;
  const result = spawnSync(process.execPath, ["-e", script], { encoding: "utf8", timeout: 3000 });
  assert.equal(result.status, 0); assert.doesNotMatch(result.stdout, /PRIVATE_FIXTURE/);
  assert.deepEqual(JSON.parse(result.stdout), { message: "Configuration projection failed for testLocal/testServer: ETIMEDOUT", keys: [] });
});
