# Documentation import contract

Platform is the runtime authority for documentation visible to Axis. The
content producer is an independent project and does not participate in runtime
module loading.

## Release input

A release uses contract `nodics.documentation/v1` and contains immutable
Markdown plus a catalogue with:

- globally stable document ID;
- canonical `functionalModule` owner;
- optional `technicalModule` detail owner;
- title, summary, and locale;
- package-relative content location and release-time SHA-256 digest.

## Import boundary

The Platform initialization API will accept a released content package, never a
source repository path. Before persistence it must:

1. validate the contract and release version;
2. reject duplicate IDs, unsafe paths, unsupported locales, and hash mismatch;
3. require every functional owner to exist in the project catalogue;
4. stage all documents under one candidate catalogue revision;
5. activate that revision atomically and retain the previous revision for rollback;
6. record release, actor, time, result, and document counts in the audit trail.

Axis retrieves only the active, permission-filtered Platform projection. It
renders a document only when the same functional-module gate used by the owning
route is active. Axis never reads Markdown files or package paths directly.

The executable upload/preview/activate API is the next implementation slice and
will share the initialization-run lifecycle rather than create a second import
control plane.
