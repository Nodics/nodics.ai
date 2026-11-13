# Predefined Circa Commerce Staff

Demo responsibilities are explicit release data, not acceptance-owned runtime
wiring. Role definitions remain Profile-owned. Actual Circa employee identity,
enterprise association and outlet selections remain customer/application data.
Neither release data nor setup selection grants deployment credentials, seller
consent, budgets, financial approval or qualification.

## Forward Explicit Release

`circa.ewaste:circaCommerceStaffAssignments` is a distinct sample-v001/0.0.1
REFERENCE release, PLATFORM, LOCAL and explicitly opted-in
LOCAL_PRODUCTION_SIMULATION demo classes only, EXPLICIT selection, RETAIN removal.
It does not admit real PRODUCTION or shared known passwords. Private-secret
provisioning, governance and installed qualification remain separate; portability
of these same release-backed instructions is not a completed production rollout.
It owns only its new `staff-access/headers` and `staff-access/records` files.
The existing operations, outlet-access and all Profile role packs remain
byte-identical; no installed receipt is rewritten and no Init is replayed.

| Existing employee | Enterprise | Added responsibilities |
| --- | --- | --- |
| circa-online-administrator | GREENPERKS_ONLINE | COMMERCE_SETUP_PUBLISHER, COMMERCE_AXIS_REFUND_REVIEWER |
| circa-retail-administrator | GREENPERKS_RETAIL | COMMERCE_SETUP_PUBLISHER, COMMERCE_COUPON_ISSUER |
| circa-repair-administrator | RENEWWORKS_REPAIR_REUSE | COMMERCE_SETUP_PUBLISHER, COMMERCE_COUPON_ISSUER |
| circa-recycling-administrator | LOOPCYCLE_RECYCLING | COMMERCE_SETUP_PUBLISHER, COMMERCE_COUPON_ISSUER |
| circa-retail-operator | GREENPERKS_RETAIL | MERCHANT_OPERATOR |
| circa-repair-operator | RENEWWORKS_REPAIR_REUSE | MERCHANT_OPERATOR |
| circa-recycling-operator | LOOPCYCLE_RECYCLING | MERCHANT_OPERATOR |

The publisher resolves to commerceSetupPublisherUserGroup plus the separately
released commercePublicationStarterUserGroup. The issuer adds only
commerceCouponIssuerUserGroup; merchants add only commerceMerchantUserGroup.
The marketplace does not receive coupon issuance. All assignments pin both
original employee code and loginId, exact enterprise, roleCodes and expected
groupCodes. Source data contains no credentials, employee snapshots, activation,
authVersion values, administrative groups, runtime grants or scope replacements.
Only the marketplace administrator adds commerceAxisRefundReviewerUserGroup,
whose canonical group supplies refund/return review and execution plus bounded
Axis shell/dashboard/bootstrap access, without administrator ancestry or Profile
assignment powers. It operates under the original GREENPERKS_ONLINE enterprise,
not a substituted customer session or foreign merchant authority.

## Required Fresh Preparation Order

These are separately required owner selections in the application's PLATFORM
BEFORE phase, not a claim that nImport invents cross-module dependencies from
file order. BackOffice owns the dependency-ordered preparation and Axis exposes
its exact stage projection. Customer applications do not add a second installer.

1. Normal Profile initialization prepares existing merchant/base group definitions.
2. Select the implementing owners' `product:accessGroups`,
   `publish:accessGroups`, `promotion:accessGroups` and `order:accessGroups`
   sections at their current manifest-pinned versions. These provide the
   setup-publisher, publication-starter, coupon-issuer and refund-reviewer
   contributions under Profile governance; no retired Profile core role pack
   is required.
3. Prepare Circa's existing operations sample 0.0.1 for the fresh demo employees,
   enterprise masters and original operational scopes.
4. Select circa.ewaste:circaMerchantOutletAccess sample 0.0.1, retaining the four
   exact DIRECT STORE ALLOW records for retail cafe/bistro, repair and recycling.
5. Select circa.ewaste:circaCommerceStaffAssignments sample 0.0.1 through the
   Profile-owned additive operation; then refresh affected original sessions.
6. Continue the separately governed publication, consent, budget and issuance
   stages under their original genuine enterprise operators.

The same predefined role/outlet selections are visible for an existing installed
demo, but installed CURRENT dependencies are not reimported. Select only missing
forward sections. Do not replay old employee/password data to adopt new roles.
Previously adopted groups are verified as current with no write or stamp bump.
Fresh setup must not require manual group wiring outside these owner selections.

## Required Profile Owner Operation

The immutable header invokes DefaultEmployeeService.addReferenceGroupsAll via
normal nImport's schema-service handoff. The Profile implementation and focused
governance/stamp/dispatch tests are present; its rebuilt runtime must be selected
before installation. Missing owner implementation is a blocker, never permission to fall
back to saveAll, direct database mutation or an acceptance-side role assignment.
The required operation contract is:

- Validate a bounded exact five-field instruction set: code, loginId,
  enterpriseCode, roleCodes, groupCodes. No arbitrary update body or credential
  fields; repeated identities and duplicate groups reject before writes.
- Resolve the selected roleCodes through Profile's current enterprise access
  persisted role vocabulary and require exact owner-declared groupCodes. No administrative
  role class, runtime-admin or administrator group may be added.
- Read every target through the generated Employee owner using fresh,
  non-recursive exact code/login lookup, rejecting missing/ambiguous/inactive,
  service or externally bound identities. Verify the retained enterprise
  association and its independently current active Enterprise master.
- Verify all required groups are active through the real group owner before
  any mutation. Complete the batch preflight before the first update.
- Preserve the exact original group ordering and append only missing reviewed
  group codes. Already-present assignments are no-ops, not replacements.
- Use normal generated Employee.update with a plain userGroups-only model and
  an exact code/login/current-groups CAS plus current security stamp (including
  an explicit absent-stamp predicate for legacy records). Never overwrite a
  concurrent group or credential edit, retry blindly or manufacture a stamp.
- Retain generated principal/group governance and security-stamp invalidation
  hooks. Require exact acknowledged single-match update and authoritative
  readback of the resulting union, original identity and credential reference.
- Return bounded code-only acknowledgements. Partial/uncertain outcomes fail;
  preserve installed import evidence and resume the original release only after
  owner inspection. Replays may verify an already completed group union without
  another effect. Never roll back a user's original groups to compensate.

This owner operation is not a public new API or a replacement authorization
system. nImport retains release selection, version/checksum history and import
authority; generated Profile mutations retain their normal administrative access.
Release data never enables onboarding or installed qualification flags.

## Validation

`node --test modules/circa.ewaste/test/circaCommerceStaffAssignments.test.js
modules/circa.ewaste/test/circaMerchantOutletAccess.test.js` checks exact source
identities, role composition, outlet joins, source hashes and absence of broad
permissions/credentials. Profile owns the additive operation's actual CAS,
governance, replay, denial and credential-preservation tests. Passing data tests
does not mean that missing runtime owner code or required setup stages are ready.
