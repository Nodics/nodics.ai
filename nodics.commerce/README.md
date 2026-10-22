# Nodics Commerce

Nodics Commerce is the functional composition boundary for the
implemented Store, Product, Pricing, Tax, Promotion, Inventory, Cart,
Bidding, Checkout, Order, Payment, Fulfillment, and reverse-lifecycle capabilities.
Concrete child modules own business schemas and behavior; this source-free root
owns only functional identity, composition, declarative configuration,
shared presentation metadata, and stable cross-capability policy.

The reference runtime is `nodics.kickoff/kickoffLocal/commerceServer`.
Provider simulators are disabled by default in the framework, and local or
offline conformance is never a production-provider qualification claim.

For Platform runtimes that explicitly declare `nodics.commerce` as a discovery
root, Commerce contributes only the Product, Promotion and Order `accessGroups`
sections and Inventory `specialAccessRoles` section to the Platform data-release
catalogue. This source visibility does not activate Commerce modules, install the
releases, assign roles or grant operational authority.

Read `AGENTS.md`, the contracts and examples, generated context, canonical
Commerce documentation, and the release-readiness evidence before changes.
