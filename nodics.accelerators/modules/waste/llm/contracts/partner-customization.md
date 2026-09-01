# Partner Customization Contract

Partner projects customize Waste by contributing later-loaded data into
`nodics.waste` schemas. They must not edit `nodics.waste`, the Waste accelerator
umbrella, or scenario accelerators such as `eWaste`.

Allowed project contributions:

- Add new family, category, item type, material type, condition, and evidence
  policy records.
- Add or override collection point type, collection preset, receipt policy,
  verification policy, and acceptance rule records.
- Add impact metric and impact profile records for project-specific estimates
  or externally validated calculations.
- Add project-owned integrations, map providers, reward policies, vendor
  adapters, and operational journeys in the project layer, referenced through
  Waste source refs or project metadata where needed.
- Activate, extend, or override reusable asset-transfer, marketplace-eligibility,
  reward/carbon settlement, and coupon-redemption settlement policy records when
  a partner project needs different business behavior.

Contribution rules:

- Use data manifests with `kind: "DATA_RELEASE"` and `destinationRole: "WASTE"`.
- Use import headers that target `nodics.waste` schema names and `saveAll`
  operations keyed by `code`.
- Use a new code to extend accelerator presets; reuse a code only when the
  project intentionally owns a later-loaded override.
- Do not scope Waste data rows by `tenant`, `tenantCode`, or `enterpriseCode`;
  runtime tenant and schema selection belongs to the authenticated context.
- Do not place reward formulas, coupon behavior, map-provider secrets, vendor
  integrations, recycler adapters, or logistics adapters inside accelerator
  reference data.
- Do not make transfer behavior code-driven. Sale, gift, donation, redemption,
  coupon purchase, reward consumption, and carbon-credit transfer behavior must
  resolve from schema-backed policy records that Axis BackOffice can manage.

Project overlay example:

- `partnerWasteCategoryData` can add `SMART_HOME_DEVICE` or intentionally
  override `MOBILE_DEVICE` by reusing the same `code`.
- `partnerWasteCollectionPresetData` can add `PARTNER_MALL_DROP_OFF` or
  intentionally override `EWASTE_DROP_OFF_STANDARD` by reusing the same `code`.
- Reward, map, vendor, recycler, and logistics behavior must remain in
  project-owned modules or integrations and reference Waste records only by
  source reference or code.
- Coupon purchase should consume or reserve wallet rewards through
  Loyalty/Wallet, transfer carbon credits according to policy, and create a
  Promotion/Coupon-owned customer coupon entitlement. Waste should only provide
  the approved asset, evidence, impact origin, and policy references.

Layer order:

1. `nodics.waste` defines reusable schemas, lifecycles, services, APIs, and
   data-contribution policy.
2. `nodics.accelerators/modules/waste` groups scenario accelerators.
3. Scenario accelerators such as `eWaste` provide initial reference and preset
   data.
4. Partner projects contribute later-loaded project data and integrations.

Reference implementation:

- `eWaste:core-reference` is the first scenario accelerator data release.
- `kickoffWaste:project-reference` is the Kickoff project overlay release.
- The current Nodics data importer supports `init`, `core`, and `sample`
  release data types, so the Kickoff overlay is installed through a `core`
  source root while remaining project-owned by module name, layer kind,
  release code, manifest section, and contribution policy.
- Runtime profiles should install scenario accelerator releases first and
  project overlay releases second, so intentional project overrides win by
  code without editing accelerator data.
