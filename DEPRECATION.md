# Nodics Deprecation Policy

Deprecation must be explicit, documented, and kind to customers.

Every deprecation must include:

- the deprecated API, service, data shape, property, or behavior;
- the replacement path;
- migration steps;
- compatibility shims when practical;
- the removal target version or date;
- tests proving old behavior still works until removal.

Compatibility shims must be temporary compatibility shim code with clear owner,
expiry, and validation. Do not leave silent aliases that become permanent second
authorities.
