# Acquisition Report Refresh

Promotion owns complete acquisition projections and coverage. Digital owns the
confirmed purchase/redemption source; Cron owns schedule definitions, operational
admission and execution. This binding closes source-level refresh invocation,
not installed-runtime qualification or reporting dimension acceptance.

## Invocation

The explicit `acquisitionRefreshSchedule` manifest section contributes an inactive
`promotionAcquisitionRefreshJob` through the standard data-release/header import
path targeting Cron's `cronJob` schema, with no custom installer. It uses a
new `init-v002` source root; existing releases are unchanged.
`active` and `runOnInit` are false. `jobDetail.channelCode` is null until an
operator selects an exact business channel. Tenant, node and cadence are governed
Cron record selections, not reusable property definitions. The hourly reference
schedule does not activate itself or override the owner's due interval.

Cron's existing `jobDetail.startNode` dispatcher invokes
`DefaultCouponAcquisitionRefreshService.run`. The Cron runtime must load this
Promotion binding and its dependencies. It rechecks `assertOperational`, the
unchanged job definition, policy and original runtime token before/after transport.
It calls Promotion's registered `POST /internal/acquisition-report/refresh` route
on the `COMMERCE` target through existing module transport. Deployment prefixes
remain nRouter-owned. There is no new timer, generic orchestrator, Process engine
or alternate projection store.

The service-only endpoint requires `commerce.promotion.analytics`, scoped runtime
admission for Promotion and Digital, and an explicitly selected caller assignment.
The signed tenant remains the projection partition. Caller selection is a security
binding with tenant, principalEnterpriseCode, serviceId, projectCode,
environmentCode, serverCode, instanceCode and assignmentCode; it grants no new
permission. The grant is tenant-wide analytics-service authority, not a merchant
report view grant. Human/customer tokens and contradictory Enterprise aliases
refuse. Body accepts exactly `{ channelCode }`; no tenant, issuer, query, service,
credential, watermark or pagination overrides. Public merchant read/export
authorization and privacy protections are unchanged.

## Defaults And Recovery

Complete definitions live in `promotion.acquisitionReporting` and its `refresh`
child in owner `config/properties.js`. Both reporting and refresh default off;
caller selection defaults empty. Existing defaults remain 200 source rows/page,
100 pages, five distinct owners, 3600 seconds and 8388608 projection bytes.
The transport defaults to Promotion/COMMERCE, v0, 60000ms and one attempt.
`refresh.validation` defines the numeric ranges for all consumed bounds,
including the caller-list bound; services have no replacement defaults.
Customer/runtime properties contain only intentional overrides. No source
channel, tenant, customer identity or actual caller assignment is supplied.

One invocation covers one channel, never a wildcard or all-tenant scan. A recent
successful projection returns `NOT_DUE` with its retained coverage. Otherwise
the existing complete-history reader pages under a content-addressed snapshot;
confirmed source coverage, not the scheduler start time, determines the watermark.
Projection and watermark are one guarded transaction. Incomplete pages, snapshot
drift, conflicting duplicate facts, invalid bounds, policy drift, oversized
projections and failed writes leave the last complete projection unchanged.
Concurrent writers cannot regress coverage. No partial cursor is persisted as
successful coverage.

`COMPLETE` and `NOT_DUE` return only contractVersion, status, channelCode,
dataUpdatedThrough and UTC timezone. Failures propagate rather than returning a
new watermark. Lost acknowledgement after commit is safe: a later invocation
rereads the saved projection and normally returns `NOT_DUE`; once due it rebuilds
from authoritative evidence, including late events. It never replays purchases,
payments, coupon consumption or transfers. Concurrent due runs may redundantly
read source history, but persistence remains revision-fenced and atomic.

## Adoption And Verification

Operators must explicitly select/import the contribution, review the Cron record,
enable owner policy, select the original caller assignment, obtain existing
runtime/module/analytics grants and qualify generated persistence and transport.
Source registration alone is neither activation nor permission. Administrators
can retry the existing Cron job after a failure; report consumers retain the last
confirmed coverage. Partners customize through owner property overrides or the
normal service extension boundary, preserving admission and watermark semantics.

`test/couponAcquisitionRefresh.test.js` composes the real Cron dispatcher, owner
controller, Digital source and Promotion private persistence using unit-only
transport/storage doubles. It covers complete multi-page history, channel/tenant
isolation, disabled/invalid/default/custom policy, unchanged original credentials,
source failure/truncation/conflict, failed commit, lost acknowledgement and retained
watermarks. No import, schedule activation, native transaction, server or E2E is
run. Installed scheduler lifecycle, concurrent database/restart and permissions
remain final-stage acceptance gates.
