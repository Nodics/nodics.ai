# Enterprise Participant Transactions

Explicit Init section `bidding:participantTransactionAccess` version `0.0.1`
from `init-v001` contributes `COMMERCE_BID_PARTICIPANT` and
`commerceBidParticipantUserGroup` through Profile's insert-preserve `ensureReferenceAll`.
The exact permissions are `commerce.bid.participate`.
No parent group, customer identity, scope, wallet or funding is supplied.

Installation assigns nobody. Verify exact persisted role/group definitions before
Profile's governed assignment. Existing mismatched definitions require owner
reconciliation, never widening. Optional reference assignments use
`addReferenceGroupsAll`, preserve unrelated groups and invalidate the security
stamp. Fresh sign-in is required. Existing business, financial, simulation and
owner qualification gates still apply. Use explicit version/checksum preflight
and retain the nImport receipt; skip CURRENT releases rather than replaying them.
