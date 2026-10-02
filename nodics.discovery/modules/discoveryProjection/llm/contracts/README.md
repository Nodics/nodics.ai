# discoveryProjection Contracts

`discoveryProjection` owns the generic Discovery document projection shape and validation helpers.

Implicit model lookup uses the schema's logical `typeName`, with its legacy
`indexName` fallback. A deployment may customize the physical provider index
through nSearch's layered index definitions; do not pass that physical name to the
logical model registry or add a second registry. Explicit logical request
selectors and tenant/module validation remain authoritative.
