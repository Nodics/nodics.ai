# Staged-to-Online publishing lifecycle

Publishing is the governed movement of an exact, approved content version from
an authoring runtime to a delivery runtime. Think of Staged as a newsroom where
editors prepare and verify an edition, and Online as the distribution system
that serves only editions formally released. Saving a page does not make it
public; publishing its frozen version does.

This beginner-friendly guide is for business users, administrators, developers, architects,
operators, testers, partners, and AI tools working with publishable Nodics
content. WCMS owns content and deployment behavior, `nPublish` owns the generic
publication lifecycle, Process owns approval workflow state, and Platform/Axis
provides the employee administration surface. A public client consumes Online
only.

## Why separate Staged and Online

A content editor needs freedom to create incomplete versions without exposing
them to customers. Physical runtime separation also prevents a public request
from accidentally resolving an unpublished record. Publishing therefore uses
separate runtime roles, databases, credentials, routes, APIs, and media stores.

```mermaid
flowchart LR
  Author["Business user in Axis"] --> Staged["WCMS Staged: author and freeze"]
  Staged --> Process["Process: approval workflow"]
  Process --> Publish["nPublish: authorized lifecycle"]
  Publish --> Online["WCMS Online: deploy and activate"]
  Online --> Public["Nexus or another public client"]
```

Axis may reach authoring and delivery operations through backend-declared
routing. Nexus and other public applications receive only Online coordinates;
they must never receive a Staged host, credential, or operation route.

## Data lifecycle categories

Not all records should be published:

| Category | Examples | Lifecycle |
| --- | --- | --- |
| Publishable and versioned | sites, catalogs, pages, templates, components, navigation, routes, selected media and editorial projections | Author and freeze in Staged; approve; deploy an immutable package to Online |
| Operational and versioned | orders, workflow state, governed submissions and audit history | Remain in the owning Online/operational runtime; version for history without Staged-to-Online publication |
| Operational reference | users, customers, runtime registrations and similar identity/reference records | Remain with the owning module; do not invent publication or business-version semantics |

Every module-owned data bundle declares its lifecycle and destination. Import
does not grant authority to publish, and export does not become an import or
publication bypass.

## Running example

An editor changes a page template and page data in WCMS Staged. The editor
selects a specific version and requests publication. WCMS freezes the exact
dependency graph—including required components, routes, localization, media,
and accepted editorial members—into an immutable manifest. Process creates or
resumes the approval workflow. After an authorized decision, `nPublish` invokes
the WCMS adapter, which validates the Online role, promotes required media,
deploys the manifest transactionally, activates Online pointers, and records an
idempotent receipt and outbox evidence. The public client then resolves that
Online version.

A validation rejection, approval rejection, signature failure, missing media,
or transaction failure leaves the previous Online version active. A repeated
request with the same operation identity converges on the existing result.
Rollback reactivates a previously deployed immutable release; it does not copy
the latest Staged state.

## Initialization and reusable site bundles

Mandatory framework data such as the standard publication approval workflow
and baseline policy is installed from its owning backend module. Application or
website bundles are imported into Staged through governed nImport APIs. An
administrator verifies the content and explicitly publishes it. This supports
Axis initialization, partner website starters, and additional template bundles
without making the frontend or a customer database script the content owner.

Axis includes a minimal bundled recovery login so an administrator can sign in
when CMS data is not initialized. Once the Axis content baseline is Online, the
normal WCMS-delivered experience replaces that recovery surface.

## Security and integrity rules

- Never create, repair, seed, version, publish, restore, or verify business data
  through direct database CRUD. Use Nodics APIs or owning services.
- Human and service identities are distinct. Internal deployment credentials
  cannot substitute for a human approval decision.
- Online refuses authoring and publication-source export operations. Staged,
  Online, Process, Platform, and public routes fail closed for the wrong role.
- Tenant and enterprise identity, manifest checksum, source version, actor,
  approval, correlation ID, target receipt, and delivery outcome remain linked
  in audit evidence.
- Media is promoted to Online-owned storage before metadata activation. Online
  never reads a Staged media path.
- Reconciliation may rebuild missing evidence only when the target already
  points to the exact manifest. Pointer drift is reported and never silently
  overwritten.

## Customization boundary

A customer project may contribute later-loaded content bundles, environment
properties, server compositions, approval policy, or service overlays through
the standard Nodics extension hierarchy. It must preserve functional ownership,
runtime-role checks, immutable package identity, authorization, tenant
isolation, audit lineage, and idempotency. Do not fork `nPublish`, introduce a
second workflow authority, hardcode Staged routing in a frontend, or place
backend-importable CMS data in Axis or Nexus.

## Common mistakes

Do not treat a database copy as publication: it loses the selected-version,
approval, receipt, audit, and retry guarantees. Do not point Nexus at Staged to
preview a change, publish whichever version happens to be latest, seed Online
through an importer, or let a Process definition become content authority.
Do not store Axis or Nexus CMS records in the frontend merely because those
applications render them. Finally, do not report Local timing or automated
accessibility checks as production or human assurance.

## Verification

Verify a release through the complete path: Staged import and version, frozen
manifest, Process approval, authenticated deployment, Online receipt and
pointer, media availability, outbox delivery, audit correlation, and public
delivery. Also test rejection, response loss, retry, concurrent requests,
restart recovery, rollback, and unpublished isolation.

Local production simulation may prove container health, network separation,
authenticated data services, failover, backup/restore rehearsal, bounded load,
and soak behavior. It is not production certification. Managed-provider
failover, regional residency, real external providers, independent penetration
testing, production-scale load, and human assistive-technology review require
environment-specific evidence and accountable approval.

For executable reference-project commands, use the owning Kickoff Local
publishing operations guide. For content concepts and delivery structure, read
the WCMS overview and Media management guides next.
