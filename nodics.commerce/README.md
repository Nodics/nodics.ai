# Nodics Commerce

Nodics Commerce is the functional composition boundary for the
implemented Store, Product, Pricing, Tax, Promotion, Inventory, Cart,
Checkout, Order, Payment, Fulfillment, and reverse-lifecycle capabilities.
Concrete child modules own business schemas and behavior; this source-free root
owns only functional identity, composition, declarative configuration,
shared presentation metadata, and stable cross-capability policy.

The reference runtime is `nodics.kickoff/kickoffLocal/commerceServer`.
Provider simulators are disabled by default in the framework, and local or
offline conformance is never a production-provider qualification claim.

Read `AGENTS.md`, the contracts and examples, generated context, canonical
Commerce documentation, and the release-readiness evidence before changes.
