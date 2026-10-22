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

## Verification

`test/profileParticipantDirectoryContract.test.js` isolates generated storage and
checks bounded search, canonical output, same-tenant Enterprise selection,
membership/identity drift and unavailable evidence. No runtime import, account
provisioning, user grant or live acceptance is implied by these fixtures.
