# discoveryPublication

Private original index-retirement receipts coordinate one nSearch barrier after
domain-owned replacement qualification. A separate reviewed erasure claim uses
native writer decommissioning and exact one-shot deletion; retirement alone
retains legacy data. See [the operator guide](../../../nodics.docs/docs/pages/nodics.copilot/knowledge-generation-recovery.md).

`discoveryPublication` owns the reusable publication descriptors that connect
Nodics publish lifecycles to Discovery indexes. It describes how indexable
documents move toward search availability without owning the source domain
approval process.

## Ownership

Private `discoveryGeneration` manifests support CAS-bound whole-source
generation publication. Source owners remain responsible for eligibility and
all projection acknowledgements before activating a generation. See
[the generation contract](llm/contracts/README.md); Copilot's
[adoption guide](../../../nodics.copilot/modules/copilotKnowledge/llm/examples/generation-publication.md)
provides operator, migration and failure examples.

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
