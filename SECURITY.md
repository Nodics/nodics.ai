# Nodics Security Policy

Nodics is an enterprise framework. Security work must be treated as a product
contract, not a best-effort coding preference.

## Supported branches

Security fixes are maintained on `development` for active work and `master` for
released framework state. Customer release branches are supported only when a
commercial/support agreement defines that scope.

## Reporting vulnerabilities

Report vulnerabilities through the agreed Nodics support or security contact.
Do not publish exploit details before Nodics has triaged tenant impact,
enterprise scope, and remediation timing.

## Security boundaries

Every fix must preserve:

- tenant and enterprise scope;
- service-token versus human-token boundaries;
- generated-route authorization behavior;
- private media/data exposure controls;
- audit records for sensitive operations;
- module ownership, so one module does not silently bypass another module's
  policy.

## Validation expectations

Security changes must include focused tests, regression checks for generated
APIs, and release notes describing affected modules, data exposure risk, and
operator action.
