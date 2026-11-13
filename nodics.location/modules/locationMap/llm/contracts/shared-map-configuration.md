# Shared map configuration

Location Map resolves each map usage in the trusted runtime tenant. An empty
repository returns an active, tokenless OSM HOT tile descriptor from framework
configuration. Core supplies reusable references. There is no provider Init pack.

Resolution applies these layers in order. Each later layer overrides earlier fields.

1. `locationMapConfiguration.defaultSelection` and the selected provider's `providerDefaults`.
2. `projectOverrides[usageCode]` and the tenant's saved SHARED configuration.
3. `applicationOverrides[surfaceCode][usageCode]` and the saved application configuration.

Changing provider starts with that provider's style and clears the previous
provider's token. Use a partial source override for fields that must continue
to inherit, such as Circa's Dubai viewport. Axis saves a complete configuration
for the chosen scope. Omit surfaceCode or request SHARED for the project view.
Application rows use APP:AXIS or APP:CIRCA internally.
FALLBACK rows are alternatives. Ambiguous primary selections fail.

## Operator behavior

Use Axis **System Configuration → Map Configuration** to select the provider,
style, public token, viewport, controls, category labels/colors/matching terms,
and wheel mode, step, cooldown and animation. Saves use the existing secured
Location route with `system.schema.manage`. The generated repository
owns atomic revision increments; clients send `expectedRevision` from the form.
A stale form must reload before editing again.

Mapbox requires a valid public `pk.` token and active setup status. `sk.` tokens
are rejected. Provider selection alone does not activate incomplete setup. The
server computes `configured` and `fallbackAllowed`; clients must honor both.
Inactive/invalid/archived configuration cannot silently enable a fallback. An
allowed provider failure keeps the centre list usable and reports the fallback.

## Consumer contract

- Authenticated applications read `/location/maps/configurations/effective`.
- Anonymous applications read `/location/maps/configurations/public`; only
  allowlisted public usages and surfaces are exposed. This endpoint cannot
  write and never returns internal metadata, token references or credentials.
- Responses carry `contractVersion: 1`, stable `code`, `revision`,
  `refreshIntervalMs`, render descriptors, viewport, controls, `presentation`
  and `interaction`. Refresh visible views at the supplied interval and on focus.
- Use `MAPBOX_GL` or `XYZ_TILE` adapters for the supplied renderer descriptor.
  Do not embed alternate provider URLs or an independent configuration store.
- Presentation contains at most twelve unique categories. Labels are text,
  colors are six-digit hex values, matching terms are bounded text. Match
  non-default categories in order against type, capabilities and display name;
  use `defaultCategoryCode` otherwise. Never evaluate configuration as code.
- `MODIFIER` wheel mode uses Command on macOS and Control/Command elsewhere.
  The first valid wheel event starts zoom immediately; subsequent events obey
  the configured cooldown. `FREE` allows wheel zoom; `DISABLED` leaves wheel
  events untouched. Ordinary scrolling remains available in modifier mode.

Collection-centre records and visibility remain owned by their domain APIs;
map configuration never grants access to private collection or Location data.
Business coordinates remain named `latitude` and `longitude`; conversion to
provider arrays occurs only inside renderer adapters.

## Customization and verification

A later module may override `locationMapConfiguration` defaults and public usage
allowlist through normal Nodics configuration layering. Prefer editing the
existing shared record through Axis for live operator changes. New applications
implement the versioned consumer contract; they do not seed per-application
primary rows. A new renderer is an allowlisted local adapter consuming a safe
provider descriptor, never executable backend content.

Run `node --test nodics.location/modules/locationMap/test/*.test.js` from the
framework root. Coverage includes coordinate ordering, provider fallback,
exact scope selection, shared public/authenticated reads, declarative customization,
stale edits, duplicate primaries and private usage denial. Browser acceptance
must change a label/color in Axis, observe another open application refresh,
restore the original values, and check filters, wheel behavior and mobile layout.
