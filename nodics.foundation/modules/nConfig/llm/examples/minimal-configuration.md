# Declare the smallest supported difference

An already active Product capability supplies its catalogue defaults. A custom
server that needs a larger candidate budget declares only the changed budget:

```js
module.exports = {
    product: { discovery: { catalogue: { maximumCandidates: 800 } } }
};
```

This is a tuning example, not a new server's complete topology. Preserve its
existing module selection, port, database and required deployment inputs.
`readPageSize` and other Product values remain inherited. Verify the prepared
configuration before tuning production traffic; a larger budget may increase
query cost.

For shared customer defaults, select the owning customer module explicitly and
place its index before the environment/server overrides. A later node may
change the budget again without copying the rest of the server properties.
Do not add a helper loader. Arrays retain the existing Lodash merge semantics;
`{ values: [] }` is not a general removal operation.

For a keyed provider selection, disable only the inherited entry:

```js
module.exports = {
    database: { default: { mongodb: { options: {
        schemaProperties: { pattern: false }
    } } } }
};
```

This intentionally disables MongoDB pattern projection; use it only when the
application supplies the required validation through its governed schema policy.
Other keyword selections remain inherited.
