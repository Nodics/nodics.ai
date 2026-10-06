/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module copilotWorkbench/test/copilotCollectionRuntime
 * @description Qualifies governed collection-centre creation against separate native Waste and Location owners.
 * @layer test
 * @owner copilotWorkbench
 * @sideEffects Creates only synthetic addresses, places and collection centres in private disposable databases.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["normal", "response-loss", "natural-language"]) {
  test(
    "real employee collection-centre creation preserves native references and original receipts: " +
      scenario,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withRegistration: true,
        withCollectionActions: true,
        withOllama: scenario === "natural-language",
        collectionResponseLossCode:
          scenario === "response-loss" ? "acceptance_centre" : null,
      });
      t.after(() => runtime.close());
      const waste = runtime.axisRuntimes.find(
        (item) => item.role === "WASTE",
      ).origin;
      const location = runtime.axisRuntimes.find(
        (item) => item.role === "LOCATION",
      ).origin;
      let token;
      /** Calls fixed native acceptance endpoints once, always with the employee bearer. */
      async function request(
        path,
        body,
        expected = 200,
        origin = runtime.baseUrl,
        method = body === undefined ? "GET" : "POST",
      ) {
        const response = await fetch(origin + "/nodics/" + path, {
          method,
          redirect: "error",
          signal: AbortSignal.timeout(120000),
          headers: {
            "Content-Type": "application/json",
            "x-enterprise-code": "default",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json();
        if (response.status !== expected)
          t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
        assert.equal(response.status, expected, JSON.stringify(value));
        return value.data || value.result || value;
      }
      /** Signs in through actual Profile authentication. */
      async function login(role = "operator") {
        token = undefined;
        token = (
          await request("profile/v0/employee/authenticate", {
            loginId: "copilot_acceptance_" + role,
            password: runtime.password,
          })
        ).authToken;
        assert.ok(token);
      }
      const centre = {
        code: "acceptance_centre",
        name: { en: "Acceptance centre" },
        collectionPointType: "COLLECTION_CENTRE",
        locationRef: {
          module: "locationCore",
          schema: "location",
          code: "acceptance_location",
        },
        operatorEnterpriseRef: {
          module: "profile",
          schema: "enterprise",
          code: "default",
        },
        operatingStatus: "ACTIVE",
        publicVisibility: "BACKOFFICE",
        status: "DRAFT",
      };
      const input = {
        operation: "waste.collectionCentre.create",
        centres:
          scenario === "response-loss"
            ? [centre, { ...centre, code: "acceptance_centre_two" }]
            : [centre],
      };
      await login("reader");
      await request("copilotApi/v0/collection-centres/prepare", input, 403);
      await request(
        "wasteCollection/v0/wastecollectionpoint/safe-search",
        {},
        403,
        waste,
      );
      await login();
      await request(
        "profile/v0/address",
        {
          code: "acceptance_address",
          type: "OFFICE",
          city: "Test City",
          state: "Test State",
          postalCode: "00000",
          countryCode: "AE",
        },
        200,
        runtime.baseUrl,
        "PUT",
      );
      await request(
        "locationCore/v0/locations",
        {
          code: "acceptance_location",
          name: { en: "Acceptance place" },
          categoryCode: "WASTE",
          typeCode: "COLLECTION_CENTRE",
          status: "DRAFT",
          latitude: 25,
          longitude: 55,
          addressRef: {
            module: "profile",
            schema: "address",
            code: "acceptance_address",
          },
          visibility: { audiences: ["BACKOFFICE"] },
          sourceRef: {
            module: "profile",
            schema: "enterprise",
            code: "default",
          },
          revision: 0,
        },
        200,
        location,
      );
      const originalLocations = await request(
        "locationCore/v0/location/safe-search",
        {},
        200,
        location,
      );
      assert.equal(originalLocations.totalCount, 1);
      assert.equal(
        (
          await request(
            "wasteCollection/v0/wastecollectionpoint/safe-search",
            {},
            200,
            waste,
          )
        ).totalCount,
        0,
      );
      await request(
        "copilotApi/v0/collection-centres/prepare",
        {
          ...input,
          centres: [
            {
              ...centre,
              operatorEnterpriseRef: {
                ...centre.operatorEnterpriseRef,
                code: "foreign",
              },
            },
          ],
        },
        403,
      );
      await request(
        "copilotApi/v0/collection-centres/prepare",
        { ...input, centres: [{ ...centre, publicVisibility: "INVALID" }] },
        400,
      );
      assert.equal(
        (
          await request("copilotApi/v0/collection-centres/prepare", {
            operation: input.operation,
          })
        ).plan.state,
        "CLARIFICATION_REQUIRED",
      );
      let prepared;
      if (scenario === "natural-language") {
        const created = await request("copilotApi/v0/conversations", {
          title: "Owned collection acceptance",
        });
        const path =
          "copilotApi/v0/conversations/" +
          created.conversation.conversationCode +
          "/turns";
        const turnInput = {
          idempotencyKey: "collection-language-turn",
          message:
            "Create collection centre code acceptance_centre, name en Acceptance centre, collectionPointType COLLECTION_CENTRE, location code acceptance_location, operator enterprise code default, operatingStatus ACTIVE, publicVisibility BACKOFFICE, status DRAFT.",
        };
        const turn = await request(path, turnInput);
        assert.equal(
          turn.confirmation?.operationId,
          input.operation,
          JSON.stringify(turn),
        );
        prepared = {
          actionCode: turn.confirmation.confirmationCode,
          confirmation: turn.confirmation,
        };
        const usage = await request("copilotApi/v0/usage");
        assert.equal(usage.totals.calls, 1);
        assert.ok(usage.totals.consumed > 0);
        await request(path, turnInput);
        assert.deepEqual(
          (await request("copilotApi/v0/usage")).totals,
          usage.totals,
        );
      } else
        prepared = await request(
          "copilotApi/v0/collection-centres/prepare",
          input,
        );
      const endpoint = "copilotApi/v0/confirmations/" + prepared.actionCode;
      const proof = {
        expectedRevision: prepared.confirmation.revision,
        argumentsDigest: prepared.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", proof);
      assert.equal(
        (
          await request(
            "wasteCollection/v0/wastecollectionpoint/safe-search",
            {},
            200,
            waste,
          )
        ).totalCount,
        0,
      );
      await request(endpoint + "/execute", proof, 409);
      let execution = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      if (scenario === "response-loss") {
        assert.equal(
          execution.state,
          "OUTCOME_UNKNOWN",
          JSON.stringify(execution),
        );
        assert.deepEqual(
          execution.rows.map((item) => item.state),
          ["OUTCOME_UNKNOWN", "NOT_STARTED"],
        );
        assert.equal(
          (
            await request(
              "wasteCollection/v0/wastecollectionpoint/safe-search",
              {},
              200,
              waste,
            )
          ).totalCount,
          1,
        );
        await runtime.restart();
        await login();
        assert.equal(
          (await request(endpoint)).confirmation.state,
          "OUTCOME_UNKNOWN",
        );
        const restored = await request(endpoint + "/original-results", {
          ...proof,
          expectedRevision: execution.revision,
        });
        assert.equal(
          restored.confirmation.state,
          "PENDING",
          JSON.stringify(restored),
        );
        assert.deepEqual(
          restored.confirmation.outcomes.map((item) => item.state),
          ["COMPLETED", "NOT_STARTED"],
        );
        assert.equal(
          (
            await request(
              "wasteCollection/v0/wastecollectionpoint/safe-search",
              {},
              200,
              waste,
            )
          ).totalCount,
          1,
        );
        const continuation = {
          argumentsDigest: restored.confirmation.argumentsDigest,
          expectedRevision: restored.confirmation.revision,
        };
        const renewed = await request(endpoint + "/approve", continuation);
        execution = await request(endpoint + "/execute", {
          ...continuation,
          expectedRevision: renewed.confirmation.revision,
        });
      }
      assert.equal(execution.state, "CONSUMED", JSON.stringify(execution));
      const rows = await request(
        "wasteCollection/v0/wastecollectionpoint/safe-search",
        {},
        200,
        waste,
      );
      assert.equal(rows.totalCount, input.centres.length);
      for (const expected of input.centres) {
        const saved = rows.records.find((item) => item.code === expected.code);
        for (const [key, value] of Object.entries(expected))
          assert.deepEqual(saved[key], value);
        assert.equal(saved.operatorEnterpriseRef.code, "default");
      }
      assert.deepEqual(
        await request(
          "locationCore/v0/location/safe-search",
          {},
          200,
          location,
        ),
        originalLocations,
      );
      const diagnostics = runtime.runtimeDiagnostics().diagnostics;
      assert.equal(
        diagnostics.filter(
          (item) => item.code === "COLLECTION_NATIVE_COMPLETED",
        ).length,
        input.centres.length,
      );
      assert.equal(
        diagnostics.filter((item) => item.code === "COLLECTION_RESPONSE_LOST")
          .length,
        scenario === "response-loss" ? 1 : 0,
      );
      const original = await request(endpoint);
      if (scenario === "normal") {
        // A fresh approval/key for an existing code must not turn create into update.
        const duplicate = await request(
          "copilotApi/v0/collection-centres/prepare",
          {
            operation: input.operation,
            centres: [
              { ...centre, name: { en: "Must not replace the original" } },
            ],
          },
        );
        const duplicateEndpoint =
          "copilotApi/v0/confirmations/" + duplicate.actionCode;
        const duplicateProof = {
          expectedRevision: duplicate.confirmation.revision,
          argumentsDigest: duplicate.confirmation.argumentsDigest,
        };
        const approval = await request(
          duplicateEndpoint + "/approve",
          duplicateProof,
        );
        const rejected = await request(duplicateEndpoint + "/execute", {
          ...duplicateProof,
          expectedRevision: approval.confirmation.revision,
        });
        assert.equal(rejected.state, "OUTCOME_UNKNOWN");
        assert.deepEqual(
          await request(
            "wasteCollection/v0/wastecollectionpoint/safe-search",
            {},
            200,
            waste,
          ),
          rows,
        );
        await request(
          duplicateEndpoint + "/execute",
          {
            ...duplicateProof,
            expectedRevision: rejected.revision,
          },
          409,
        );
        const inspected = await request(
          duplicateEndpoint + "/original-results",
          {
            ...duplicateProof,
            expectedRevision: rejected.revision,
          },
        );
        assert.equal(inspected.confirmation.state, "OUTCOME_UNKNOWN");
        assert.deepEqual(
          await request(
            "wasteCollection/v0/wastecollectionpoint/safe-search",
            {},
            200,
            waste,
          ),
          rows,
        );
      }
      await runtime.restart();
      await runtime.restartAxisRuntime("WASTE");
      await runtime.restartAxisRuntime("LOCATION");
      await login();
      assert.deepEqual(await request(endpoint), original);
      assert.deepEqual(
        await request(
          "wasteCollection/v0/wastecollectionpoint/safe-search",
          {},
          200,
          waste,
        ),
        rows,
      );
      assert.deepEqual(
        await request(
          "locationCore/v0/location/safe-search",
          {},
          200,
          location,
        ),
        originalLocations,
      );
      t.diagnostic(
        "REAL_WASTE_LOCATION_PERSISTENCE_AND_RESTART_PASS " + scenario,
      );
    },
  );
}
