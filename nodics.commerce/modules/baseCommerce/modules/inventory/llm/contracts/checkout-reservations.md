# Checkout Reservations

`DefaultInventoryReservationOperationService` owns physical stock acquisition and
compensation. Checkout supplies its trusted calculated warehouse/SKU candidates,
signed buyer context, original Order identity and idempotency keys. Cart reads do
not reserve. Digital coupon pools remain Promotion-owned and skip this path.

The owner validates the signed customer and Checkout permission, actual installed
unique identities and side-effect-safe database transaction capability. Each
physical acquisition compares the observed balance revision, subtracts available
quantity, increases reserved quantity, inserts one original hold and appends its
RESERVE movement in the same transaction. Multiple entries commit together or
roll back together. On-hand stock is unchanged until the fulfillment owner ships.
Readback verifies all intended business fields exactly; generated persistence
owns the `created` and `updated` timestamps, which are not equality tokens.

Original command replay verifies hold, movement and balance identity without
requiring unchanged live quantities. Conflicting buyers, quantities, Orders,
SKUs, failed reads and lost revisions do not qualify as successful acquisition.
An unknown commit acknowledgement is accepted only when all original owner
evidence is independently readable. Otherwise confirmed acquisitions are carried
to compensation and uncertainty remains `COMPENSATION_REQUIRED`.

Compensation uses the Inventory owner to atomically release the original hold,
restore available/reserved quantities and append RELEASE movement evidence.
Repeated release has no additional stock effect. Missing acquisitions do not
increase stock. Legacy reservation-only records are preserved, but absence of
their balance/movement proof refuses release; no stock reconstruction is inferred.

The isolated rollback-capable tests exercise the real Inventory and Checkout
owners. Native transaction, checkout and replay evidence remains a separate gate.
