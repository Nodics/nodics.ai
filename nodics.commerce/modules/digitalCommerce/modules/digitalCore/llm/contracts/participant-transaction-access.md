# Enterprise Participant Transactions

Explicit Init section `digitalCore:participantTransactionAccess` version `0.0.1`
from `init-v001` contributes `COMMERCE_OWN_DIGITAL_PARTICIPANT` and
`commerceOwnDigitalParticipantUserGroup` through Profile's insert-preserve `ensureReferenceAll`.
The exact permissions are `commerce.digital.own.reveal`, `commerce.digital.bundle.manage`.
No parent group, customer identity, scope, wallet or funding is supplied.

Installation assigns nobody. Verify exact persisted role/group definitions before
Profile's governed assignment. Existing mismatched definitions require owner
reconciliation, never widening. Optional reference assignments use
`addReferenceGroupsAll`, preserve unrelated groups and invalidate the security
stamp. Fresh sign-in is required. Existing business, financial, simulation and
owner qualification gates still apply. Use explicit version/checksum preflight
and retain the nImport receipt; skip CURRENT releases rather than replaying them.

## Permission prerequisites

The `participantTransactionAccess` Init release pins `permissionCatalogue` and
`bundleParticipantPermissions` before its group and role definitions. Fresh
installation therefore installs the exact vocabulary required by both reveal
and bundle management before Profile validates their references. Selecting these
definitions creates no staff assignment or runtime activation.
