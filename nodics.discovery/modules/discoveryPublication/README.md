# discoveryPublication

`discoveryPublication` owns the reusable publication descriptors that connect
Nodics publish lifecycles to Discovery indexes. It describes how indexable
documents move toward search availability without owning the source domain
approval process.

## Ownership

- Owns generic Discovery publication orchestration descriptors.
- Does not own Product, CMS, Profile, or other source publication authority.
- Keeps Discovery publication separate from low-level search-engine clients.

## Extension

Domain modules decide which records are eligible for publication. Keep this
module focused on reusable Discovery publication contracts and let the owning
domain provide source-specific lifecycle rules.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryPublication/test/discoveryPublicationContract.test.js
```
