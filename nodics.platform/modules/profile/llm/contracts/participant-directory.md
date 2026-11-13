# Existing Participant Directory

Profile owns typed recipient discovery for gifts and reward transfers. This
directory does not create accounts, grant employee permissions, choose wallets
or authorize transactions. Commerce and Loyalty revalidate each selected owner
and enforce their independent eligibility and participation policies.

## Commands

`POST /participants/search` accepts only `{ownerType, search}`. `ownerType` is
`CUSTOMER` or `ENTERPRISE`; search is a bounded display-name prefix or exact owner
code. The result is `{contractVersion:1, tenant, items}`. Each item contains only
`ownerType`, `ownerCode` and `displayName`. Name plus code disambiguates equal
names without disclosing contacts, account data or balances.

`POST /participants/resolve` accepts only `{ownerType, ownerCode}` and returns
`{contractVersion:1, tenant, recipient}`; recipient is null when no eligible exact
record exists. Missing, duplicate, inactive or foreign evidence never becomes a
new identity. A search result is not enduring transaction authority.

Both routes require original Customer or Employee access identity, private
request handling and fresh native membership checks before and after reads.
Customer reads stay in the signed tenant; Enterprise registry reads use Profile's
authority partition and filter by the signed tenant. No generic query operators,
caller tenant, role flags or public service impersonation are accepted.
The controller preserves the original body, payload and HTTP body rather than
choosing one over a contradiction. Scope/header aliases, selectors and effective
policy stay pinned across reads. Identity/storage failures expose only the
existing `ERR_AUTH_00003`, never private dependency diagnostics.

## Configuration And Consumers

`profileParticipantDirectory` is defined entirely in Profile's framework
`config/properties.js`: enabled true, minimum search length 3, maximum search
length 100 and maximum results 20. Customer/runtime files contain only intended
overrides. Disabling discovery does not cancel an already accepted gift or reverse
a completed transfer.

Consumers select an exact result, show recipient and amount/contents for explicit
confirmation, and send the typed owner reference to the relevant capability.
Names are display information, never identity keys. Private UI state must not
survive a signed owner/session change. New-customer invitation or registration
is outside this directory and the current gifting scope.

## Axis Customer Directory

The same existing private search also supports read-only name/reference lookup
from Profile's admitted Customer Workspace, Customers and Profiles, and Customers
aliases. `buildCustomerWorkspace` publishes the generic backend-operations listing
with fixed hidden `ownerType: CUSTOMER`, required bounded search, display-name and
reference columns, and the OPERATIONAL Profile owner selector. It contributes no
generic identity CRUD, contacts, account activity, balance or transaction controls.
Disabled directory policy or an absent implementing owner disables the aliases.
Invalid presentation never produces an executable placeholder.

`profileParticipantDirectory.customerWorkspacePresentation` owns titles, labels
and explanatory copy. Search limits are derived from the same effective directory
policy; do not duplicate them in Axis or a customer index. The description's
`{minimumSearchLength}` and `{maximumResults}` placeholders are inert owner-side
substitution. Later modules may change copy or narrow existing bounds while
preserving the fixed API projection and all independent actor/tenant checks.

Axis waits for valid required filters, renders field-local minimum-length errors,
and distinguishes untouched, loading, empty, denied and failed reads. Repeated
valid search is a read, never account creation or recipient selection authority.
Private results retire on actor, scope, source or metadata changes. A maximum-size
result means refine the prefix; there is no fabricated total or client pagination.
Run `test/profileCustomerDirectoryWorkspace.test.js` with the existing directory
privacy tests and BackOffice API/field contract tests. Native acceptance must
verify a real existing match, empty and denied reads and a narrow layout.

## Verification

`test/profileParticipantDirectoryContract.test.js` isolates generated storage and
checks bounded search, canonical output, same-tenant Enterprise selection,
membership/identity drift and unavailable evidence. No runtime import, account
provisioning, user grant or live acceptance is implied by these fixtures.
