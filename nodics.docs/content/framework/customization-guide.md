# Customization and extension guide

Nodics is built for customization, but customization must happen in the right
owner. The safest path is to reuse an existing capability, configure it, extend
it in a later-loaded module, and create new framework behavior only when the
existing contract truly cannot satisfy the requirement.

## What this is

This guide explains how a customer or partner changes Nodics behavior without
turning a customer project into a fork of the framework. It applies to backend
customization, Axis presentation customization, and documentation ownership.

## The customization ladder

Start with the least invasive option:

1. Use existing behavior.
2. Change configuration in the correct project, environment, server, node, or
   tenant scope.
3. Add customer project modules under the customer project.
4. Add a customer extension module that extends a framework functional module.
5. Create a new implementation only when the existing capability contract is
   missing or incorrect.

This ladder protects upgradeability. The later a customization loads, the more
specific it is. Framework modules stay reusable; customer modules carry
customer decisions.

## Backend customization

Backend behavior belongs in the backend project or module that owns the
business rule. In Kickoff, project modules live under `modules/`, while
environment and server composition live under `envs/`.

A future module such as `kickoff.platform` may extend `nodics.platform` to
customize Platform services. The runtime server can load the customer extension
after Platform. Service precedence then follows the normal module merge and
index order. Axis should still display the functional capability as Platform,
because the customer extension changes implementation, not the business-facing
identity.

## Axis customization

Axis is the browser application. It owns renderers, interaction behavior,
layout, accessibility, and static recovery. It must not own imported CMS data,
backend schemas, permissions, or business rules. If a customer needs a new
BackOffice page, the backend should expose the authorized navigation,
capability metadata, API contract, and CMS content where applicable. Axis then
renders that authorized contract.

Simple presentation changes, such as logo, copy, theme, or demo content, should
come from backend-owned CMS or configuration where possible. Hard-coding those
values in the frontend makes future customers harder to support.

## Documentation customization

Documentation follows the owner of the thing being explained:

- framework guidance goes to `nodics.docs`;
- Axis product guidance goes to `nodics.platform/modules/axis`;
- project guidance goes to the owning customer project, such as
  `nodics.kickoff`;
- generated content records stay under `data/core/data/documentation`;
- manifests stay under `manifest/docs-content-pack.json`.

Do not put customer project documentation into `nodics.docs`, and do not put
importable documentation records into `nodics.axis`.

## Common mistakes

- Editing framework source for one customer.
- Adding business authorization in the browser.
- Creating a second module registry or endpoint list in Axis.
- Moving generated CMS data into a frontend repository.
- Changing a functional module display name because an implementation was
  customized.
- Skipping tests after service override changes.

## Verification

Every customization should prove success and failure behavior. For backend
changes, run the owning module tests and any affected runtime smoke test. For
Axis changes, run typecheck and focused UI tests. For documentation changes,
regenerate the owning content pack, validate checksums, import through WCMS,
and verify the route in Axis.
