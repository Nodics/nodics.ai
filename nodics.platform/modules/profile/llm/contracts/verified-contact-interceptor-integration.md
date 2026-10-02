# Verified Contact Generated Hooks

The sole domain authority remains
[Verified Contact And Notification Consent](verified-contact-consent.md).
`DefaultProfileVerifiedContactInterceptorService` is a fixed Profile adapter,
not a second evidence owner, registry, consent policy or provisioning authority.
No rollout qualification is read to disable these generic protections.

## Exact Appended Wiring

The independently delimited `verified-contact fixed generated hooks` block in
`../../src/interceptors/interceptors.js` installs these **15** active schema hooks:

| Item      | Triggers                              | Handler prefix           | Index |
| --------- | ------------------------------------- | ------------------------ | ----- |
| contact   | preSave, preUpdate, preRemove, preGet | contact                  | -45   |
| employee  | preSave, preUpdate, preRemove, preGet | employee                 | -45   |
| customer  | preSave, preUpdate, preRemove, preGet | customer                 | -45   |
| all three | postGet                               | corresponding fixed item | 46    |

Handler names are `DefaultProfileVerifiedContactInterceptorService.` plus the
fixed item and trigger suffix, e.g. `employeePreUpdate`. Prepared
`request.schemaModel.schemaName` must match the fixed adapter. Browser-supplied
schema/operation fields never select the domain owner.

Save classifies INSERT only for the existing no-query, unmanaged, unversioned
generated `saveItems` insert path. Empty plain generated queries are normalized
to absent selectors, matching the actual ordinary Mongo provider's semantics.
Any selector, upsert-enabled option, managed save-existing path or versioned
provider uses conservative Contact MUTATE or association REPLACE. Contact update
and removal always use MUTATE. Customer/Employee update uses PATCH; removal uses
REMOVE and checks original associations even when no model names contacts.
Plain unrelated legacy patches retain the existing untouched-field skip.

Association adapters additionally guard private query/options/search selectors
and model marker manufacture before PATCH skips. Employee always uses the fixed
Employee owner, never a submitted Customer/Employee selector. Contact's own exact
private CAS/read requests retain their existing authority through its owner
WeakSets. Copies, body flags and system roles confer none.

Current registration and membership writes do not perform a legitimately admitted
protected Contact reassociation. **No blanket provisioning, administrator,
ownsProjectionWrite or systemAuth exception was installed.** Ordinary initial
registration with unmarked Contacts remains governed by INSERT association
validation; activation patches with untouched associations remain PATCH. A future
protected reassociation needs a separately reviewed existing-owner admission and
fresh exact association evidence, not an exception inferred from another owner's
unrelated scope/activation marker.

## Actual Read Coverage And Source Gaps

The real generated get pipeline executes preGet before provider query/count on
cache misses. Mongo `getItems` calls `countMatchingItems` for that same query;
there is no separate generated preCount lifecycle. Canonical safe search builds
a safe query and invokes generated `.get`. Governed `DataExportService` collects
pages through the same safe-search owner and generated `.get`. Those paths use
the installed Contact/Employee/Customer preGet and postGet hooks. No fictitious
Contact preCount/preExport hook is declared.

PostGet uses the sole Contact redactor for nested public Contact evidence on all
three schemas. It runs before ordinary cache insertion on misses. Nested model
reads use generated owners; bulk saves derive single-model save requests, so
their actual preSave operation is guarded rather than trusting a bulk body flag.
The Contact owner currently issues private `.get` and `.update` using the same
exact request through generated preparation; no admission clone is needed here.

**Standard shared-source integration is now present, not installed qualification:**

- `DefaultModelsGetInitializerService.lookupCache` now invokes the effective
  prepared-schema owner before cache selection. Protected schemas skip shared
  item lookup/write; standard Cache Service also excludes public cache channels
  in modules with protected schemas, including existing router-cache entries.
  Result policies compose privacy before cached stop/public response.
- Actual Mongo `getItems`, `countMatchingItems` and durable reads invoke the
  same configured owner before query/count and project before returning results.
  Canonical safe search and governed export inherit generated get protection.
  Direct native driver/custom provider calls still require installation coverage.
- Publication/search indexing, alternate adapters, old cache entries, raw driver
  entry points and custom serializers require explicit inventory. BackOffice
  exclusions do not prove API/index privacy. Unsupported BSON/custom-toJSON
  projection shapes remain the sole Contact owner's redactor review boundary;
  the adapter does not duplicate or silently repair that owner implementation.
- Private admission on any newly introduced trusted derived read must compose
  only the Contact owner's existing `inheritContactAdmission(derived,original)`
  at the actual derivation, preserve other owners and bound its lifetime. Never
  inherit based on enumerable metadata or grant all system-authenticated reads.

## Installed Source Integration Surface

`providerRead(exactInput, actualPreparedModel)` composes Contact `guardContactRead`
and Customer Eligibility `protectRead`. `providerResult(exactInput,
responseWrapper, actualPreparedModel)` composes both independent redactors.
Both require an actual Contact/Customer/Employee receiver; the wrapper uses
`success` for its existing envelope. They are wired by effective
`rawSchema.readProtection.owner`, not a second registry or Profile hardcode in
Foundation. See the complete
[provider and cache contract](../../../../../nodics.foundation/modules/nDatabase/database/llm/contracts/protected-schema-provider-reads.md).

Prepared read declarations now also cover Enterprise, Password and Identity
Migration Audit. Result composition retains historical retirement, Team and
Enterprise Consent owners rather than replacing their private admissions.
Team callbacks preserve only exact original or deterministic generated paging
fingerprints; copied or modified owner requests are not admitted. The original
15 generated Contact hooks remain unchanged; this broader provider composition
does not manufacture extra generated lifecycle triggers.

Use the original exact read input for both calls, retaining existing private
Contact reads. A native count currently accepting only a query must preserve its
trusted original request at its actual parent read or explicitly refuse private
filters; constructing a lookalike request cannot manufacture private admission.
The owning generic database adapter must select capability-owned integration,
not hardcode Profile domain names throughout Foundation. Do not expose these
service-only integration methods as browser routes.

## Deferred Evidence And Customization

`../../test/verifiedContactInterceptorIntegration.test.js` uses isolated provider doubles.
It covers all actual appended handler names, generated preSave/preUpdate/preGet/
postGet dispatch, real Mongo's ordinary insert branch with controlled doubles,
INSERT versus managed/upsert classification, protected incoming/original
associations, untouched legacy patches, marker manufacture, real Contact private
CAS/read admission, copied-request refusal and recursive marker redaction.
The new `../../test/protectedSchemaProviderReadContract.test.js` exercises the
actual standard source integration with isolated doubles. Neither fixture proves
installed raw-provider or distributed cache safety.

Later layers may tighten these exported adapters or replace a qualified provider
while preserving fixed operation/schema semantics, always-on marker protection,
sole-owner redaction and exact private admission. Qualify provider/custom-layer
semantics, caches, index/export privacy, concurrent association edits, grants and
visual flows jointly. All verified-contact rollout gates remain false; no runtime
write, import, send or behavioral test is authorized by this source integration.
