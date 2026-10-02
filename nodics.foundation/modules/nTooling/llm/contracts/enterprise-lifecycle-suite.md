# Enterprise Lifecycle Suite

The existing `tooling.testSuites` now declares `enterprise-lifecycle` with
198 explicit fixture paths. The existing Test Suite Command Service
executes these ordinary `node` steps in isolated child processes; no runner,
registry, glob discovery, runtime activation or acceptance authority is added.
Registering this suite does not execute it. Behavioral execution was NOT RUN
for the original source-only batch; later execution evidence is recorded
separately and is not implied by registration.

## Historical Source Inventory

### Tenant Runtime Completion Registration (2026-10-02)

The current inventory is **198 entries and 198 unique fixture paths**.
`tenantNamespaceHandshakeContract.test.js` and
`tenantStartupCompletionContract.test.js` are explicit lifecycle steps, reachable
through `full` and checked exactly once by the existing coverage guard. Their
memory-only composition covers target Init, native Local bootstrap, actual
API-key/provider authorization, target token selection, failed preparation and
retained-grant revocation. This does not qualify live setup recovery or transport.

### Transport And Readiness Registration (2026-10-02)

This earlier registration contained **196 entries and 196 unique fixture paths**,
up from the previous 193-entry checkpoint. Three previously unregistered critical
regressions are now explicit lifecycle steps:

- nService: `moduleDomainRefusalCircuitContract.test.js`.
- nService: `moduleTransportFailureClassification.test.js`.
- BackOffice: `applicationReadinessEvidenceContract.test.js`.

The existing coverage guard requires all three exactly once, verifies their
existence and checks reachability through `full`. These fixtures exercise actual
transport/error/configuration owners with stubbed HTTP, not running deployments.
They cover typed normalization, availability projection, declared domain refusal
circuit accounting and security/transport denial preservation. Registration is
test metadata only and does not alter runtime code, execute the consolidated
suite, restart a deployment or qualify live acceptance. Earlier counts below
remain historical evidence rather than the current inventory.

Before this increment, 26 selected files were reachable through `full`;
157 selected files were not. The existing `profile` suite explicitly listed
11 files plus its existing capability-behavior step. It is preserved unchanged,
as is `basic`. `full` gains exactly one reference to the new suite. Previously
registered files may also be reached through existing suites: the current runner
does not deduplicate shared files, and this change does not alter that behavior.
The dedicated suite itself contains no repeated path or nested suite.

### Final Late-Fixture Reconciliation

That registration check found both requested late backend fixtures already
present exactly once; the suite at that checkpoint remained **183 files**, not 185:

- [Protected schema/provider reads](../../../../../nodics.platform/modules/profile/test/protectedSchemaProviderReadContract.test.js)
- [Verified Contact workspace](../../../../../nodics.platform/modules/profile/test/profileVerifiedContactWorkspaceContract.test.js)

The protected-reader fixture substitutes Mongo find/count and cache-owner ports;
it does not open a database connection. The workspace fixture injects owner reads,
exact private-entry admission and forbidden delivery/persistence ports. These are
deferred source fixtures, not live provider or runtime qualification.

Historical-dependency cases were appended to the already registered
[canonical historical identity fixture](../../../../../nodics.platform/modules/profile/test/canonicalHistoricalIdentityLinkContract.test.js);
the related [eligibility governance fixture](../../../../../nodics.platform/modules/profile/test/customerEligibilityDecisionGovernanceContract.test.js)
is also registered. Appending cases to an existing file requires no second suite
entry. Frontend-owned Axis/Circa fixtures remain outside this backend suite.
This reconciliation performed structural/syntax checks only: **NOT RUN**.

