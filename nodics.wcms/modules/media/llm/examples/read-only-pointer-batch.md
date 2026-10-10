# Read-Only Pointer Batch

The existing Staged version provider can read Online pointer evidence together:

```js
const result = await SERVICE.DefaultMediaPublicationVersionProviderService
    .getOnlineVersions(['guide-image-a', 'guide-image-b'], request);
// result.statuses retains that exact order; status is version/revision or null.
```

Preserve the original trusted request and configured internal target connection.
Codes are unique and bounded by the effective `maximumAssets`. No caller URL,
storage selector, human-token substitution or mutation is accepted. CMS checks
every pinned metadata record and target-owned byte result between initial and
final pointer batches. A changed version/revision is `ACTIVATION_CHANGED`, not
permission to republish or rebase. Overlays without batching retain the original
single-asset provider contract; malformed batch evidence fails closed.

The default owner verifies all exact retained bytes in one remote call:

```js
const integrity = await SERVICE.DefaultMediaPublicationVersionProviderService
    .reconcileVersions([
        { mediaCode: 'guide-image-a', manifestCode: exactManifestA },
        { mediaCode: 'guide-image-b', manifestCode: exactManifestB }
    ], request);
// Ordered results: exact identity, intact/active booleans, protected=true,
// repaired=false and deleted=false. False integrity is not READY.
```

This reuses the service-only reconcile route and existing cleanup authority.
Validate the whole bounded unique selection before reads. Never mix operation
keys, mutation commands, paths or storage selectors into the integrity batch.
Two pointer batches around this integrity batch use three remote calls while
still hashing every retained asset; ordinary router rate limits remain enabled.
