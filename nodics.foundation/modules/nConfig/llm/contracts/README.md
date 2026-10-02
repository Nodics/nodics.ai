# nConfig AI Contracts

## Private Request Entry And Capture

The [sensitive request capture contract](../../../nRouter/llm/contracts/request-capture-privacy-contract.md)
extends source protection beyond the serialized logger correction below.
DefaultLoggerService owns private AsyncLocalStorage/WeakMap/WeakSet state, exact
entry assertions, trusted detached invocation and synchronous Winston ingress.
Protected routing is refused until upstream capture is disabled and independently
qualified. Request fields never supply proof; send filters never qualify capture.
Isolated fixtures in `../../test/requestCapturePrivacyContract.test.js` have
passed without listeners, providers or live APM. The serialized-redaction evidence
boundary below describes logger correction only; neither set qualifies installed
custom/external sinks.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nConfig`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

The existing infrastructure owner serializes selected-server output writers with an atomic filesystem directory lock adjacent to the build manifest. Hold it throughout cleanup, generation, module hooks and manifest publication. Competing build/clean operations and startup reject while it exists. A normal failure preserves its original error and releases its owned lock; an interrupted process leaves recovery evidence. Operators must verify no writer remains before removing that exact lock and rebuilding. This does not coordinate independent callers sharing JavaScript global runtime state; each CLI target runs in its own process.

Common-template generation serializes function source and data as JavaScript
expressions. It preserves quotes, escaped newlines, regular expressions, dates
and nested values; never serialize functions into JSON and then strip quotes.
Source-package dependency bindings and later authored method precedence remain
unchanged. Rebuild selected server output after adopting serializer changes.

## Serialized logger redaction

The existing DefaultLoggerService owns this correction, before its supported
console/file/Elasticsearch formatting paths. It introduces no identity policy,
public route, transport, data store or observability authority. Existing object
keys, circular references, Bearer/Basic credentials, assignments and credential
URIs remain protected. Quoted JSON keys such as canonicalPassword and
historicalPassword match the baseline password rule, including nested objects,
arrays and JSON serialized inside another string field.

Valid whole JSON strings are parsed with JSON.parse, recursively sanitized
through the existing exported redaction members, and serialized with
JSON.stringify. Escaped keys and values are therefore interpreted structurally,
not with a regex JSON parser. Embedded JSON-shaped containers use a bounded
quote/escape/bracket scanner before parsing. Malformed JSON-shaped snippets are
masked rather than passed through; an unterminated/depth-limited snippet masks
the remaining tail because its safe end cannot be established. Surrounding safe
diagnostic context remains when a complete container boundary is known.
Ordinary path bracket labels are not JSON candidates. Non-JSON text uses bounded
literal key/value scanning for quoted/unquoted sensitive assignments; quoted
values may contain spaces or escaped quotes. Fixed Bearer/Basic and credential
URI patterns remain, without configurable regex alternations or filesystem
path normalization. Error name, message and stack pass through the same owner.
Unchanged quoted values stay attached to their assignment key so escaped quote
content cannot bypass sensitive-field masking. A sensitive key before an embedded
JSON container masks the whole assigned value, not just known keys inside it.
An ambiguous escape-ended quoted assignment fails closed unless an unambiguous
following field or delimiter is present. These scans are bounded literal parsing,
not configurable regex or filesystem rewriting.

Framework log.redaction defaults are maximumStringLength 32768 characters,
maximumDepth 16, maximumEntries 1024 and maximumJsonSnippets 16. Limits count
combined nested object and serialized-string work; an exhausted budget masks
the affected value, and oversized input/output strings are masked, not partially
truncated with possible secret residue. Circular objects retain [Circular].
This is bounded diagnostic redaction, not a lossless diagnostic serializer.

Later-loaded log.redaction configuration may add up to 64 bounded sensitive key
names, choose a nonempty mask up to 128 characters or lower the positive limits.
Baseline keys are unioned, never positionally replaced. enabled:false, empty key
lists and raised/invalid limits cannot disable the existing protection. Bootstrap
and direct helper calls normalize through the same exported resolveRedactionConfig.
Service overrides remain trusted customization: they must preserve parser-based
redaction, mandatory baseline keys, ceilings, failure masking and every original
credential protection. Do not copy the logger or remove sanitization at a sink.

The existing loggerRedactionContract.test.js contains isolated fixtures for valid
and malformed JSON, nested serialized secrets, embedded snippets, Error paths,
escaped quotes, bounded work and effective later-layer customization. These
fixtures have passed in source-only execution, including assignment/container
boundaries and malformed escape-ended values. These fixture results and static
checks are not deployment/provider qualification.

Privacy evidence remains limited to this serialized logger gap. APM agents,
request/raw-body capture, driver/provider logging, exception reporters, custom
transports or code that bypasses DefaultLoggerService are not covered. This
change neither approves logging credentials nor qualifies identity migration,
installed log sinks, provider durability or external observability redaction.

## Runtime Encryption Input Privacy

The mandatory DefaultLoggerService baseline and authored `log.redaction` defaults
include `encryptionKey` and `NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY`.
Case-insensitive key/assignment matching covers nested configuration and environment
objects, JSON strings, embedded/quoted JSON, Error messages/stacks, synchronous
logger ingress and the existing Elasticsearch transformer. Empty custom lists or
`enabled:false` cannot remove protection. No second sanitizer or customer copy is
introduced. Bare unlabeled secret text cannot be identified by key matching;
never log a key as an arbitrary message or pass it to an unrelated reporter.

The CONFIG registry's `getPublicProperties(tenant)` delegates to the loaded
DefaultLoggerService, with the same bootstrap owner as fallback, and returns an
independent bounded masked diagnostic projection. It does not add a route or
authorize configuration disclosure. Internal `get`/`getProperties` retain actual
values so encryption, loading and tenant layering continue to work. An outward
configuration consumer must use the safe projection, not expose those internal
accessors. There is no automatic protection for arbitrary domain success DTOs.
nCommon's `NodicsError.toJson` and `toSafeJson` reuse the same owner for outward
messages, stacks, metadata, contexts and nested causes, including fallback paths;
raw in-memory Error instances remain private internal values.

nConfig's property loader logs source paths, not resolved environment values.
The env descriptor does not accept `secret:true` and does not imply APM privacy.
Existing APM startup options remain inactive with body/header capture disabled;
the optional registered send filter drops whole events rather than maintaining
another key policy. Defaults do not start an agent. An upstream/preloaded agent,
central override, raw-body recorder or third-party exception reporter still
requires the existing deployment qualification before capture admission. A send
filter cannot erase already captured agent memory or sanitize agent metadata.
Keep `log.requestPrivacy.qualified` false until that independent gate is met.

`runtimeEncryptionPrivacyContract.test.js` exercises absent/hostile configuration,
case variants, original-owner preservation, bootstrap projection/error fallback,
ordinary diagnostic retention and APM drop/no-capture contracts with synthetic
inputs only. These checks do not provision a key, start a runtime/agent, mutate a
database or qualify an installed APM deployment. Rebuild/restart affected runtimes
before private key entry; an earlier generated backend does not receive this
mandatory baseline from a page refresh.
