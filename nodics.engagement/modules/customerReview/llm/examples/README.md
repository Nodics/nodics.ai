# customerReview Examples

## Supported customization direction

A project may configure review eligibility or stricter moderation policy later in the load order. A one-star review may be rejected only for a real policy violation, never because its sentiment is unfavorable.

A legacy CRES record is first mapped in `DRY_RUN` mode. Replaying identical source evidence is skipped; changed legacy content is a conflict requiring operator resolution before cutover.

## Rejected shortcut

Do not copy archived CRES code, expose schema CRUD directly, silently infer verified purchase, allow sentiment-conditioned incentives, dual-write by default, or place aggregate authority in Axis.
