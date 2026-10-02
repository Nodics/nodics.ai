/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nConfig/test/loggerRedactionContract
 * @description Verifies that central logger serialization redacts sensitive
 * tokens, credentials, and secret-bearing fields before logs reach transports.
 * @layer test
 * @owner nConfig
 * @override Project modules may add stricter redaction keys through layered
 * `log.redaction` configuration while preserving the platform no-secret-log
 * contract.
 */
const assert = require("assert");

const loggerService = require("../src/service/DefaultLoggerService");

global.CONFIG = {
  get: function (key) {
    if (key === "log") {
      return {
        redaction: {
          enabled: true,
          mask: "[MASKED]",
          sensitiveKeys: [
            "authorization",
            "token",
            "password",
            "apiKey",
            "secret",
          ],
        },
      };
    }
    return undefined;
  },
};

let circular = {
  user: "apiAdmin",
  password: "plain-password",
  profile: {
    accessToken: "access-token-value",
    apiKey: "client-generated-key-value",
  },
  headers: {
    Authorization: "Bearer real.jwt.token",
    normal: "visible",
  },
  uri: "mongodb://admin:secret@localhost:27017/nodics",
};
circular.self = circular;

let formatted = loggerService.formatObject(circular);

assert(
  !formatted.includes("plain-password"),
  "password value must not be logged",
);
assert(
  !formatted.includes("access-token-value"),
  "token value must not be logged",
);
assert(
  !formatted.includes("client-generated-key-value"),
  "API key value must not be logged",
);
assert(
  !formatted.includes("real.jwt.token"),
  "bearer token must not be logged",
);
assert(
  !formatted.includes("admin:secret@"),
  "connection URI credentials must not be logged",
);
assert(
  formatted.includes("[MASKED]"),
  "configured redaction mask should be used",
);
assert(
  formatted.includes("[Circular]"),
  "circular structures should remain serializable",
);
assert(
  formatted.includes("visible"),
  "non-sensitive values should remain visible",
);

let message = loggerService.formatObject(
  "Authorization: Bearer raw-token password=secret-value apiKey=api-key-value",
);

assert(
  !message.includes("raw-token"),
  "authorization token in string message must be redacted",
);
assert(
  !message.includes("secret-value"),
  "password in string message must be redacted",
);
assert(
  !message.includes("api-key-value"),
  "API key in string message must be redacted",
);
assert(
  message.includes("[MASKED]"),
  "string redaction should use configured mask",
);

let elasticLog = loggerService.createElasticLogTransformer()({
  level: "info",
  message: "Authorization: Bearer elastic-token",
  meta: {
    request: {
      password: "elastic-password",
      apiKey: "elastic-api-key",
    },
  },
});

assert(
  !JSON.stringify(elasticLog).includes("elastic-token"),
  "Elasticsearch message must be redacted",
);
assert(
  !JSON.stringify(elasticLog).includes("elastic-password"),
  "Elasticsearch metadata password must be redacted",
);
assert(
  !JSON.stringify(elasticLog).includes("elastic-api-key"),
  "Elasticsearch metadata API key must be redacted",
);

// Deferred serialized-log regression fixtures. Do not treat them as provider/APM qualification.
const serialized = JSON.stringify({
  canonicalPassword: "canonical-private",
  historicalPassword: "historical-private",
  nested: [{ password: "nested private with spaces", safe: "visible" }],
  encoded: JSON.stringify({
    historicalPassword: "encoded-private",
    keep: "retained",
  }),
  twiceEncoded: JSON.stringify(JSON.stringify({ password: "twice-private" })),
  escapedKey: JSON.parse('{"pass\\u0077ord":"escaped-key-private"}'),
});
const serializedResult = loggerService.redactLogString(
  serialized,
  loggerService.getRedactionConfig(),
);
for (const secret of [
  "canonical-private",
  "historical-private",
  "nested private with spaces",
  "encoded-private",
  "twice-private",
  "escaped-key-private",
]) {
  assert(
    !serializedResult.includes(secret),
    "serialized nested secrets must be removed",
  );
}
const parsedResult = JSON.parse(serializedResult);
assert.strictEqual(parsedResult.canonicalPassword, "[MASKED]");
assert.strictEqual(parsedResult.nested[0].safe, "visible");
assert.strictEqual(JSON.parse(parsedResult.encoded).keep, "retained");
assert.strictEqual(
  JSON.parse(JSON.parse(parsedResult.twiceEncoded)).password,
  "[MASKED]",
);
assert(
  !loggerService
    .formatObject('{"pass\\u0077ord":"raw-escaped-private"}')
    .includes("raw-escaped-private"),
);

