# Managed master-data edits

Owner: `nodics.foundation` / `nDatabase/database`.

Use effective `backoffice.concurrency: { field: 'revision', managed: true }`
only for a non-versioned schema whose technical counter belongs to generated
CRUD. Declare an integer/long counter, audit every existing writer and keep the
generated permission, ownership and reference checks. Do not configure a second
registry. Store's three master-data schemas provide the framework example.

```js
const original = readResponse.result[0];
const saved = await SERVICE.DefaultPointOfServiceService.update({
    tenant: request.tenant,
    authData: request.authData,
    query: { code: original.code, revision: original.revision ?? 0 },
    model: { name: 'Web service point' },
    options: { returnModified: true }
});
const nextSnapshot = saved.result.models[0];
```

Do not calculate the next revision, silently refresh a rejected token, or
reconstruct a saved record from the request. Workbench must unwrap the real
generated response, including `result.models`. A zero-match response is not
success. Project customization, failure recovery and diagrams are in canonical
Foundation `schema-data-modeling` documentation; executable examples are in
`test/modelConcurrencyContract.test.js`.
