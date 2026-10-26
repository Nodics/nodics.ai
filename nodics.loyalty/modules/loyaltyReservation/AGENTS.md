# loyaltyReservation

Own the private immutable rewardReservationDecision schema alongside reservations.
Wallet's [decision contract](../loyaltyWallet/llm/contracts/reservation-decisions.md)
requires one transaction for authorization/accounting, installed unique identity,
and no generic CRUD. CANCELLED/noEffects:false fences unknown history without
claiming cleanup authority. Do not add a second wallet or decision store.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Own reward reservation contracts. Reservations are used by downstream payment flows before reward capture; they do not own Commerce checkout or coupon purchase orchestration.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.

Decision status/binding remain immutable. Wallet may CAS-append the optional
reconciliation proof and exact intent to CANCELLED/noEffects:false only through
its atomic complete-accounting contract. Never expose generated CRUD or allow a
caller to supply proof. AUTHORIZED/DENIED decisions cannot take that transition.

Protected auction reservations persist expiresAt:null. Keep the schema BSON union
['date','null']; ordinary holds still use dates and EXTERNAL_OUTCOME may omit it.
Optional is not nullable. Wallet's private hold admission remains mandatory; this
schema declaration grants no caller protected-hold authority. Preserve the real
save-initializer/BSON regression in loyaltyWallet/test/loyaltyAuctionFunds.test.js.
