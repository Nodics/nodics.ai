# Customer Engagement Contracts

## Functional identity

`nodics.engagement` is the standard framework group for governed customer submissions, business action, and controlled public visibility. It directly composes seven capability packages and owns no domain implementation at group level.

## Invariants

1. Review, feedback, testimonial, and contact remain distinct domain records.
2. Processing, moderation, publication, and consent are independent lifecycle dimensions.
3. Process orchestrates work; Engagement owns domain commands, state, and evidence.
4. nPublish owns generic publication lifecycle; Engagement owns eligibility and sanitized domain projections; WCMS owns placement.
5. Media owns binaries; Engagement stores governed references only.
6. Profile owns customer identity; Engagement enforces tenant, object, action, and permission policy.
7. Communication owns rendering and delivery; `engagementComms` owns Engagement scenarios and safe context translation.
8. Axis renders backend-owned metadata and APIs without becoming lifecycle or aggregate authority.
9. Archived CRES and gNotify are migration evidence only; generated Core residue is not authority.
10. Configuration may disable experiences but must not mutate the required package graph.
11. Internal domain schemas keep `router.enabled: false` as well as router-disabled
    capability metadata. Enabling a module router must not expose generic CRUD that
    bypasses dedicated Engagement API lifecycle, consent or tenant checks. Verify
    this through the actual nRouter activation consumer, not metadata alone.
12. Domain-owned permission and documentation releases belong to the implementing
    capability's manifest. Their presence is not API activation or a runtime grant;
    boundary tests validate explicit selection and owner identity.

## Capability limit

The current implementation keeps group-level composition separate from concrete domain behavior. Public routes, persistence schemas, workflows, delivery, publication, and operator actions must be owned by the relevant child capability.
