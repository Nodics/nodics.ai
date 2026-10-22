# Axis Employee Purchase Limit

The existing Enterprise business-access employee dialog embeds
`EnterpriseSpendControl`, not a new route, role designer or wallet policy owner.
Its selected employee loginId is the Checkout `actorCode`. Currency/reward code
has no browser default. Read uses POST `/checkout/enterprise-spending/read` with
only actorCode and currency; update sends those selectors, exact string-or-null
perPurchaseLimit and the owner-returned expectedRevision. Original human token,
fresh Profile scopes and `commerce.checkout.spend.manage` remain mandatory.

Only the discovered CheckoutCore connection is used; Profile instance selectors
are not reused for Checkout. CMS context comes from the existing Axis composition.
The optional `enterpriseSpendWorkspace` release supplies localized text through
the existing Axis Site/template at the copy-delivery path
`/commerce/enterprise-spending`. It grants no navigation or command authority.

The sole framework default remains `checkoutCore.participantSpend.perPurchaseLimit`
in config/properties.js. Null is an explicit no-additional-actor-limit selection;
framework ceilings still apply. Axis initializes controls only from the owner
read, never invents a limit, and cannot edit Profile roles or Loyalty balances.

Review freezes exact selectors/value/revision. Save requires owner acknowledgement
and a matching fresh read. Uncertainty prevents close/new writes until inspection;
unchanged revision permits only an explicit same-selection retry, and a changed
revision is reconciled or reported as conflict. Context replacement retires late
results. There is no automatic retry or offline queue.

The explicit optional access-group/role releases expose the existing Profile
business-area contract: `purchaseLimits`, ENTERPRISE, Full control only. The
group includes only `profile.scope.read` and `commerce.checkout.spend.manage`,
with no parent groups or assignments. Role and permission prerequisites are
checksum-pinned. Existing catalogue imports preserve installed decisions;
employees obtain nothing until an authorized governed assignment occurs later.

Unit evidence: `test/enterpriseSpendWorkspace.test.js`,
`test/commerceParticipantSpendContract.test.js`, and Axis
`test/enterprise/enterpriseSpendControl.test.tsx`. No installation, grants,
runtime requests, limit changes or monetary operations were performed.
