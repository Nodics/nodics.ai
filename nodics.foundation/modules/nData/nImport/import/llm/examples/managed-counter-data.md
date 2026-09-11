# Portable managed-counter data

Owner: `nodics.foundation` / `nImport/import`.

Keep existing `data/core-v001/headers` and `records` conventions. A header for an
explicitly managed schema uses `saveAll` and a stable query such as
`{ code: '$code' }`. Record files omit technical revisions:

```js
module.exports = {
    record0: {
        code: 'project-web-pos', tenant: 'default', storeCode: 'project-store',
        name: 'Web service point', status: 'ACTIVE', timezone: 'UTC', active: true
    }
};
```

Supply all effective project-required business fields. nImport captures the
original token through generated reads; generated CRUD owns the increment.
Same-request retries retain their snapshots. A new run is a deliberate operation
under existing release policy, not a way to hide a failed concurrency check.
Business versions and immutable release checks remain intact. Other managed
import operations fail explicitly. See canonical Foundation import documentation
and `nDatabase/database/test/modelConcurrencyContract.test.js` for examples and
customization/recovery tests.
