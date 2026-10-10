# elastic AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nSearch/elastic` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Local Offline Reset

The orchestration owner supplies a source-resolved configuration and reviewed
exact names only after independent Local outage/process/socket qualification.
Read-only inspection is suitable for repeated outage checks and never deletes:

```js
const held = await SERVICE.DefaultElasticSearchEngineConnectionHandlerService
    .openLocalResetMaintenance({
        environment,
        configuration: effectiveSearchConfiguration,
        indices: reviewedPhysicalNames,
        exclusiveDeployment: true,
        writersExcluded: true,
    });
try {
    const evidence = await held.inspect();
    // The caller compares evidence.provider with independently observed Java PID and sockets.
    return evidence;
} finally {
    await held.close();
}
```

Mutation orchestration uses the same hold only after successful inspection and
fresh caller outage checks. For each selected name call `held.drop(name)` once;
retain `alreadyAbsent` separately from acknowledged deletions. A caught error
with `acknowledged: true` and the exact attempted `index` retains that count but
does not prove absence. Stop and report uncertainty. Once all targets verify
empty, the orchestration owner invokes its search-cache invalidation callback.

A later module can contribute the same service filename beneath `src/service`
with mergeable exported methods. The connection delegate resolves the effective
`SERVICE.DefaultElasticLocalResetMaintenanceService`; no new registry or loader
is needed. Fixture tests can merge `{ createClient: () => fixtureClient }` onto
the provider export. Never accept that adapter through real command input.
Preserve the full exact-name/UUID/native-identity contract in any replacement.

Run `node --test nodics.foundation/modules/nSearch/elastic/test/elasticLocalResetMaintenanceContract.test.js`
for successful, absent, drift, alias, malformed evidence, timeout, acknowledgement
loss and cleanup cases without network access. Live qualification is separate.

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
