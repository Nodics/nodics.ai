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
