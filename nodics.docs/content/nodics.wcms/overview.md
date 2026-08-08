# WCMS content management

WCMS is the Nodics functional module for governed web content. It owns the
backend records that describe sites, content catalogs, page types, templates,
slots, pages, components, navigation, routes, restrictions, publication, and
delivery. A frontend such as Nodics Axis renders the resolved contract, but the
backend decides which content exists and when it is active.

## Problem it solves

Most enterprise applications eventually need content that changes faster than
code releases. Login pages, documentation, dashboards, banners, help text,
navigation, and site experiences should be governed without asking developers
to rebuild the frontend every time copy or composition changes. WCMS gives
Nodics a backend-owned content model that can be imported, versioned, searched,
published, and delivered safely.

## Core ownership rule

If a CMS record is imported into a database, it belongs to a backend module or
backend project. `nodics.axis` may provide renderers, but it must not own
database-importable site, page, component, catalog, or route data. Framework
documentation belongs in `nodics.docs`, Axis product documentation belongs in
`nodics.platform/modules/axis`, and customer project documentation belongs in
the customer project.

This rule keeps runtime ownership clear. It also allows a partner to replace
or extend a frontend without losing the governed content source.

## What WCMS manages

- Sites: named delivery surfaces such as Axis documentation or a storefront.
- Content catalogs: governed containers that group pages and components.
- Page and component types: contracts that describe what kind of record is
  being rendered.
- Templates and slots: layout-level rules for where components can appear.
- Pages and components: authored content and structured properties.
- Routes: URL, locale, channel, site, and page mappings.
- Navigation nodes: menu structures and discovery metadata.
- Restrictions: access and delivery constraints around content.
- Publication state: the difference between authored content and content that
  is safe to deliver.

## Developer model

Developers should treat WCMS data like code-owned configuration until the
business explicitly moves a capability into operator-managed authoring. A
module ships source documentation or content definitions, generates importable
records, and exposes the pack through the governed import system. The generated
records are then loaded into WCMS. Runtime delivery reads the database records,
not the frontend repository.

When a project needs custom content, place the source and generated pack in the
owning project, such as `nodics.kickoff`. Do not modify framework packs to add
customer-specific pages.

## Business model

WCMS reduces release friction. Business users can work with governed content
surfaces while developers preserve reusable module boundaries. A partner can
run many customer-facing websites, internal applications, and documentation
experiences through the same content foundation while still keeping project
ownership clean.

## DevOps model

WCMS should be deployed as a runtime server when content delivery or content
management is required. Axis depends on Platform for identity and on WCMS for
governed presentation content. Local Kickoff normally starts Platform, WCMS,
Cron where needed, and Axis as the frontend renderer.

Production deployments should define backup, migration, publication, cache,
search, media storage, and import history policies. Content packs should have
semantic releases, checksums, and repeatable import behavior so an environment
can be rebuilt from source-controlled module data.

## What not to do

- Do not put WCMS import data in `nodics.axis`.
- Do not create a second content registry in the frontend.
- Do not hardcode page availability in Axis when WCMS can deliver it.
- Do not let a route imply ownership; route ownership comes from the backend
  module or project that owns the pack.
- Do not let generated records drift from their source catalogue.
