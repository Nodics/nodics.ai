# Scoped Business Workbench

Waste Core owns read-only Workbench projection; Waste API owns its secured HTTP
transport. Reuse DefaultSchemaUtilityService and DefaultSchemaSafeQueryService,
not a second UI or query engine. Do not grant system.schema.view/manage or restore
employee schema writes. Business Edit/Full control still use existing authorized
asset/listing commands; these read endpoints cannot publish, mutate evidence or
approve financial operations.

Require signed human access-token tenant and enterprise, persisted employee
ancestry, waste.backoffice.view and current Profile collection scopes. The signed
enterprise is a ceiling even for global/tenant scopes. Read collections through
their operatorEnterpriseRef and scope predicates, then submissions and assets
through persisted links. Force generated-read partition and predicates; validate
every returned row independently. Never infer enterprise from HTTP input, customer
names, reference metadata or caller-supplied permissions. Waste records use tenant
partitions, not invented persisted tenant fields. Reject explicit conflicting
tenant/enterprise markers, including conflicting authenticated/request `tenantCode`
aliases. Validate bounded hydrated group ancestry before shared permission walkers;
malformed arrays, cycles, group codes or permission lists are not authority.
Fail on incomplete/oversized scope expansion.

Partition proof comes from the existing generated service in
`nodics.foundation/modules/nService/src/service/common.js`: `get` selects
`NODICS.getModels(moduleName, request.tenant)` before starting the generated get
pipeline. The nine effective Waste schema definitions do not declare tenant fields.
The regression uses separate owner/module registries in two tenant partitions,
executes the actual generated service and asserts that only the signed partition's
model reaches the get pipeline. It does not add row tenant fields to manufacture
proof. Explicit foreign markers still reject; their absence is not an enterprise
grant, which requires the collection-rooted relationships above.

Only collection points, submissions, receipts, verification, metadata suggestions,
assets, ownership events, marketplace projections and impact selections currently
have qualified collection-rooted read adapters. Policy/reference catalogues and
other advertised admin pages remain on their existing separately authorized schema
surface: they have no qualified business scope projection in this change. Do not
make absent ownership links mean tenant-wide access. Qualifying those pages needs
their owning module's persisted relationship and disclosure contract.

Descriptor/search/capability routes are read-only and expose only selected scalar
schema fields and flat localized collection names. Nested objects/arrays under
scalar keys, non-finite numbers and nested localized values reject instead of
passing through an allowlisted field name. Dates use their scalar ISO representation.
No evidence payload, owner references, generic relationship actions,
raw provider query, write transport or hidden fallback is advertised. Source
navigation selects the same Waste API connection/module for discovery and reads.

Every generated read requires the affirmative `SUC_FIND_00000` envelope emitted
by the uncached get initializer, an own result and a bounded count. Missing or
error codes, nonempty/malformed errors, an error marker and explicit non-true
success/acknowledged flags reject even with plausible scoped rows. Empty results
cannot substitute for an unavailable dependency. Do not accept alternate envelope
aliases or weaken production validation to accommodate isolated fixtures.

Persistence uses DefaultIdentityGovernanceService.getSystemAuthData only after
domain admission. Preserve original caller auth, existing CAS/revision checks,
immutable records, publication and installed evidence. Missing identity authority
fails closed. Tests exercise real business role/group records, route admission,
schema utilities, scoped generated reads, foreign provider rows and retained owner
write delegation without live operations. Parent owns manifest/pin reconciliation.

The employee ACL correction applies to `schemaPolicies.wasteCore.operational`
only. Sibling modules declare separate operational ACLs; those remain outside
this bounded Waste Core/API change and require their own owner review.

## Validation And Extension

The focused regression is `nodics.waste/modules/wasteCore/test/wasteBusinessWorkbench.test.js`.
After owner integration and source freeze, the consolidated isolated validation
includes `nodics.waste/test/*.test.js`, `nodics.waste/modules/*/test/*.test.js` and
`nodics.accelerators/modules/waste/modules/eWaste/test/*.test.js`. Keep native
database acceptance opt-in disabled unless separately authorized; source-ready
is not E2E acceptance. The fixture loads each schema owner's real operational
policy, real business groups, shared descriptor/query services and generated get
pipeline over an isolated provider double. It covers all nine supported resources,
No access, each business level, Profile denials, foreign rows, scope drift and
persisted-fact precedence, contradictory envelopes and malformed field/claim
structures. Isolated consumers of shared Waste persistence must register the real
canonical identity service with its owner defaults, not fabricate service identities.
This is not live HTTP, token-verification or database
acceptance. Existing native persistence tests remain separately opt-in.

Discovery returns `{data:{schemas:[...]}}`; descriptors identify `wasteApi`, use
static `v0` owner search/capability paths, complete shared form metadata and a
positive bulk limit even though bulk operations are empty. Disabled mutation
transports retain their contract HTTP methods. Pagination is bounded to 100 rows
and 1000 pages, with stricter shared limits retained. Scope expansion fails closed
instead of returning partial authorization sets; provider failures are retryable
reads only, never reasons to broaden access.

Maintainers and partner extensions must qualify persisted collection links and
disclosure before extending the effective owner service. Do not add browser-only
filters, guessed tenant fields or a second descriptor/query engine. Business users
retain their existing domain commands; administrators still govern assignments
through Profile. Test/evidence and publication guards are unchanged.
