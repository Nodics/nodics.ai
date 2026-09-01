# Digital Commerce Agents

Digital Commerce adapts normal Commerce checkout for digital products. It must not own product catalog, price, payment, order, or promotion source data.

- Product remains the sellable catalog authority.
- Promotion remains the coupon, promotion, discount, and redemption authority.
- Checkout remains the placement, idempotency, and compensation authority.
- Digital Commerce may classify digital availability, reserve digital units at checkout time, and coordinate delivery evidence with the owning modules.
- Tenant is runtime/config/schema context only. Business ownership is enterprise-scoped by the owning records and request context.
