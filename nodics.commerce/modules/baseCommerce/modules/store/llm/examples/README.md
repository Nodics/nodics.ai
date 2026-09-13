# Store examples

Use canonical Commerce documentation; archived examples are not current contracts.

```js
SERVICE.DefaultStoreContextService.resolveStoreCode({
    storeCode: 'duStore', payload: { storeCode: 'duStore' }
});
// For an already-authorized record:
SERVICE.DefaultStoreContextService.resolveStoreCode({}, ownedCart.storeCode);
```

Contradicting the stored code is rejected. This helper does not look up a Store
or prove selling eligibility; use the existing owning validation when required.
