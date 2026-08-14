# nLocalization

`nLocalization` is the Core, stateless localization foundation. It owns canonical BCP 47 locale handling, immutable `LocalizationContext`, deterministic localization scope identities, and a provider-neutral client port.

It does not own translations, tenant/site locale policy, publishing, persistence, HTTP APIs, CMS content, product data, or Axis editing. Those belong to the active localization authority and the relevant domain modules.

The client deliberately supports only trusted in-process policy fallback. Runtime bundles fail closed until an authority provider is active. Applications customize the provider through `localization.client.providerService`; they do not fork this module.

Read `AGENTS.md`, `llm/contracts/README.md`, and the global localization contribution contract before changing this boundary.
