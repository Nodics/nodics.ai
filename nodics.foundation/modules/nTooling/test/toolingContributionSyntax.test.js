/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const tooling = require("../src/service/defaultToolingCommandService");

/** @module nTooling/test/toolingContributionSyntax @description Ensures inert contribution discovery handles normal JS property syntax. @owner nTooling @layer test */
test("quoted and unquoted contribution keys resolve without executing the source", () => {
  for (const key of ["tooling", "'tooling'", '"tooling"']) {
    const source = 'throw new Error("must not execute"); module.exports = {' + key + ': { "acceptance": { enabled: true } } };';
    const block = tooling.findObjectLiteralByProperty(source, "tooling");
    assert.equal(tooling.findObjectLiteralByProperty(block, "acceptance"), "{ enabled: true }");
  }
});

test("comments, strings and non-object properties cannot masquerade as contributions", () => {
  const source = '/* tooling: { fake: true } */ module.exports = { note: "tooling: { fake: true }", tooling: false, next: {} };';
  assert.equal(tooling.findObjectLiteralByProperty(source, "tooling"), null);
  assert.equal(tooling.findObjectLiteralByProperty('{ "tooling": { text: "}" } }', "tooling"), '{ text: "}" }');
});

test("source offsets preserve bounded caller searches", () => {
  const source = 'module.exports = { first: { tooling: { one: 1 } }, second: { tooling: { two: 2 } } };';
  assert.equal(tooling.findObjectLiteralByProperty(source, "tooling", source.indexOf("second")), "{ two: 2 }");
});
