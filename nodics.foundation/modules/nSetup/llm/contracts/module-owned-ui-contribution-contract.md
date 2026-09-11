# Module-owned UI contribution contract

## Principle: placement does not transfer ownership

A business navigation group can compose contributions from several modules.
The module that owns the business capability owns its navigation data, component
properties, workspace definitions, labels, filters, permissions and defaults.
Visual nesting beneath another module never transfers that ownership.

The generic framework owns shared capability anchors and domain-neutral views.
An accelerator owns its industry-specific subgroup and views. Customer branding,
application composition and project policy belong to the customer backend.
The frontend owns executable renderers and interactions, not importable business
data or an alternate navigation catalogue. Follow the customer-project authority
contract before writing to any of these layers.

## Existing composition mechanism

1. Publish data through the concrete module's existing BackOffice capability
   provider and authenticated runtime registration. Do not register a composition
   group as a concrete business provider or create another registry/loader.
2. The parent owner publishes a stable navigation id. A different module attaches
   its subgroup with that `parentId` and explicit `parentModuleName`.
3. Local descendants use their own contributor's parent identity. The publishing
   module remains their owner even when a workbench target names another schema.
4. Inherit the parent business group unless an authorized, intentional placement
   override is required. Do not copy another owner's anchor or group definition.
5. BackOffice validates and composes active contributions, applies permissions,
   rejects duplicates/cycles and removes orphaned descendants across every
   module boundary. An absent, inactive or denied parent cannot leave executable
   child navigation. Missing optional children never invalidate the generic group.
6. A saved presentation override cannot activate a missing module or change its
   executable workspace target. Axis consumes the effective authorized result.

Do not predeclare a future accelerator's placeholder subgroup in the generic
framework. Absence means absence. A later accelerator supplies its own subgroup
when its capability exists and is activated. Core must not import it, list its
labels or maintain a switch over its business name.

## Navigation and component data

Use module-owned `data/` artifacts and the established declaration/import
contract for their artifact kind. Capability source consumed by a provider is
not a database import or a startup-write instruction. Executable data releases,
source contributions and CMS content must remain distinct in their manifests.
Keep view/property defaults under the same business owner. Compose extension
maps with stable owner-qualified keys; do not replace a generic view array with
an accelerator-only list. Schema/projection authority stays with the owning API.

A view's visual scope is not authorization. Backend queries enforce any fixed
family/status filters from a declared view and independently apply employee and
record scope. User input cannot overwrite a view's fixed scope. Revision,
confirmation and operation permissions remain enforced by the target API.

## Native workspace binding

The existing `backendWorkspace` contract supports a bounded native variant:
`renderer: axis.workspace.native`, `contractVersion: 1`, `workspaceCode`,
`viewCode`, `title`, and optional `description`. Codes are bounded identifiers,
never URLs, scripts, component imports, expressions or executable callbacks.
Axis selects an installed renderer for a recognized workspace code. Unknown
renderers/views remain unavailable. Native workspaces do not invent fake schema
targets merely to route to a business screen.

Use the exact authorized navigation route. Route prefixes, labels, schema names
and keyword matching do not establish ownership or renderer selection. A business
review screen must not intercept another module's configuration pages because
their URLs share a prefix.

## Waste ownership example and acceptance

Waste Core owns the Waste Management dashboard anchor and its two generic
children: All submissions and Review queue. eWaste owns the Electronics
dashboard anchor and its Submissions and Review queue children. Dashboard anchors
must not repeat themselves as Overview submenu links. When apparelWaste is implemented, it
will own Clothing & Textiles with the equivalent children. This is a contribution
pattern, not authorization to scaffold or activate apparelWaste in advance.

Maintainers test the generic capability alone, each actual accelerator alone
with its required generic owner, combined contributions, missing/denied parents,
missing/disabled contributors, cross-module grandchildren, cycles, duplicate
identities, bounded native targets and later-layer customization. Frontend checks
cover exact route dispatch, unavailable deep links and preservation of contributor
identity after grouping. Operators refresh discovery and inspect the owner identity;
they do not repair missing features by creating placeholder links in another module.
