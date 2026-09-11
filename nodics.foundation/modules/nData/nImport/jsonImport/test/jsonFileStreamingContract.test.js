/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const service = require("../src/service/init/defaultJsonFileDataProcessService");

/**
 * @module jsonImport/test/jsonFileStreamingContract
 * @description Verifies JSON stream parsing and asynchronous import chunk delivery.
 * @layer test
 * @owner jsonImport
 */
test("JSON streaming preserves records, chunk order, diagnostics and parse failures", async (t) => {
  const folder = await fs.mkdtemp(
    path.join(os.tmpdir(), "nodics-json-stream-"),
  );
  const previousConfig = global.CONFIG;
  const previousService = global.SERVICE;
  t.after(async () => {
    global.CONFIG = previousConfig;
    global.SERVICE = previousService;
    await fs.rm(folder, { recursive: true, force: true });
  });
  const chunks = [];
  let recordsRead = 0;
  let concurrent = 0;
  global.CONFIG = { get: () => ({ readBufferSize: 1 }) };
  global.SERVICE = {
    DefaultImportDiagnosticsService: {
      increment: (_request, metric, count) => {
        assert.equal(metric, "recordsRead");
        recordsRead += count;
      },
    },
    DefaultPipelineService: {
      start: async (handler, request) => {
        assert.equal(handler, "importChunk");
        assert.equal(++concurrent, 1);
        const snapshot = JSON.parse(JSON.stringify(request.models));
        const version = request.outputPath.version;
        await new Promise((resolve) => setImmediate(resolve));
        chunks.push({ models: snapshot, version });
        concurrent--;
      },
    },
  };
  const values = [
    { code: "a", nested: { text: "Arabic العربية", enabled: true } },
    { code: "b", value: null },
    { code: "c", list: [1, 2] },
  ];
  const first = path.join(folder, "first.json");
  const empty = path.join(folder, "empty.json");
  const second = path.join(folder, "second.json");
  await fs.writeFile(first, JSON.stringify(values));
  await fs.writeFile(empty, "[]");
  await fs.writeFile(second, '[{"code":"d"}]');
  const request = {
    header: { options: { dataHandler: "importChunk" } },
    outputPath: {},
  };
  await service.handleFiles(request, {}, [first, empty, second], 0);
  assert.deepEqual(
    chunks.flatMap((chunk) => chunk.models),
    [...values, { code: "d" }],
  );
  assert.deepEqual(
    chunks.map((chunk) => chunk.version),
    ["0_0", "0_1", "0_2", "2_0"],
  );
  assert.equal(recordsRead, 4);
  const malformed = path.join(folder, "malformed.json");
  await fs.writeFile(malformed, '[{"code":');
  await assert.rejects(service.handleFiles(request, {}, [malformed], 0));
  await fs.writeFile(malformed, '{"not":"an array"}');
  await assert.rejects(service.handleFiles(request, {}, [malformed], 0));
  await assert.rejects(
    service.handleFiles(request, {}, [path.join(folder, "absent.json")], 0),
  );
});
