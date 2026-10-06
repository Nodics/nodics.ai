# Runtime Knowledge Configuration

Copilot is a framework capability, not an application or accelerator feature.
This contract governs **selection of knowledge**, not ownership of its content.
It supplements the source registry and secure ingestion contracts; none of their
classification, identity, publication or authorization requirements are relaxed.

## Owners

| Responsibility | Existing owner |
| --- | --- |
| Active module graph and effective properties | nConfig |
| Source registration, selection, groups, inclusion/exclusion and refresh policy | Copilot Knowledge and Policy administration |
| Reviewed durable property activation and audit | nDynamo, applied by nSystem |
| Derived searchable evidence | Discovery and nSearch |
| Refresh execution and schedules | Process and Cron |
| Business content, schemas, customer facts and operations | Their domain owners |
| Settings and inventory presentation | Axis consuming permission-filtered owner APIs |

No additional registry, configuration store, loader, scheduler or source-specific
startup service may be introduced. A new ordinary module must become a candidate
without adding a Copilot contribution to that module's source code.

## Configuration Boundary

Framework defaults have an empty source registry. Framework and project root
coordinates use nConfig's trusted path bindings. Coordinates only identify where
eligible content can be resolved; they never authorize ingestion or retrieval.
External transport coordinates remain deployment-owned.

Authored module, accelerator, project and environment properties must not contain
source selections in `sourceRegistry.definitions`, group definitions/assignments,
or external-log source selections. Empty framework defaults and generic source
templates are allowed. Runtime records use these existing effective property paths
through nDynamo; moving selections into another source file is not a correction.
Tests may declare isolated fixtures, but fixtures are not deployment configuration.

Deployment still owns capability composition, optional ingestion/retrieval gates,
trusted transport, provider credentials, limits and durable-store qualification.
Domain applications may select an AI usage profile and contribute content or
permissioned operations. They must not replace the framework knowledge registry
or implement knowledge lifecycle logic. Shared Copilot guidance must not contain
one accelerator's field names, lifecycle stages or customer instructions.

## Runtime Registration

1. Resolve the authenticated employee and current tenant, enterprise, environment
   and project. Check configuration management, elevated administration and source
   permissions before returning registration controls.
2. Read `NODICS.getIndexedModules()` from the **current running backend**. Installed
   packages, repository directories and dependency declarations are not activation.
   Module-relative roots must remain inside trusted repository coordinates after
   real-path resolution. Do not return absolute filesystem paths to Axis.
3. Present eligible partitions. Discovery must neither register a source nor read
   its files, grant access, ingest content, or invoke an LLM.
4. The administrator selects partitions, content type, reviewed revision, included
   paths and excluded paths. The existing Axis form supports source code and
   internal documentation. New sources are restricted, employee-scoped, explicitly
   permissioned, secret-scanned and **disabled**. A proposal supports at most 100
   partitions; the registry supports at most 1000 sources.
5. Preview and submit through Copilot administration. nDynamo owns approval,
   activation and persistence; a submitted or approved request is not activation.
   Recheck module availability, policy, preview digest and property revision.
6. Enable selected sources through a separate reviewed change, then assign group
   ceilings and active groups. Preview ingestion before explicitly refreshing it.
   Runtime startup ingestion, when opted in, reads the same governed registry.

The current form discovers the current backend only. Do not claim remote-runtime
or frontend module discovery from that list. Remote source access must use its
existing registered owner/transport and explicit governance, never a second scan
of arbitrary checkouts. Customer/public/database/log registrations retain their
existing source/provider contracts; the restricted repository form must not be
used to downgrade code into customer-visible guidance.

## Isolation And Recovery

- Selecting a parent partition does not select child `modules`, `envs` or `nodes`.
  Select eligible children individually. Disabled or unloaded children are not
  made readable by a wildcard on their parent.
- Permission, channel, tenant, enterprise, project, group and collection/field
  restrictions are intersections. Module activation and customer authentication
  are not grants. DATABASE sources continue through live owner reads under the
  caller's authority; external logs remain bounded owner queries.
- Missing/unloaded module bindings fail closed. A load-order change invalidates
  the policy fingerprint and requires a fresh ingestion review. Do not silently
  revert to a repository-wide source or reuse stale chunks.
- Approval, durable activation, propagation, index publication and customer
  usability are separate evidence states. A lost response requires inspection of
  the original request before another write.
- nDynamo must be present on every Knowledge runtime. Durable persistence remains
  a deployment opt-in; unavailable persistence blocks administration rather than
  silently falling back to source configuration or volatile storage.

## Existing Installation Migration

Before removing authored selections, preserve their exact effective metadata
through approved configuration APIs or a source-only deployment projection. The
latter is not proof of live configuration and must not overwrite live edits.
Preserve IDs, versions, classification, permissions, channel/project scopes and
path semantics. Do not broaden a customer guide into an employee code corpus.

On each owning runtime, inspect current governed values, propose the reviewed
selection through the existing nSystem property API, and inspect its preview.
Create, approve and activate the request with independently required permissions.
Verify durable acknowledgement and restart restoration before claiming migration
complete. This is operator data, not a new application boot hook or a copied
sample catalog. A source-boundary or root change changes fingerprints: refresh
under the owner before declaring the replacement evidence ready. Old indexed
chunks are never authorization for a missing registration.

## Required Verification

Prove empty installation defaults, discovery without side effects, selection
after module activation without code changes, disabled/inactive rejection, child
partition isolation, allowed/denied registration, stale review rejection,
permission/group/tenant/channel isolation, explicit refresh and durable restart.
nTooling statically rejects authored source selections, including role profiles
and replacement/environment bindings, without executing customer properties.
Source/unit evidence must not be reported as browser or live migration acceptance.
