# mongodb AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDatabase/mongodb` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Default names and isolated deployments

An unchanged Local environment declares no `database` override: MongoDB supplies
`masterLocal` for normal connections and `testLocal` for test connections.
A server needing isolation overrides only its name:

```js
module.exports = {
  database: { default: { mongodb: { master: { databaseName: 'warehouseLocal' } } } }
};
```

This preserves the inherited URI/options and the separate test database. Keep
Staged/Online and tenant-specific names distinct. Configuration does not migrate
an existing database; data movement is a separate governed operation.
