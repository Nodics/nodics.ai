# loyaltyReservation Contracts

Reservations hold reward amounts for downstream operations without owning Commerce checkout or coupon purchase flows.

## Owner-Protected Holds

`holdPolicy: EXTERNAL_OUTCOME` retains the conversion owner's private admission
and absent expiry semantics unchanged. `holdPolicy: AUCTION_ROUND` belongs to
`DefaultLoyaltyAuctionFundsService`, uses `expiresAt: null` and cannot expire by
the ordinary reservation TTL. Generic reserve/capture/release/reverse and a
forged plain-object token cannot mutate an auction hold.

Auction adjustments retain the original reservation code and change only the
balance delta, with one append-only ledger entry for nonzero changes. Balance,
ledger, reservation and `metadata.auction.commands` receipts commit together
through canonical transaction composition. The same key with changed terms
fails; uncertain writes never become successful acknowledgements.

The metadata retains canonical `ownerRef`, `publicationCode` and exact command
fingerprints/results. It is not customer-controlled lifecycle state. Generic
schema operational access remains governed; public participants use the owner
API, never generated reservation CRUD. Winner disposition also needs Checkout's
terminal fence. See
[auction funds](../../../loyaltyWallet/llm/contracts/auction-funds.md).
