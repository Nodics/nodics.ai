/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationTargetDiagnostic
 * @description Preserves credential-free target invocation evidence despite private error-envelope masking.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");
const resolver = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService");
const previousClasses = global.CLASSES;
global.CLASSES = {
  NodicsError: class extends Error {
    constructor(input) {
      super(input.message);
      Object.assign(this, input);
    }
    static cleanContext(context) {
      return context;
    }
  },
};
after(() => {
  if (previousClasses === undefined) delete global.CLASSES;
  else global.CLASSES = previousClasses;
});
const profile = {
  code: "documentation",
  baselineCode: "documentation",
  target: {
    moduleName: "cms",
    connectionName: "contentStaged",
    runtimeRole: "WCMS_STAGED",
  },
};

test("target diagnostics preserve HTTP status and invocation phase without logging credentials", () => {
  const logs = [];
  const owner = Object.assign(Object.create(service), {
    LOG: { warn: (...args) => logs.push(args) },
  });
  const cause = Object.assign(new Error("denied Bearer private-token"), {
    code: "ERR_AUTH_00001",
    status: 403,
    metadata: {
      runtimeInvocationDiagnostic: {
        phase: "transport",
        failureCode: "ERR_AUTH_00001",
      },
    },
    header: { Authorization: "Bearer private-token" },
  });
  const error = owner.targetDiagnostic(cause, profile, {
    requestId: "request-1",
  });
  assert.equal(error.metadata.targetResponseCode, "403");
  assert.equal(error.metadata.runtimeInvocationDiagnostic.phase, "transport");
  assert.equal(
    error.metadata.runtimeInvocationDiagnostic.targetConnection,
    "contentStaged",
  );
  assert.deepEqual(logs[0][1], {
    code: "ERR_BOF_00085",
    targetCode: "ERR_AUTH_00001",
    targetResponseCode: "403",
    profileCode: "documentation",
    baselineCode: "documentation",
    targetModule: "cms",
    targetConnection: "contentStaged",
    targetRuntimeRole: "WCMS_STAGED",
    phase: "transport",
    failureCode: "ERR_AUTH_00001",
    correlationId: "request-1",
  });
  assert(!JSON.stringify(logs).includes("private-token"));
});

test("context-based resolution failures retain the canonical failure reason", () => {
  const cause = Object.assign(new Error("endpoint unavailable"), {
    code: "ERR_TNT_00002",
    contexts: [
      {
        runtimeInvocationDiagnostic: {
          phase: "runtimeResolution",
          failureCode: "REMOTE_ENDPOINT_UNAVAILABLE",
        },
      },
    ],
  });
  const error = service.targetDiagnostic(cause, profile);
  assert.equal(
    error.metadata.runtimeInvocationDiagnostic.failureCode,
    "REMOTE_ENDPOINT_UNAVAILABLE",
  );
});

test("unsafe correlation and provider exception text never enter the separate routing log", () => {
  const logs = [];
  const owner = Object.assign(Object.create(service), {
    LOG: { warn: (...args) => logs.push(args) },
  });
  owner.targetDiagnostic(
    Object.assign(new Error("secret"), { code: "Bearer secret" }),
    profile,
    {
      correlationId: "Bearer secret\nprivate",
    },
  );
  assert(!JSON.stringify(logs).includes("secret"));
});

test("canonical registry role selection accepts string Staged role and excludes Online", () => {
  const options = {
    moduleName: "cms",
    connectionName: "contentStaged",
    targetAuthority: { runtimeRole: "WCMS_STAGED" },
  };
  const owners = [
    {
      moduleName: "cms",
      server: "contentOnlineServer",
      runtimeRole: { code: "WCMS_ONLINE", publication: "ONLINE" },
      endpoint: "https://online.example.test/nodics/cms",
    },
    {
      moduleName: "cms",
      server: "contentStagedServer",
      runtimeRole: { code: "WCMS_STAGED", publication: "STAGED" },
      endpoint: "https://staged.example.test/nodics/cms",
    },
  ];
  assert.equal(
    resolver.resolveFromOwners(options, owners).server,
    "contentStagedServer",
  );
  assert.equal(resolver.resolveFromOwners(options, [owners[0]]), undefined);
});
