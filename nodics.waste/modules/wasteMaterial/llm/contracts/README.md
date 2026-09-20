# wasteMaterial Contracts

Waste Material owns reusable taxonomy and evidence policy references. Partner
and accelerator layers may extend taxonomy through governed seed/configuration.

## Shared item descriptor

`DefaultWasteItemDescriptorService` owns the additive versioned descriptor used
by customer confirmation, submitted outcomes, reviewed assets and employee
review. Callers authorize records before projection. Private channel identities,
command keys and operational metadata are excluded from customer responses.
Reviewed facts take precedence after approval/rejection. Original submitted and
confirmed snapshots remain available to authorized employees.

Identity, family/category/type, materials/components, quantity, handling size,
weight, approximate dimensions, condition and environmental observations retain
explicit unknown values and provenance. Material references always address
`wasteMaterial/wasteMaterialType`; components are not decomposed into assumed
substances or quantities. Approximate image ranges remain INFERRED. Operator
corrections are validated and marked OPERATOR_VERIFIED; recorded measured weight
uses OPERATOR_MEASURED. Impact is a projection of the Waste impact owner result,
never a new calculation or a carbon-credit claim.

`wasteMaterial.descriptor` allows later-layer bounds for material count, ranges
and total catalogue records. Catalogue projection pages through generated reads
and fails explicitly above its configured bound. The generic core reference
release supplies shared materials and Clothing/Textiles taxonomy; installation
does not activate clothing collection, valuation or reward policy.

Before application/confirmation, the descriptor combines saved advisory
suggestion facts with current draft edits. Confirmed and reviewed snapshots
retain precedence, including explicit empty material lists. Unknown fields are
derived from the effective snapshot; obsolete AI unknown labels do not override
available ranges, materials or corrected identity.

## Image evidence assessment

`normalizeImageEvidence` records an advisory source classification and sticky
manual-approval hold. `evidenceReview` is the canonical public-safe projection
used by submission, review queue/detail and asset descriptors. Source types are
shared vocabulary in `descriptorDefinitions`; a likely item photograph is not
an authenticity guarantee. Later layers may refine confidence thresholds and
presentation through `wasteMaterial.descriptor.imageEvidence`, but may not clear
an existing hold merely by reanalysis or replacing evidence.

An absent or mismatched assessment is ineligible for automatic review. Legacy
unassessed records retain their existing explicit human-confirmation flow;
newly flagged records additionally require evidence acknowledgement. The
projection exposes manual routing and acknowledgement requirements, explanatory
copy and whether manual approval was recorded. Private reviewer identities stay
in the audit metadata.

## Metadata coverage and lifecycle

Every current image-schema property has the disposition below. This is a mapping
of existing authorities, not a second schema or runtime registry. The schema-key
coverage assertion and full nested range/environment comparisons live in
`wasteSubmission/test/wasteRecognitionAlignment.test.js`.

| Image schema property (including children) | Recorded by wasteSubmission | Public descriptor / lifecycle |
| --- | --- | --- |
| contractVersion | recognition.contractVersion | contractVersion; protocol metadata |
| assessment | recognition.assessment | SUPPORTED proceeds; UNSUPPORTED/UNCERTAIN reject before saving a suggestion |
| imageEvidence.sourceType/confidence/reason | recognition.imageEvidence and metadata.evidenceReview | evidenceReview; uncertain/missing/mismatched evidence requires human review |
| name, description, brand, model | suggestion.facts, applied facts | identity; absent identity values are null (unknown from evidence) |
| itemTypeCode, categoryCode | canonical catalogue relationship in facts and recognition.taxonomyMatch | classification; fallback match remains advisory; family resolved from catalogue |
| conditionGrade | facts.conditionGrade | condition value and basis; UNKNOWN until defensible observation/review |
| quantity | facts.quantity | physical.quantity; bounded main-item count |
| confidence | suggestion.confidence | advisory overall confidence remains suggestion metadata; never copied to each property |
| materials[].code/basis/confidence | canonical facts.materials refs and recognition.materials | materials or components by catalogue kind; [] means no supported observations, not absence of components |
| sizeClass | facts.sizeClass and sizeProvenance, recognition.size | physical.size; taxonomy policy or inference; UNKNOWN has UNKNOWN basis and null confidence |
| weightEstimate.min/max/unit/basis/confidence | facts.weightEstimate | physical.weightEstimate; inferred range or null endpoints; never measured weight |
| dimensionsEstimate.length/width/height and each range member | facts.dimensionsEstimate | physical.dimensionsEstimate; each missing axis is explicitly unknown |
| environment.recyclability/contamination/recoveryPotential value/basis/confidence | facts.environment | environment.observations; partial snapshots fill missing groups with UNKNOWN |
| environment.hazards[].code/basis/confidence | facts.environment.hazards | environment.observations.hazards; empty list is not safety clearance; hazardAssessment remains UNVERIFIED until reviewed |
| qualityFlags[] | recognition.qualityFlags | evidenceReview.qualityFlags; separate from low-confidence field paths |
| unknownFields[] | recomputed recognition.unknownFields | unknownFields and metadataQuality.unknownFields recomputed from effective facts; contradictory provider labels are discarded |

Fields outside the image schema remain governed: environment.assessment,
carbonImpact and landfillDiversion project only Waste Impact results. Missing
results retain NOT_ASSESSED (customer copy: pending calculation); FAILED stays
FAILED and zero stays zero. No measured weight, carbon, credit issuance or reward
amount can be manufactured from recognition. Reward valuation is ESTIMATED until
its owner records COMPLETED settlement; illustrative valuations stay ILLUSTRATIVE.
A rejected submission never makes its reward CONFIRMED.

Material visibility/recoverability and component hazard/recovery relevance are
unknown unless explicitly recorded. Observed material does not prove external
visibility; inferred material does not prove internal placement. Unknown boolean
component relevance is null, not a fabricated safety or recovery assertion.

`metadataQuality.lowConfidenceFields` contains effective fact paths below
`wasteMaterial.descriptor.minimumFieldConfidence` (default 0.6), never quality
flag codes. Later layers can override that reporting threshold; it does not
change permission, approval, evidence holds or impact calculations. Missing
confidence stays null. Final reviewed records do not borrow confidence or size
policy from old AI suggestions. Review completion clears the pending metadata
verification indicator while retaining the original evidence hold for audit.

Customer name/description edits, confirmation and reviewer snapshots retain their
existing authority. Original suggestions remain separate records. Legacy records
need no migration: absent values receive explicit unknown projections. For new
schema properties, update this coverage map and the schema-key regression before
shipping. Serial numbers/IMEI, personal data and provider internals remain excluded.
