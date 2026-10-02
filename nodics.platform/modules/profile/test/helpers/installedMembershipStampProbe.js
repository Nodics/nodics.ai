/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/helpers/installedMembershipStampProbe
 * @description Runs fixed cross-process Profile/nAuth stamp probes through the native Redis owner in a disposable namespace.
 * @layer test
 * @owner profile
 * @sideEffects Writes or removes only fixed fixture stamp keys; never issues credentials, edits principals or configures runtime qualification.
 */
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const foundation = "../../../../../nodics.foundation/modules/";
const membershipSource = require("../../src/service/enterprise/defaultEnterpriseMembershipService");
const stampSource = require(
  foundation +
    "nAuth/src/service/identity/defaultPrincipalSecurityStampService",
);
const cacheSource = require(
  foundation + "nCache/redisCache/src/service/cache/defaultRedisCacheService",
);
const engineSource = require(
  foundation +
    "nCache/redisCache/src/service/engine/defaultRedisCacheEngineService",
);
const configurationSource = require(
  foundation +
    "nCache/cache/src/service/config/defaultCacheConfigurationService",
);
const actions = [
  "seed",
  "current",
  "advance",
  "isolated",
  "regression",
  "missing",
  "cleanup",
];
const logger = { debug() {}, info() {}, error() {} };

/** Rejects nonlocal providers, arbitrary commands and installed auth namespaces before opening a connection. */
function admit(input) {
  assert.deepEqual(Object.keys(input).sort(), [
    "action",
    "endpoint",
    "namespace",
  ]);
  assert(actions.includes(input.action));
  assert.match(input.namespace, /^nodics_profile_qualification_[a-f0-9]{32}$/);
  const url = new URL(input.endpoint);
  assert.equal(url.protocol, "redis:");
  assert(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  assert(!url.username && !url.password && !url.search && !url.hash);
  assert(["", "/"].includes(url.pathname));
}

/** Executes a bounded fixture action in this worker's independent owner/cache process. */
async function run(input) {
  admit(input);
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
    CacheError: class extends Error {},
  };
  global.CONFIG = {
    get: (key) => (key === "profileModuleName" ? "profile" : undefined),
  };
  const cache = { ...cacheSource, LOG: logger };
  const stamps = { ...stampSource };
  const membership = {
    ...membershipSource,
    authority: () => "fixture",
    digest: (value) =>
      createHash("sha256").update(JSON.stringify(value)).digest("hex"),
  };
  const response = await { ...engineSource, LOG: logger }.initCache(
    {
      options: {
        url: input.endpoint,
        prefix: input.namespace,
        socket: { reconnectStrategy: false, connectTimeout: 2000 },
      },
    },
    "profile",
  );
  const channel = {
    client: response.result,
    channelName: "auth",
    engineOptions: { options: { prefix: input.namespace } },
    channelOptions: { ttl: 120 },
  };
  const base = { moduleName: "profile", channel, tenant: "fixture" };
  global.SERVICE = {
    DefaultCacheConfigurationService: configurationSource,
    DefaultPrincipalSecurityStampService: stamps,
    DefaultCacheService: {
      putVersioned: (options) =>
        cache.putVersioned({ ...base, ...options, ttl: 120 }),
    },
    DefaultAuthenticationProviderService: {
      findToken: (moduleName, key) => {
        assert.equal(moduleName, "profile");
        return cache.get({ ...base, key });
      },
    },
  };
  const binding = (code, version) => ({
    tenant: "fixture",
    principalId: membership.membershipKey(code),
    authVersion: version,
  });
  const keys = ["one", "two", "absent"].map((code) =>
    stamps.getKey("fixture", membership.membershipKey(code)),
  );
  try {
    switch (input.action) {
      case "seed":
        await membership.registerMembership({ code: "one", revision: 4 });
        await membership.registerMembership({ code: "two", revision: 7 });
        break;
      case "current":
        assert.equal(
          await stamps.validateBindings([binding("one", 4), binding("two", 7)]),
          true,
        );
        break;
      case "advance":
        await membership.registerMembership({ code: "one", revision: 5 });
        break;
      case "isolated":
        await assert.rejects(stamps.validateBindings([binding("one", 4)]), {
          code: "ERR_AUTH_00001",
        });
        assert.equal(await stamps.validateBindings([binding("one", 5)]), true);
        assert.equal(await stamps.validateBindings([binding("two", 7)]), true);
        break;
      case "regression":
        await assert.rejects(
          membership.registerMembership({ code: "one", revision: 4 }),
        );
        assert.equal(await stamps.validateBindings([binding("one", 5)]), true);
        break;
      case "missing":
        await assert.rejects(stamps.validateBindings([binding("absent", 1)]));
        break;
      case "cleanup":
        await cache.flushByKeys({ ...base, keys });
        for (const key of keys)
          await assert.rejects(cache.get({ ...base, key }));
        break;
    }
    return { action: input.action, passed: true, pid: process.pid };
  } finally {
    await response.result.quit();
  }
}

module.exports = { admit, run };
if (require.main === module) {
  run(JSON.parse(readFileSync(0, "utf8"))).then(
    (result) => process.stdout.write(JSON.stringify(result)),
    () => {
      process.stderr.write("PROFILE_STAMP_PROBE_FAILED\n");
      process.exitCode = 1;
    },
  );
}