const embedded = loggerService.formatObject(
  'assessment={"canonicalPassword":"snippet-private","code":"record-safe"} next=[{"historicalPassword":"second-private"}]',
);
assert(
  !embedded.includes("snippet-private") && !embedded.includes("second-private"),
);
assert(embedded.includes("record-safe") && embedded.includes("assessment="));
const firstSnippet = embedded.slice(
  embedded.indexOf("{"),
  embedded.indexOf("}") + 1,
);
assert.strictEqual(
  JSON.parse(firstSnippet).canonicalPassword,
  "[MASKED]",
  "parsed embedded JSON remains valid JSON after redaction",
);

const quotedSnippet =
  "payload=" +
  JSON.stringify(
    JSON.stringify({
      historicalPassword: "quoted-snippet-private",
      code: "quoted-safe",
    }),
  );
const quotedOutput = loggerService.formatObject(quotedSnippet);
assert(!quotedOutput.includes("quoted-snippet-private"));
assert(quotedOutput.includes("quoted-safe"));
const unterminated =
  'details={"password":"' + '\\"'.repeat(512) + "unterminated-private";
assert(
  !loggerService.formatObject(unterminated).includes("unterminated-private"),
);

for (const malformed of [
  '{"password":"truncated-private',
  'details={"canonicalPassword":"malformed-private",}',
  '{"password" "missing-colon-private"}',
  'details=[{"historicalPassword":"mismatched-private"}] trailing={"password":"tail-private',
  "canonicalPassword='single private with spaces' safe=visible",
  'historicalPassword="escaped \\" private with spaces" safe=visible',
]) {
  const output = loggerService.formatObject(malformed);
  for (const secret of [
    "truncated-private",
    "malformed-private",
    "missing-colon-private",
    "mismatched-private",
    "tail-private",
    "single private with spaces",
    "private with spaces",
  ]) {
    assert(
      !output.includes(secret),
      "malformed or quoted assignment must not leak its secret",
    );
  }
  assert(output.includes("[MASKED]"));
}

for (const key of ["canonicalPassword", '"historicalPassword"']) {
  const assigned =
    key +
    "=" +
    JSON.stringify({ safe: "whole-assigned-private" }) +
    " suffix=visible";
  const output = loggerService.formatObject(assigned);
  assert(
    !output.includes("whole-assigned-private"),
    "sensitive assignment must mask the entire embedded object",
  );
  assert(
    output.includes("suffix=visible"),
    "ordinary following fields remain visible",
  );
}
const plainQuoted =
  "historicalPassword=" +
  JSON.stringify('escaped " private with spaces') +
  " safe=visible";
assert.strictEqual(
  loggerService.formatObject(plainQuoted),
  "historicalPassword=[MASKED] safe=visible",
);
const nestedAssigned =
  "canonicalPassword=" +
  JSON.stringify(
    JSON.stringify({
      password: "nested-assigned-private",
      safe: "whole-assigned-private",
    }),
  );
assert(
  !loggerService
    .formatObject(nestedAssigned)
    .includes("whole-assigned-private"),
);
const escapeEnded =
  'historicalPassword="escaped ' +
  "\\".repeat(2) +
  '" private with spaces" safe=visible';
assert(
  !loggerService.formatObject(escapeEnded).includes("private with spaces"),
);

