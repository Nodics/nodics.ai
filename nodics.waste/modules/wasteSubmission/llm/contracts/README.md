# wasteSubmission Contracts

Waste Submission owns submitted facts, evidence links, advisory metadata
suggestions, and submission lifecycle state.

## Advisory photo recognition

`DefaultWasteMetadataAnalysisService.inspect` analyzes transient photo content
without persistence; `suggest` retains the existing persisted-draft workflow by
calling that same analyzer and persisting its result. `createPrepared` accepts
only a trusted orchestration result and Media-owned descriptor, validates facts,
and creates a submission with evidence and analysis already present. Replays are
bound to owner, command key and photo checksum. Replacement is revisioned and
preserves prior manual-review holds and the original submission origin.

`discardEmptyDraft` removes only an empty owner-authorized DRAFT at the expected
revision, after checking both reference fields and owning evidence/suggestion
records. Generated removal rechecks state, owner, revision and emptiness. Saved
photos, analysis, customer item text and confirmed submissions are retained.

`DefaultWasteMetadataAnalysisService` keeps visual identification separate from
catalogue coverage. Its overridable `buildPrompt` uses
`wasteSubmission.metadataSuggestion.subjectLabel` for the domain and
`fallbackItemTypeCode` for an explicitly configured generic type. The framework
default supplies no fallback; the eWaste accelerator contributes its existing
`UNKNOWN_ELECTRONIC_ITEM` preset. A fallback must exist in the active taxonomy.

A supported, recognizable item with an unmapped provider subtype can retain its
observed name and description under that generic type. The provider cannot create
a new item type or category. `recognition.taxonomyMatch` records `EXACT` or
`GENERIC_FALLBACK` and the authoritative item/category codes. Prompt version
`WASTE_PHOTO_V5` clarifies foreground-item selection, unknown labels, material
provenance and quality-flag semantics.

Unsupported or visually uncertain evidence, refusals, malformed responses and
blocking scene flags still fail before suggestion persistence. Hands and
incidental background objects are not submitted items. Exact brand/model text
must remain unknown when unreadable. Measures, operability, rewards and carbon
are never inferred as verified facts from a photograph. Metadata remains advisory
and requires customer review and explicit final confirmation.

## Customer identity edits and rich recognition

Customer draft creation and correction accept only name and description plus
revision/idempotency transport fields. Classification, quantity, brand/model,
materials, measurements and environmental properties are business-review fields.
Trusted analysis is applied from the saved suggestion at the exact revision;
caller-supplied copies of AI facts cannot be applied. Arrival remains a separately
validated Location-backed command.

Rich recognition records bounded approximate weight/dimension ranges, canonical
materials/components and advisory recyclability, contamination, hazards and
material-recovery observations. An estimate is not a measurement. Recognition
cannot establish safety, valuable material quantities or impact values. The
accelerator may restrict `allowedFamilyCodes`; both recognition and submission
validation enforce that domain boundary.

When `manualReviewFallback` is explicitly enabled with an active
`fallbackItemTypeCode`, saving a name for an evidence-backed unclassified draft
uses that server-owned type and marks `manualReviewRequired`. The customer sees
that classification awaits the collection team. Generic framework defaults do
not enable fallback. Normal collection acceptance, confirmation, review scope,
revision checks and separate approval still apply. Reuse/repair lifecycle and
material decomposition are outside this contract.

The recognition service pages through the complete active shared catalogue with
Waste Material's configured bounds, then applies allowed-family policy. Its
`buildResponseSchema` supplies a provider-neutral `{name, schema}` contract:
all fields and nested dimension axes are required, unknowns are nullable, and
codes/enums derive from active taxonomy and shared descriptor vocabulary.
OpenAI enforces this schema through strict Structured Outputs. Server-side
normalization remains authoritative for catalogue/category relationships,
allowed grades, valid ranges, material references and advisory provenance.

The prompt assesses each property independently. A readable item with an
unreadable brand may still yield visible materials and defensible broad typical
physical ranges; lack of a defensible form factor/scale retains unknown ranges.
These ranges never populate measured weight or environmental impact amounts.
Unknown-field reporting is derived from normalized effective facts, including
review corrections, instead of trusting contradictory provider labels. Focused
alignment tests exercise a 501-item catalogue, nested ranges, environmental
observations, malformed estimates and persistence/application/projection.

Replacing evidence clears previous recognition references and AI-derived
properties while preserving customer text, collection choice and later-layer
fields. Applying a new proposal replaces those derived properties, so an
unknown new brand/model or measurement cannot inherit an older observation.
Old suggestion records remain separate audit records.

## Image-source evidence and manual approval

`WASTE_PHOTO_V5` requests `imageEvidence` separately from depicted-item
classification. A recognizable item in a promotional graphic, illustration,
painting, screenshot/rephotograph or suspected synthetic image may remain
SUPPORTED; its source assessment mandates manual approval. The service never
claims that a photograph-looking image proves physical possession or authenticity.

Waste Material normalizes source types, confidence, bounded explanation and the
photo reference into `metadata.evidenceReview`. Unknown/low-confidence source
assessment also creates a manual hold. Once flagged, a submission keeps its hold
and first flagged evidence across retries, fresh analysis and photo replacement.
Customer edits cannot write or clear it. Non-photographic depictions retain
advisory identity/classification but do not establish physical ranges or observed
contamination; material/hazard possibilities remain INFERRED. Existing scene
quality and unsupported-item validation remains in force.

The hold is checked by Waste Verification and copied to approved assets.
Recognition itself does not approve or reject an asset, grant permission, or
activate an automation.
