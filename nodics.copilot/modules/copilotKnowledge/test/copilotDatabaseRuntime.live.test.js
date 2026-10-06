/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotDatabaseRuntime
 * @description Exercises live collection discovery and bounded native-owner queries using real Profile employee credentials.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("./helpers/runtimeAcceptance/runtimeFixture");

test(
  "live database source preserves employee authority and collection exclusions",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withDatabase: true,
      withRegistration: true,
      withRuntimeKnowledge: true,
    });
    t.after(() => runtime.close());
    let token;
    /** Calls only existing authenticated APIs with bounded waiting and no retry. */
    async function request(path, body, status = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(60000),
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": "default",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const value = await response.json();
      assert.equal(response.status, status, JSON.stringify(value));
      return value.data || value.result;
    }
    /** Obtains the current employee token from the real identity owner. */
    async function login(role = "operator") {
      token = undefined;
      const result = await request("profile/v0/employee/authenticate", {
        loginId: "copilot_acceptance_" + role,
        password: runtime.password,
      });
      token = result.authToken;
      assert.ok(token);
    }
    const route = "copilotApi/v0/knowledge/sources/acceptance-data";
    await login("reader");
    await request(route + "/collections", undefined, 403);
    await login();
    const nativeSchemas = await request("profile/v0/schemas");
    assert.equal(nativeSchemas.moduleName, "profile");
    const sources = await request("copilotApi/v0/knowledge/sources");
    for (const code of ["acceptance-runtime-code", "acceptance-runtime-docs"]) {
      const partition = sources.sources.find((x) => x.code === code);
      assert.equal(partition.runtimeBinding.moduleName, "copilotKnowledge");
      assert.doesNotMatch(
        JSON.stringify(partition.runtimeBinding),
        /\/Users\/|\/private\//,
      );
      const preview = await request(
        "copilotApi/v0/knowledge/sources/" + code + "/preview",
        {},
      );
      assert.equal(preview.filesAccepted, 1);
      const refreshed = await request(
        "copilotApi/v0/knowledge/sources/" + code + "/refresh",
        {},
      );
      assert.ok(refreshed.chunksWritten > 0);
      assert.ok(refreshed.publication.generation);
    }
    const inventory = await request(route + "/collections");
    assert.equal(inventory.sourceCode, "acceptance-data");
    assert.equal(
      inventory.items.find((x) => x.schemaName === "enterprise")?.selected,
      true,
    );
    assert.equal(
      inventory.items.find((x) => x.schemaName === "employee")?.selected,
      false,
    );
    const created = await request("copilotApi/v0/conversations", {
      title: "Selected collection discovery acceptance",
    });
    const conversation =
      "copilotApi/v0/conversations/" + created.conversation.conversationCode;
    const discoveryCommand = {
      message: JSON.stringify({
        intent: "copilot.data.collections",
        sourceCode: "acceptance-data",
        input: {},
      }),
      idempotencyKey: "selected-collection-discovery",
    };
    const discovered = await request(conversation + "/turns", discoveryCommand);
    assert.equal(discovered.turn.state, "COMPLETED");
    const events = await request(
      conversation + "/turns/" + discovered.turn.turnCode + "/events",
    );
    const answer = events.items
      .filter((event) => event.eventType === "TEXT_DELTA")
      .map((event) => event.data.text)
      .join("");
    assert.match(answer, /Selected collections:/);
    assert.match(answer, /no business records were read/);
    assert.match(answer, /"schemaName": "enterprise"/);
    assert.doesNotMatch(answer, /"schemaName": "employee"/);
    assert.equal(
      (await request(conversation + "/turns", discoveryCommand)).turn.turnCode,
      discovered.turn.turnCode,
    );
    const inspections = [];
    for (const kind of ["schema", "capabilities", "deleteImpact"]) {
      t.diagnostic("Native inspection case: " + kind);
      if (kind === "deleteImpact") {
        assert.equal(
          nativeSchemas.schemas
            .find((item) => item.schemaName === "enterprise")
            .operations.includes("delete"),
          false,
        );
        await request(
          conversation + "/turns",
          {
            message: JSON.stringify({
              intent: "copilot.data.deleteImpact",
              sourceCode: "acceptance-data",
              input: {
                schemaName: "enterprise",
                identity: { code: "default" },
              },
            }),
            idempotencyKey: "impact-native-delete-denied",
          },
          503,
        );
      }
      const command = {
        message: JSON.stringify({
          intent: "copilot.data." + kind,
          sourceCode: "acceptance-data",
          input: {
            schemaName: kind === "deleteImpact" ? "address" : "enterprise",
            ...(kind === "deleteImpact"
              ? { identity: { code: "acceptance-absent-address" } }
              : {}),
          },
        }),
        idempotencyKey: "inspection-" + kind,
      };
      const inspected = await request(conversation + "/turns", command);
      assert.equal(inspected.turn.state, "COMPLETED");
      const inspectionEvents = await request(
        conversation + "/turns/" + inspected.turn.turnCode + "/events",
      );
      const text = inspectionEvents.items
        .filter((event) => event.eventType === "TEXT_DELTA")
        .map((event) => event.data.text)
        .join("");
      assert.match(
        text,
        kind === "deleteImpact" ? /No records were changed/ : /Metadata only/,
      );
      assert.match(text, new RegExp('"inspection": "' + kind + '"'));
      assert.doesNotMatch(
        text,
        /apiOperations|relationships|sourceModule|password|apiKey/,
      );
      if (kind === "deleteImpact") {
        assert.match(text, /"targetCount": 0/);
        assert.match(text, /zero matching targets may mean/);
      }
      assert.equal(
        (await request(conversation + "/turns", command)).turn.turnCode,
        inspected.turn.turnCode,
      );
      inspections.push({ command, code: inspected.turn.turnCode });
      await request(
        conversation + "/turns",
        {
          message: JSON.stringify({
            intent: "copilot.data." + kind,
            sourceCode: "acceptance-data",
            input: { schemaName: "employee" },
          }),
          idempotencyKey: "excluded-" + kind,
        },
        400,
      );
    }
    const result = await request(route + "/query", {
      schemaName: "enterprise",
      search: "default",
      page: 1,
    });
    assert.equal(result.schemaName, "enterprise");
    assert.ok(Array.isArray(result.records));
    assert.ok(
      result.records.length > 0,
      "Owner-approved default enterprise must be visible",
    );
    const descriptor = nativeSchemas.schemas.find(
      (x) => x.schemaName === "enterprise",
    );
    const nativeRoute =
      "profile/" +
      descriptor.apiOperations.search.apiVersion +
      descriptor.apiOperations.search.path;
    const native = await request(nativeRoute, {
      query: { search: "default", pageSize: result.limit, pageNumber: 1 },
    });
    const fields = new Set(
      descriptor.fields
        .filter((x) => !x.sensitive && !x.hidden)
        .map((x) => x.name),
    );
    assert.deepEqual(
      result.records,
      native.records.map((row) =>
        Object.fromEntries(
          Object.entries(row).filter(
            ([key, value]) =>
              fields.has(key) &&
              (value === null ||
                ["string", "number", "boolean"].includes(typeof value)),
          ),
        ),
      ),
    );
    assert.ok(
      result.records.every((row) =>
        Object.values(row).every(
          (v) =>
            v === null || ["string", "number", "boolean"].includes(typeof v),
        ),
      ),
    );
    for (const body of [
      { schemaName: "employee", search: "copilot" },
      { schemaName: "enterprise", search: { $ne: null } },
      { schemaName: "enterprise", search: "default", query: {} },
      { schemaName: "enterprise", search: "default", tenant: "other" },
    ])
      await request(route + "/query", body, 400);
    await login("dataonly");
    const restricted = await request(route + "/collections");
    assert.equal(
      restricted.items.some((x) => x.schemaName === "enterprise"),
      false,
    );
    await request(
      route + "/query",
      { schemaName: "enterprise", search: "default" },
      503,
    );
    await runtime.restart();
    await login();
    const restored = await request(conversation + "/history");
    assert.ok(JSON.stringify(restored).includes(discovered.turn.turnCode));
    assert.ok(JSON.stringify(restored).includes("Selected collections:"));
    assert.equal(
      (await request(conversation + "/turns", discoveryCommand)).turn.turnCode,
      discovered.turn.turnCode,
    );
    for (const inspection of inspections) {
      assert.ok(JSON.stringify(restored).includes(inspection.code));
      assert.equal(
        (await request(conversation + "/turns", inspection.command)).turn
          .turnCode,
        inspection.code,
      );
    }
    const restarted = await request(route + "/query", {
      schemaName: "enterprise",
      search: "default",
    });
    assert.deepEqual(restarted.records, result.records);
    t.diagnostic("REAL_DATABASE_SOURCE_OWNER_AUTHORITY_RESTART_PASS");
    t.diagnostic("REAL_COLLECTION_DISCOVERY_CONVERSATION_REPLAY_RESTART_PASS");
    t.diagnostic(
      "REAL_SCHEMA_CAPABILITIES_IMPACT_CONVERSATION_REPLAY_RESTART_PASS",
    );
  },
);
