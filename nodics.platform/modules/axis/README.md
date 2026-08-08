# axis

`axis` is the backend-owned data/support module for the Nodics Axis product.

It keeps Axis-specific CMS composition, documentation content, importable
records, and BackOffice capability metadata out of the frontend repository while
preserving a clean split from BackOffice API authority.

## Owns

- Axis documentation CMS content pack.
- Axis documentation Site/catalog/page/component/route records.
- Axis-specific BackOffice documentation/navigation metadata.
- Future Axis product seed, init, sample, and presentation metadata that must be
  imported into backend persistence.

## Does not own

- React source or executable browser renderers.
- Axis frontend build/deployment.
- BackOffice registry/bootstrap/discovery APIs.
- Framework documentation unrelated to Axis.
- Customer/project documentation content.

## Verify

```bash
npm test
```
