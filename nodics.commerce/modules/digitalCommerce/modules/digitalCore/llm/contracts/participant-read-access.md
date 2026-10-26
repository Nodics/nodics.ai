# Enterprise Participant Reader

`digitalCore:participantReadAccess` version `0.0.1` is an explicit Platform
Init release from `init-v001`. It inserts missing Profile user-group and
Enterprise-role definitions using `ensureReferenceAll`; existing definitions
remain governed and are never widened on replay.

`COMMERCE_OWN_ENTITLEMENT_READER` composes only `commerceOwnEntitlementReaderUserGroup`, whose sole permission is
`commerce.digital.own.read` and whose parentGroups is empty. Installing definitions
assigns nobody. An existing human must retain employee route admission and current
Profile Enterprise scope. This role grants no create, transfer, funding, checkout,
refund, claim, reveal, administration or publication authority.

Use Profile's existing governed assignment operations. Reference deployments may
select a credential-free exact employee/Enterprise instruction through
`addReferenceGroupsAll`; Profile resolves the exact persisted role/group union,
preserves unrelated groups and credentials, and invalidates the security stamp.
Fresh sign-in is required afterwards. Never add customer/service groups to an
employee or interpret a role as an ownership/scope bypass.

Run `node --test test/participantReadAccess.test.js` from this owner. Live
installation must retain the exact nImport release receipt and security-stamp
evidence separately from source tests.
