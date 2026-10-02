# Sensitive Request Capture Boundary

## Ownership And Declaration

nRouter owns trusted route binding, parser placement, HTTP diagnostics and API
cache exclusion. nConfig owns private async context, exact-object entry proof
and logger ingress. nPipeline preserves the envelope and suppresses raw execution
exception logging. These mechanisms do not authenticate a subject, authorize a
domain operation, validate JWT claims or introduce a telemetry registry.

Declare exactly this metadata in the existing server-owned route definition:

```js
requestPrivacy: { sensitive: true },
cache: { enabled: false }
```

Absence means ordinary routing. False, null, non-object and extra metadata keys
are rejected. Runtime-bound sensitivity is pinned before parsing and cannot be
downgraded by refreshing the route. An ordinary route that becomes sensitive
after parsing is refused without private admission. OpenAPI preserves the
declaration in `x-nodics.requestPrivacy`; mismatched duplicate declarations reject.
The metadata is not an authorization or browser-controlled opt-out mechanism.

Apply this contract to password-backed linking and service-authenticated session
validation alike. A session-validation body containing `authToken` carries the
original signed access JWT; the Authorization header carries the independent
runtime service credential. Privacy does not permit unsigned subject claims or
replace token-type, permission, tenant or stored-subject checks.

## Exact Request APIs

Use the existing `SERVICE.DefaultLoggerService` exports:

- `hasPrivateCaptureProtection(request)` returns a boolean for that exact admitted
  object and current deployment qualification, not a serialized flag.
- `assertSensitiveRequest(request)` returns void or throws a fixed TypeError.
  Call it before reading sensitive body fields. No submitted token or proof is
  read to construct its failure diagnostic.
- `runSensitiveOperation(envelope, callback)` explicitly admits a new detached,
  trusted non-HTTP invocation envelope and executes the callback in private async
  context. It returns the callback value/promise. The callback receives no extra
  arguments. Reusing an already tagged envelope is refused. This is an owner
  source entrypoint, not a browser/API endpoint or new principal authority.
- `inheritRequestPrivacy(target, source)` carries exact admission only from an
  admitted source. An ambient async context alone suppresses logging but does
  not grant service entry. Invoke only at trusted mapping boundaries.

nRouter's earliest configuration middleware calls `runRequestPrivacy(req, next)`
before app hooks, hardening and parsing. Requests are initially unresolved and
their diagnostics suppressed. The pre-parser route middleware validates metadata,
calls `resolveRequestPrivacy`, then `admitPrivateRoute` for the exact HTTP object.
Missing early context or deployment qualification refuses the route with 503
`ERR_RTR_00005`. These binding APIs are trusted owner operations, never derived
from a body, query, header, forwarded field or detached claims object.

`DefaultRequestHandlerService` explicitly inherits admission from the HTTP object
to its new Nodics pipeline input before pipeline dispatch. Pipeline entry preserves
that exact envelope; nested handlers must explicitly inherit from an admitted
source if constructing another envelope. Cloning a request, setting
`captureProtectionQualified` or changing body/router fields cannot produce proof.
Body/header/raw-data objects are privately tagged for suppression only; they do
not gain entry authority. Private WeakMaps/WeakSets expire with object lifetime.

## Capture And Logging

The logger wraps synchronous Winston `write` before buffering, including child
loggers forwarding to the parent. Sensitive entries become only a fixed
`[SENSITIVE_REQUEST]` message and validated severity. Raw message, Error stack,
metadata, interpolation arguments and preformatted message symbols are removed.
Ordinary records retain bounded credential redaction at this ingress as well as
the supported transport paths. Retained private object references remain masked
outside the async context. An Error rejected by private internal entry is tagged
without changing its business error identity. Copying its message to an unrelated
string or bypassing the owner logger is not covered.

Raw body and headers are not deleted from business requests. JSON/URL-encoded
parsing still works with the existing configured bounds. Private parser errors
return fixed 400 `ERR_RTR_00006`, never the parser Error or its body. The early
global URL-encoded parser also has this error boundary; before route resolution,
its errors are conservatively suppressed. Standard JSON/text/download error
handlers return only registered owner status code/message, no submitted messages,
stacks, validation items, metadata or localization parameters. Domain success
payloads remain the domain owner's responsibility.

Sensitive requests skip cache-key creation, cache reads and result writes even
if a later route/cache override enables caching. This applies only to the owned
API-cache pipeline, not arbitrary domain persistence or custom caches.

## Deployment Gate And APM

Framework defaults remain closed:

```js
log: { requestPrivacy: { qualified: false, captureMode: "disabled" } }
```

Only an operator-qualified deployment with `qualified === true` and
`captureMode === 'disabled'` permits admission. This is an attestation about the
installed deployment, not a flag proving external sinks are safe. Browser fields
cannot open it. Do not enable it until upstream/preloaded agents, proxy capture,
custom middleware, exception reporters and direct sinks have been inventoried and
request/response/raw-body/header capture disabled before intake. Selected runtime
layering owns differences; no project-specific defaults belong in these modules.

`getPrivateApmOptions()` supplies `{active:false, captureBody:'off',
captureHeaders:false}` for deployment-owned startup. It does not start an agent,
rewrite environment settings or override central configuration. This framework
source does not start an APM agent. That fact alone does not qualify a deployment.

`installApmPrivacyFilter(agent)` optionally installs an Elastic-compatible
process-wide event-drop filter (`addFilter(() => null)`) before sending. It never
grants admission. Elastic filters run after in-process capture and exclude agent
metadata; `filtered` mode therefore remains unqualified. See the primary
[agent API](https://www.elastic.co/docs/reference/apm/agents/nodejs/agent-api) and
[startup configuration](https://www.elastic.co/docs/reference/apm/agents/nodejs/configuration).

## Customization And Evidence Limits

Later layers may add trusted sensitive declarations, lower parser/redaction
bounds, or supply compatible logging/middleware adapters. They must preserve early
binding, pinned sensitivity, exact admission, cache exclusion and generic errors.
Replacing these owner exports or inserting earlier middleware requires independent
qualification; a source override can bypass source guarantees and is not controlled
by a private WeakSet. Do not copy this machinery into Profile, a project, or a new
telemetry service.

Readiness evidence: root-to-leaf AGENTS/README and relevant owner contracts were
studied; app hook order, parsers, raw pipeline exceptions, URL diagnostics,
Winston ingress and API-cache key/write paths were traced. No route-definition
schema named `routeDefinition` was found in this checkout: runtime/OpenAPI
preservation is implemented, but any additional generated schema owner must
independently preserve metadata before integration is declared complete.

Deferred fixtures live in nConfig and nRouter
`test/requestCapturePrivacyContract.test.js` and nPipeline
`test/privateRequestEntryContract.test.js`. They cover rejection, isolation,
custom configuration, exact derivation, refresh, fixed errors and cache exclusion.
All behavioral/visual acceptance is NOT RUN in this source-only batch. Static
syntax/format/documentation checks do not prove installed middleware ordering,
APM/preload policy, external persistence, proxy/provider/driver/custom sinks,
remote transport behavior or production privacy. Those remain explicit gates.