| Owner                                                                                 | Explicit Files |
| ------------------------------------------------------------------------------------- | -------------: |
| Profile: all 80 authored tests plus 30 safe generated declaration tests               |            110 |
| nAuth: session context and security binding                                           |              3 |
| nService: context, tokens and protected transport                                     |              8 |
| nConfig: private capture                                                              |              1 |
| nRouter: private capture, request and scope admission                                 |              5 |
| nPipeline: private request entry                                                      |              1 |
| nDatabase: credential revisions, retirement and concurrency                           |              4 |
| Commerce: Digital lifecycle, coupon seller/benefit, native Pricing/Cart, order/refund |             22 |
| Communication: intent, verification, resources, private transport and providers       |             18 |
| Process: owned start/retirement, claims, acknowledgements and reviewed decisions      |             11 |

### Current Late-Fixture Reconciliation

The 2026-10-01 reconciliation adds seven previously unregistered explicit paths
to this suite only, producing **190 entries and 190 unique fixture paths**:

- Profile: `passwordOwnershipPipelineContract.test.js`.
- Profile: `customerRegistrationPlacementContract.test.js`.
- nCommon: `interceptorOrderingContract.test.js`.
- nDatabase: `nestedImportReplacementContract.test.js`.
- nImport: `importPlacementAdmission.test.js`.
- nImport: `importRetryClassification.test.js`.
- nImport: `startupDestinationOwnership.test.js`.

Current owner totals are Profile 112, nAuth 3, nService 8, nConfig 1,
nRouter 5, nPipeline 1, nDatabase 5, nCommon 1, nImport 3, Commerce 22,
Communication 18 and Process 11. The table above preserves the historical
183-file inventory; it is not the current count. The existing
`fullTestSuiteCoverageContract.test.js` checks current count, unique explicit
paths, file existence and full-suite reachability of these seven additions.
No owner/full suite reference, runner, manifest or discovery glob is added.
The placement fixture creates and cleans a disposable source tree; these
fixtures use isolated owner/provider ports, not installed runtime acceptance.
The startup-destination fixture composes real release discovery and nConfig
role projection with isolated startup/manual admission; registration does not
establish installed startup acceptance. This documentation reconciliation does
not execute fixtures or revise historical execution evidence.

The authoritative individual filenames are in
[the existing configuration](../../config/properties.js), not a second manifest.
This is a current source inventory, not a Git-derived assertion that all files
were introduced in this batch. Later fixtures must be explicitly reviewed and
added through the same layered configuration. Arrays replace in later layers;
do not accidentally discard inherited security/privacy fixtures.

## Safety Classification

Profile's deployment-grant acceptance file invokes its existing acceptance
service with an injected `fetch` returning fixture responses and explicitly
checks GET-only requests. It does not contact a deployment. Identity, credential,
financial and concurrency tests use controlled owner/repository doubles rather
than live databases. Environment-variable fixtures affect their own child
process; they do not grant deployment authority. Template resources, mandatory
bootstrap, migration integration and Process contributions also write disposable
`os.tmpdir()` trees created with `mkdtempSync`, with cleanup. The migration
repository is a JSON file in that temporary tree, not a live database connection.

The transport-resilience and SMTP-runtime files create disposable servers on
ephemeral loopback ports. The SMTP fixture receives fictional test content, not
real mailbox delivery; the transport fixture tests its local HTTP server.
These are behavioral test side effects and are intentionally NOT executed now.
Inspect their current source again before the joint session if changed.

Profile generated schema, API contract and non-mutating API scenario files only
assert static declarations using Node's assert module; all 30 are included.
All eight generated Profile CRUD files declare destructive explicit-only
scenarios and are excluded, preserving their separate operation contract even
though their present wrappers only validate declarations. Other owners' generated
`test/gen` suites and live Commerce acceptance `.mjs` runners are not selected.
Publication,
checkout, reward or journey acceptance requiring a deployment remains a separate
approved operation. No reset/import/write/send/server command or runtime
credential bootstrap step is registered in the dedicated suite.

## Joint Session

Use the existing Test Suite Command Service with
`--suite=enterprise-lifecycle` after explicit test-session approval. Confirm
test dependencies, independent capture suppression and disposable transport
fixtures first. Record executed pass/failure evidence separately from source
registration and static validation. Source availability does not establish
deployment qualification, visual acceptance, sender approval or release readiness.
