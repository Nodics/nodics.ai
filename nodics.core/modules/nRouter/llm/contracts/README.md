# nRouter AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.core/modules/nRouter`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Configurable route permissions

- Prefer `permissionConfig` for route action permissions that projects,
  environments, servers, nodes, or tenants may customize.
- `permissionConfig` values must resolve through layered `properties.js` or
  runtime governance. Literal `permission` values are acceptable only for
  non-negotiable platform constants.
- Tests for secured routes should assert the configuration path when a route
  uses configurable permission metadata.

## Token-type boundaries

- Use `authTokenTypes: ['service']` for module-to-module routes that must reject
  human access tokens and API-key identities.
- Token-type acceptance is enforced independently from access groups and
  permissions; do not use a permission grant as a substitute for token type.
- Leave `authTokenTypes` absent only when the route intentionally supports the
  normal authenticated credential types.

## HTTP boundary defaults

- Keep CORS closed in framework defaults and declare exact browser origins in
  the environment/server layer. Never use wildcard origins with credentials.
- Because layered origin arrays may merge, use server-layer `deniedOrigins` to
  subtract inherited origins. Explicit denial always takes precedence.
- Default API responses to the standard CSP/clickjacking/nosniff/referrer
  headers and `Cache-Control: no-store`; a capability may replace caching only
  through an explicit response contract.
- Keep JSON parsing strict and bounded. Larger route-specific payloads require
  a named body-parser handler and a configured maximum.
- Internal module routes require service-token metadata even when browser CORS
  would already block a caller; origin policy is not authentication.
