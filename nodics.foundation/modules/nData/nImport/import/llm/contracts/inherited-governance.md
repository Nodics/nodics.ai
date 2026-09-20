# Inherited governance and selected profiles


nImport requires lifecycle metadata and destination enforcement by default.
Runtime role supplies the default destination; deployments retain environment
class and explicit legacy exceptions. An explicitly replaced empty destination
list denies imports.

`data.dataReleases.initializationProfileDefaults` supplies inert owner templates.
Deployment `initializationProfiles.<code>.template` selects one and may override
presentation or complete steps. Resolution occurs after layering. Unknown
templates fail; disabled profiles stay unavailable. The neutral `foundation`
template supplies Init then Core. Product owners contribute their own mechanics;
customers retain approved release selections and immutable version pins.
Templates never bypass discovery, permissions, lifecycle/destination validation
or completion receipts.

Use nConfig `replace`/`keyed` for scoped release contributions, package selections,
profile steps and nested release-code lists. Test empty, shorter and reordered
selections. Reuse the existing registry and importer.

## Content-pack defaults and manifest paths

`data.contentPacks.defaults` is the nImport-owned default object for every explicitly selected pack. `resolvePackContext` merges these defaults with the selected `packs.<code>` contribution without mutating nConfig. Environment, server and tenant configuration can override the defaults or individual pack fields through the established layers. Partial presentation/update-policy overrides preserve unrelated inherited values. Built-in pack selections must not repeat shared values that would mask a partner's default override.

Defaults select `LOCAL_PROJECT` and `data/manifest.json`, reject downgrades and stable same-version content changes, and provide all client presentation fields. The global `data.contentPacks.enabled` remains false until explicitly enabled; declaring a pack does not enable imports. Per-pack disablement still wins. Unknown pack codes remain unavailable.

For project-local packs, package metadata supplies the expected pack identity unless `manifestPack` is explicitly overridden. The selected `source.manifestSection` supplies the manifest section. Omitted `source.contentPath` comes from that section's `contentPath`, relative to the aggregate manifest directory. An explicit source content path retains its existing repository-relative meaning. Nonstandard source type, manifest path and section selections remain overridable. Missing paths, missing sections, path traversal, incompatible identity/contracts and invalid hashes fail before staging or persistence. This is resolution within the existing content-pack owner, not automatic pack installation or a new discovery registry.

Module-owned documentation data and existing administrative profiles own site/catalogue/navigation choices. Do not restore retired `backofficeCapabilities` payloads as a second authority. Tests should inspect the effective owner behavior and generated content references, not require redundant raw configuration fields.
