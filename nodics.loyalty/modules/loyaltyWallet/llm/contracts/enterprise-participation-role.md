# Enterprise Participation Capabilities

Explicit Init `loyaltyWallet:enterpriseParticipationAccess@0.0.1` defines internal
capability groups only, not a selectable profile or enterpriseRole. Existing
wallet-reader and transfer definitions remain unchanged. It defines parent-free `loyaltyEnterpriseSettingsUserGroup`,
whose only permission is existing `loyalty.transfers.manage`. The effective union
is wallet read, reward transfer, own-enterprise transfer settings and partner
conversion. Parent-free `loyaltyEnterprisePartnerConversionUserGroup` grants only
`loyalty.partnerConversion.read` and `loyalty.partnerConversion.execute`, whose
vocabulary is owned by the already pinned `transferPermissions` prerequisite.
Never compose `loyaltyParticipantCustomerUserGroup` into employee roles: it
inherits customer authority. Operators do not gain conversion automatically.

No sample/test credit, provisioning, earn, service settlement,
wildcard or platform administration is implied. Those independent capabilities
retain their separately approved roles and owner admission. Installation creates
missing definitions only, assigns nobody, and never initializes or funds wallets.

The same-type Init graph pins transfer vocabulary, wallet vocabulary and existing
participant definitions. Profile `ensureReferenceAll` preserves retained inactive
or narrowed records. Changed authority needs explicit governed reconciliation,
not import replay. Applications order these definitions before their Sample
assignments and use current persisted role/group unions with normal stamp hooks.
Do not introduce customer identities or role maps into framework configuration.
Use existing Admin for administrative tests. The agreed three-profile baseline
requires a reviewed mapping to actual existing profiles; never add task-specific
manager roles or silently alias Enterprise User to Operator. Capability groups
remain internal composition and do not assign themselves to employees.

Settings, transfers and conversions retain fresh original Profile permission/scope evidence,
Enterprise binding, DENY precedence, program/type eligibility, amount limits,
atomic persistence and accounting. A role is not transaction qualification or
funding. Conversion additionally retains provider qualification, program/type
eligibility and explicit simulated evidence; grants never imply external success.
`test/loyaltyEnterpriseRoleBaseline.test.js` checks exact source composition
through the participant owner, including absent permission, DENY and alias drift.
