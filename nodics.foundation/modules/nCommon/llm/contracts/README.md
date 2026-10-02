# nCommon AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nCommon`.

## Interceptor Index Order

The existing interceptor configuration owner orders signed numeric indexes
explicitly before flattening groups. Negative integrity guards execute before
index zero and positive hooks; equal indexes preserve contribution order. Do not
rely on object-key enumeration: JavaScript enumerates unsigned integer keys
before negative keys regardless of insertion order. Later-layer contributions
and overrides must preserve this order across each independent trigger. The
Profile fresh-Init fixture uses this actual sorter and dispatcher with generated
nested saves, schema defaults and the Mongo write wrapper against isolated
memory; it is not a claim of live startup or installed provider qualification.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Outward Error Privacy

`NodicsError.toJson` and `toSafeJson` delegate outward diagnostic redaction to
nConfig's canonical DefaultLoggerService, including circular and serialization
fallback paths. Preserve codes, traceability and ordinary contexts while masking
mandatory credential/encryption input keys, messages and stacks. Before the loaded
logger is available, reuse its bundled bootstrap implementation; do not create a
separate nCommon sanitizer or key list. Raw in-memory errors are not public DTOs.
Later class/logger customizations must preserve this boundary and its bounded
failure behavior. Error serialization does not qualify external APM capture or
authorize disclosure of arbitrary runtime configuration.
