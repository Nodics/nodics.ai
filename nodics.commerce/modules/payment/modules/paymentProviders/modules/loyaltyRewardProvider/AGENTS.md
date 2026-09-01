# Loyalty Reward Provider Agent Contract

This module is a Commerce Payment provider adapter. It translates Commerce payment operations into Loyalty module calls, but it does not own Loyalty wallet, reward, ledger, reservation, redemption, coupon, product, cart, or order data.

- Keep reward wallet movement in `nodics.loyalty`.
- Keep coupon purchase and order orchestration in Commerce.
- Use `DefaultModuleService.invokeModule` for Loyalty calls so the target can run locally or in a separate cluster.
- Keep provider coordinates and target authority configurable through `config/properties.js`.
