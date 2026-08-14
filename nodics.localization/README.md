# nodics.localization

Standard protected functional-module group for the runtime localization authority. The group root is composition-only and extends `nodics.foundation`.

The active capability is split into two child boundaries:

- `localizationCore`: locale policy, translation aggregate, override protection, coverage/queue/analytics projections, translation memory/provider ports, import/export, and `nPublish` adapter ownership.
- `localizationApi`: audience-specific runtime bundles and secured BackOffice lifecycle/operations APIs.

CMS, Catalog/Product, and Communication continue to own their localized domain content. Axis is a management client, not translation authority.

Repository qualification runs through `npm run qualification:verify`.
Environment-specific production acceptance remains a separate release-authority
decision. Permanent operational and recovery guidance must remain module-owned;
tracked documentation never depends on a local planning workspace.
