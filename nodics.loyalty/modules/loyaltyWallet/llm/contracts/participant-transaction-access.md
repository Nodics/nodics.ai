# Enterprise Participant Transactions

Explicit Init section `loyaltyWallet:participantTransactionAccess` version `0.0.1`
from `init-v001` contributes `LOYALTY_REWARD_TRANSFER_PARTICIPANT` and
`loyaltyRewardTransferParticipantUserGroup` through Profile's insert-preserve `ensureReferenceAll`.
The exact permissions are `loyalty.rewards.transfer`.
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
`transferPermissions` before its group and role definitions. Fresh installation
therefore installs the transfer vocabulary before Profile validates references.
Definition installation does not assign staff, enable transfers or qualify funding.
