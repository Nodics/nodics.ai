# nDynamo AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDynamo` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Governance Report Invocation

Framework repository (uses the retained tooling-only build composition):

```sh
npm run governance:report
```

Selected application server, from its project checkout:

```sh
npm exec -- nodics governance:report --env <environment> --server <server>
npm exec -- nodics governance:report --environment=<environment> --server=<server> --node=<node>
```

The report is written to the selected server's
`generated/governance/<node-or-server>.governance-report.json`. Generation does
not start the application or qualify a live deployment. Validate both root modes
and failure cleanup with:

```sh
node --test nodics.foundation/modules/nDynamo/test/governanceReportMaturityMatrix.test.js
```
