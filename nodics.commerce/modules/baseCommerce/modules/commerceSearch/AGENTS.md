# Commerce Search Agent Contract

- Follow `../../AGENTS.md`.
- Keep this group module composition-only. Business behavior belongs in concrete child modules.
- Commerce Search owns Product/Commerce-specific search rules such as boost, bury, pin, redirects, and future Product facet/ranking policy.
- Generic Discovery configuration and ranking mechanics belong to `nodics.discovery`.
- Do not move Product truth, low-level search infrastructure, Pricing, Inventory, Checkout, Payment, or Fulfillment authority into this module family.
