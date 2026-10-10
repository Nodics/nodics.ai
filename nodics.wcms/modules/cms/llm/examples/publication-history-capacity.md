# Repeated Imports and Publication Capacity

Given 40 retained versions of shared code A and two versions of capability code B,
a bounded three-row history read can initially contain only A. The CMS publication
adapter retains A's latest identity, then reads the same source scope with A
excluded. B's latest identity is now included. No history is deleted or approved
automatically, and no read mode or caller authority is overridden.

The distinct dependency boundary still rejects an oversized graph. A provider
that ignores the exclusion fails as non-advancing evidence rather than looping
or publishing a truncated graph. Run:

```bash
node --test nodics.wcms/modules/cms/test/cmsPublicationHistoryCapacity.test.js
```
