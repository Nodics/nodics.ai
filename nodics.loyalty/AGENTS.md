# nodics.loyalty

## Ownership

`nodics.loyalty` is the standard Loyalty functional module group. It owns loyalty composition and framework contracts for programs, reward types, wallets, reward balances, append-only ledger entries, reservations, and redemptions.

The group root is composition-only. Put runtime source, schema, services, tests, and data in child capability modules.

## Boundaries

- Do not store tenant or enterprise ownership as ordinary wallet data. Runtime tenant/schema selection comes from the authenticated customer/admin/employee token context.
- Wallet ownership is represented by `ownerType` and `ownerCode` so a wallet can belong to a customer, employee, enterprise, partner, or system actor.
- Do not put Commerce coupon purchase behavior in Loyalty. Commerce payment providers may call Loyalty reserve/capture/release APIs, but Commerce owns product, coupon, order, and payment orchestration.
- Reward movement history is append-only. Corrections must be represented by reversal ledger entries rather than historical edits.
- Keep project-specific earning, spending, and expiry policies configurable through customer/project extension modules.

## Validation

Run `npm test` from this directory after changing Loyalty contracts.
