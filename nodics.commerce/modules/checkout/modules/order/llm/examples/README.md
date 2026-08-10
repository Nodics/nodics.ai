# Order examples

A customer starts cancellation, return, or refund from an owned order. An
operator acts through Order-owned secured routes. Fulfillment handles shipment
or RMA behavior, Inventory handles quantity and disposition, and Payment
handles refund execution and provider reconciliation.

If Payment fails after a return has been received and Inventory has recorded a
disposition, Order records a compensation-required checkpoint containing the
completed Fulfillment and Inventory references. An operator retries or repairs
through owner APIs; no generic Order service rewrites those domain records.