const privateError = new Error(
  'lookup failed {"canonicalPassword":"error-private","code":"safe-code"}',
);
privateError.name = "Failure password=name-private";
privateError.stack =
  'Failure: {"historicalPassword":"stack-private"}\n    at assess (/tmp/safe[12abc].js:7:2)\n    at worker (C:\\work\\safe.js:9:1)';
const errorOutput = loggerService.redactLogValue(privateError);
assert(!JSON.stringify(errorOutput).includes("error-private"));
assert(!JSON.stringify(errorOutput).includes("name-private"));
assert(!JSON.stringify(errorOutput).includes("stack-private"));
assert(errorOutput.message.includes("safe-code"));
assert(errorOutput.stack.includes("/tmp/safe[12abc].js:7:2"));
assert(errorOutput.stack.includes("C:\\work\\safe.js:9:1"));

const hardened = loggerService.resolveRedactionConfig({
  enabled: false,
  sensitiveKeys: [],
  maximumStringLength: Number.MAX_SAFE_INTEGER,
});
assert.strictEqual(
  hardened.enabled,
  true,
  "configuration cannot disable mandatory redaction",
);
assert.strictEqual(
  hardened.maximumStringLength,
  32768,
  "configuration cannot raise the bounded ceiling",
);
assert(
  !loggerService
    .redactLogString('{"password":"override-private"}', hardened)
    .includes("override-private"),
);
assert(
  !loggerService
    .redactLogString("Bearer legacy-private", hardened)
    .includes("legacy-private"),
);
assert(
  !loggerService
    .redactLogString("mongodb://user:uri-private@localhost/db", hardened)
    .includes("uri-private"),
);
assert.strictEqual(
  loggerService.redactLogString("x".repeat(32769), hardened),
  "[REDACTED]",
);
assert.strictEqual(
  loggerService.redactLogValue(
    { safe: { password: "depth-private" } },
    { maximumDepth: 1 },
  ).safe.password,
  "[REDACTED]",
);
assert.strictEqual(
  loggerService.redactLogValue(["entry-private", "entry-private"], {
    maximumEntries: 1,
  }),
  "[REDACTED]",
);
assert.strictEqual(
  loggerService.redactLogString("one={} two={}", { maximumJsonSnippets: 1 }),
  "[REDACTED]",
);

const extraKeys = Array.from(
  { length: 64 },
  (_, index) => "confidentialField" + index,
);
const allKeys = loggerService.resolveRedactionConfig({
  sensitiveKeys: extraKeys,
});
assert.deepStrictEqual(
  loggerService.resolveRedactionConfig(allKeys),
  allKeys,
  "normalization preserves all admitted custom keys on recursive calls",
);
assert(
  !loggerService
    .redactLogString('{"confidentialField63":"last-private"}', allKeys)
    .includes("last-private"),
);

const customized = {
  ...loggerService,
  getRedactionConfig: function () {
    return this.resolveRedactionConfig({
      mask: "[CUSTOM]",
      sensitiveKeys: ["accountPin"],
      maximumStringLength: 2048,
    });
  },
};
const customResult = JSON.parse(
  customized.formatObject(
    '{"accountPin":"pin-private","password":"baseline-private","safe":"visible"}',
  ),
);
assert.deepStrictEqual(customResult, {
  accountPin: "[CUSTOM]",
  password: "[CUSTOM]",
  safe: "visible",
});
assert.strictEqual(customized.getRedactionConfig().maximumStringLength, 2048);

const invalidPolicyOverride = {
  ...loggerService,
  getRedactionConfig: function () {
    return { enabled: false, sensitiveKeys: [] };
  },
};
assert(
  !invalidPolicyOverride
    .formatObject({ password: "policy-override-private" })
    .includes("policy-override-private"),
);
assert(
  !invalidPolicyOverride
    .formatObject('{"historicalPassword":"policy-json-private"}')
    .includes("policy-json-private"),
);

delete global.CONFIG;
