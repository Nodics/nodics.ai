# Commercial Agreements

Commercial Agreement owns Enterprise package assignments, descriptive agreed
terms, immutable amendment history, and search-benefit evidence. A single
Product package may be used for FIXED_PRICE or SUBSCRIPTION agreements, each
independently PREPAID or INVOICE. Product owns packages and Pricing owns prices.
This capability references their exact versions and retains the agreed price;
later catalogue edits cannot rewrite an agreement.

The service records explicit renewal, termination and financial treatment. It
does not issue invoices, debit money or rewards, enforce allowances, interpret
legal terms, or change Profile Enterprise status. A linked financial record
proves only that the referenced record exists, not that payment succeeded.

## API And Persistence

`POST /agreements/record` records a creation or complete amendment. Supply
`code`, `enterpriseCode`, `commandId`, `expectedRevision` and `terms`.
`expectedRevision: 0` creates an agreement; later commands supply its returned
revision. `POST /agreements/read` accepts `code` and `enterpriseCode` and
returns authorized history. Paths are relative to the module API.
`POST /agreements/search` accepts `enterpriseCode`, explicit `pageNumber` and
`pageSize` and returns bounded summaries with a `hasMore` indicator.

Employees need `commerce.agreement.manage` or `commerce.agreement.read` as
appropriate. Signed Enterprise scope is mandatory; only an existing admin
grant may select another Enterprise. Body identity never supplies authority.
The permission release defines permissions only; Profile owns actual grants.
Its portable header omits tenant selection during static inspection without
runtime globals. At import, it uses `CONFIG.get('defaultTenant')` exactly;
nConfig owns that default, and this header supplies no fallback. Header bytes
and the permission section checksum remain
pinned by the release manifest and its aggregate prerequisites.

One `commercialAgreement` aggregate stores append-only version snapshots.
Generated database concurrency performs the atomic revision check and write.
Owner-admitted interceptors reject generic replacement, import and deletion.
The record uses `enterpriseRef` for business ownership and the generated
tenant persistence envelope for runtime isolation, without a second tenant
field. Every version retains actor, timestamp, command and agreed evidence.

An uncertain response is retried using the identical command and actor. A
committed replay returns its version without another write. Changed terms with
the same command ID, stale revisions, conflicting concurrent amendments,
malformed configuration and unqualified persistence fail closed. History is
bounded explicitly; exceeding the bound never discards older versions.

## Search Benefits

Benefits explicitly select PACKAGE_INCLUDED or ADD_ON, exact Store, selected
Product codes or ALL_ENTERPRISE_COUPONS, and independent start/end dates.
ADD_ON requires descriptive additional-benefit agreement evidence. A benefit
code identifies the same coverage across amendments and repeated publication.
No source selection creates a charge or a paid flag.

Search calls `DefaultCommercialAgreementOperationService.resolveBenefit` with
`{agreementCode, enterpriseCode, benefitCode}`. It receives the currently
effective coverage only, without prices or financial records. Future
amendments retain the current terms until their effective boundary. Search
resolves canonical coupon issuer membership separately and only reorders the
complete eligible Product candidate set.

## Setup And Extension

Commerce Search Core declares `commercialAgreement` as a required module because
its benefit projection calls this owner's current-coverage service. The broader
`baseCommerce` group does not require it, so independent Commerce capabilities
such as Inventory remain independently composable. The module index is `76.15`;
Commerce Search Core is `76.16`. This source dependency does not activate a
runtime or import permissions. Product, Pricing, Profile
and the generated database service must already be available in the selected
composition. Search activation remains independently selected.

All mechanics, validation bounds and permission defaults live in
`config/properties.js`. Later layers may override actual values or exported
service members while preserving scope, history and generated concurrency.
Every owner policy read validates workspace pagination alongside mutation bounds;
missing settings never receive service-local replacement defaults. Text limits
also remain within the configured maximum bound.
Packages, rates, agreements, model choices and dates are governed records,
never customer configuration defaults. No model, price, duration or renewal
consent is selected by framework configuration.

The owner contributes implemented ACTIVE source metadata for the exact Axis
`commerce.agreements/commercialAgreement.history` workspace. Axis lists and reads
persisted history, creates complete agreements and records full amendments after
explicit confirmation. `POST /agreements/workspace` accepts `enterpriseCode` and
projects current command permissions, semantic choices and configured bounds.
CMS presentation is the optional governed `agreementWorkspace` release, using the
existing Axis Site and template. Source availability neither installs that release
nor grants access. Generic schema editing stays unavailable; Profile's Super Admin
status control remains separate. See the Axis feature README for client recovery.

## Verification

Run `node --test nodics.commerce/modules/baseCommerce/modules/commercialAgreement/test/*.test.js`
from the framework root. The tests exercise the actual generated concurrency
service with synthetic in-memory provider behavior: model combinations,
amendments, future timing, retries, conflicts, authority, customization and
failure recovery. They establish local unit behavior, not installed database,
HTTP, browser, provider, import, runtime or release acceptance.

`acceptance:commercial-agreement --execute` is the separate read-only installed
HTTP runner. A project supplies a reviewed `tooling.acceptance.commercialAgreement`
selection and the original employee token; the framework owner supplies the
command, validation and bounds. It reads workspace, bounded search and exact
retained histories and never records or amends an agreement.

See [ownership and contracts](llm/contracts/README.md),
[examples](llm/examples/README.md) and [agent guidance](AGENTS.md).

## Public Documentation

The optional `documentation` manifest section owns the canonical
`commerce.commercial-agreements` guide directly under
`data/docs-v001/records/documentation`, with `sourceMode: cms-records`.
It reuses the existing documentation foundation without a parallel catalogue or
Markdown source. New guide records remain DRAFT; installing documentation is not
agreement creation, workspace installation, permission assignment or activation.
Retain IDs and detail when editing, update dependent text/checksum evidence and
run `test/commercialAgreementDocumentation.test.js` before the parent global gate.

Keep dated implementation inventories and verification results in the canonical
audit workspace, not permanent module contracts. The contracts above describe
durable source behavior; installed runtime acceptance remains separate.
