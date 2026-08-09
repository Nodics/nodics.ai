# Nodics Compatibility Contract

Nodics protects customers by treating compatibility as an architecture concern.

Compatibility review is required for changes that affect:

- generated CRUD behavior;
- OpenAPI output;
- route paths, request payloads, or response payloads;
- startup graph resolution;
- module identity, module registration, or runtime availability;
- customer modules and custom-module override points;
- initializer data, sample data, or import release manifests.

When compatibility cannot be preserved directly, provide a temporary compatibility shim,
migration steps, tests, and release notes.
