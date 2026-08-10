# engagementCore Examples

## Supported customization direction

A customer project may override an Engagement policy under its later-loaded configuration layer; it must not copy Engagement Core services or redefine shared statuses.

For example, a tenant-aware later module may add a `RECEIVED -> ACCEPTED` transition through layered `engagementCore.lifecycle.transitions` configuration. The lifecycle service still requires `expectedRevision`, returns the incremented record, produces activity evidence, and emits a content-free event descriptor.

An intake caller supplies tenant, correlation ID, idempotency key, submission type, retention policy, channel, and payload to `DefaultEngagementIntakeService`. It injects the validation, protection, repository, and optional risk adapters. Replaying the same key and request hash returns the existing submission; changing the content under that key fails with `ERR_ENG_00003`.

Process and publication calls are adapter-driven. With no Process adapter, work is marked safely deferred. With an adapter, Engagement stores only the returned process reference. Publication evaluation records eligibility and an optional nPublish reference; it never advances generic publication state.

## Rejected shortcut

Do not call archived/generated residue as a service authority, expose schema CRUD directly, duplicate Process/nPublish/provider lifecycle state, or hardcode project, tenant, provider, permission, or retention policy.
