# Circa eWaste Contracts

`circa.eWaste` is the backend application composition for Nodics Circa eWaste.

It must:

- depend on `eWaste` for reusable e-waste presets;
- depend on `wasteRecycling` for provider-neutral recycler/logistics handoff;
- consume `nodics.waste` API operations for submissions, approved assets,
  marketplace projection, sale, gift, donation, and coupon redemption;
- expose reusable journey metadata for the frontend module
  `nodics.circa.eWaste`;
- preserve source references to Profile, Media, Location, Wallet/Loyalty,
  Commerce/Product, Promotion/Coupon, Movement, and Compliance owners.

It must not:

- define persistence schemas or generated CRUD routers;
- mutate wallet balances or ledger entries;
- create Commerce/Product catalog, bid, order, payment, or pricing records;
- create coupon codes, coupon tokens, entitlements, or POS claim records;
- store provider credentials, adapter implementations, tracking numbers, or
  certificate numbers;
- contain partner-specific branding, rewards, campaign policy, or provider
  configuration.

Partner projects should extend this module with project-specific journeys and
provider binding while preserving the reusable framework and accelerator
contracts underneath.
