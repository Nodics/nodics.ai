# nodics.docs Contracts

This folder contains documentation-content contracts owned by `nodics.docs`.

Use root `AGENTS.md`, `nodics.docs/AGENTS.md`, and
`nodics.foundation/modules/nSetup/llm/contracts/documentation-impact-contract.md` as
the primary authority. Add a local contract only when framework documentation
content packaging, ownership, release validation, or CMS import projection
needs a `nodics.docs`-specific durable rule.

Functional visibility and physical record ownership are separate. Composition-only
groups own no business release or capability documentation pack. Canonical records,
import headers and unique Media assets belong to the implementing child module;
cross-module overview guides and the shared CMS scaffold belong to `nodics.docs`.
Do not copy article bodies to satisfy a second navigation category. Preserve stable
document IDs, routes, anchors and owner-qualified references when moving a guide.
`nService` retains its own implemented service/pipeline guides; its grouping
metadata does not erase its real capability ownership. `nSetup` remains governance-only.

Framework product documentation may describe a reference application's end-to-end
composition without changing the owning runtime modules. Nexus positioning is
product-discovery evidence, not implementation or installed acceptance. Circa's
canonical topic family uses explicit source maturity and customer/developer/operator
journeys; future Agora detail should follow that pattern. Keep new plans and
uninstalled business allocations out of claims about available functionality.

## Source Coverage Claims

Store optional `sourceCoverage` alongside the canonical article properties, not in
a duplicate registry. Each claim declares `modulePath` relative to the article's
trusted owner, `implementationState` (`IMPLEMENTED`, `SCHEMA_DEFINED` or
`COMPOSITION_ONLY`), distinct section `anchors` and local `evidence` also declared
in `sourceEvidence`. Evidence must resolve to actual non-data source files within
the exact selected metadata module, including realpath checks. Group coverage may
reference child implementation without transferring physical article ownership.

The auditor requires three distinct anchors, at least 800 words across their
sections, a diagram, a table and two source files. These are minimum depth checks,
not semantic verification of every sentence. Read the source and test the owning
contract. Describe absent workflows explicitly even when generated schemas/services
exist. Never convert source coverage into a claim of approval, publication,
installed-runtime qualification or browser acceptance. Mention-based matches remain
triage and must not be presented as this stronger evidence.

## Manual Semantic Review

The backlog auditor reads `test/evidence/semantic-documentation-closure.json`.
This is reviewed evidence, not a second content catalogue. Each item retains the
exact requested action, rationale, `PASS_SOURCE_REVIEW` or `OPEN_CONTENT_GAP`,
canonical document IDs and section anchors, plus at least two inspected non-data
source files. `canonicalDocuments` binds owner, component file and the SHA-256 of
`JSON.stringify(article.blocks)`; `sourceFileSha256` binds inspected bytes.

`semantic-review-contract.mjs` verifies those bindings. It does not evaluate prose
semantics or grant approval. Missing, duplicate, stale, foreign or incomplete pass
evidence reopens the item; an arbitrary `status` or `closureEvidence` string cannot
close it. Keep original reviews and correction reviews separately traceable.
Imported, published, browser-tested and live-provider-qualified states remain
independent. The report displays semantic open/closed counts separately from its
module-level coverage triage.
