# Validation-Only Documentation References

Use an existing canonical guide rather than copying its article into an accelerator.
The documentation manifest section can declare:

```json
{
  "referenceCatalogues": [{
    "manifestPack": "nodics.docs",
    "source": {
      "type": "LOCAL_SIBLING",
      "repositoryName": "nodics.ai",
      "manifestPath": "nodics.docs/data/manifest.json",
      "manifestSection": "documentation"
    }
  }]
}
```

The article's `references` supplies the exact `documentId`, canonical `owner` and
optional real heading `anchor`. `validateDataRelease` checks the explicit target
catalogue with the existing local source, checksum and containment authority,
then validates owners/anchors across the combined source graph. At most 16 unique
catalogue selections are accepted. Ambiguous identities and missing targets fail.

This declaration imports nothing. Only `includes` composes records and assets;
the selected pack's catalogue, staging tree and record counts remain unchanged.
References grant no Process approval, publication or access. CMS only emits
related links that exist in the exact immutable delivery scope. A separately
installed target still needs its own normal publication before readers can use it.

Run `node --test nodics.foundation/modules/nTooling/test/documentationOwnershipComposition.test.js`
from the framework root. The test covers standalone selection, graph rejection
and staging isolation; it is not live publication or business acceptance.
