# Nodics Versioning

Nodics uses semantic versioning principles at framework and module boundaries.

## Major changes

Major changes may alter runtime contracts, generated CRUD behavior, API shapes,
extension points, or custom-module override contracts. They require migration
guidance and compatibility review.

## Minor changes

Minor changes add backward-compatible modules, APIs, configuration options,
services, documentation, or Axis-visible capabilities.

## Patch changes

Patch changes fix defects, tighten validation, improve documentation, or adjust
non-breaking behavior.

## Module versions

Module versions must reflect the contract owned by that module. Customer modules
may extend framework modules, but the functional module identity remains the
framework capability unless the customer is creating a genuinely new capability.
