# Digital Core Examples

Add coupon-code, license, and media delivery examples here as implementation coverage expands.

For purchase-relative coupons, a later Promotion data layer authors a campaign
policy with validityDays and terms; activation remains separately qualified. The
default framework does not hardcode a customer's duration or refund window.
Two customers buying on different days retain different expirations. Sale retry
must preserve the original date, and changed campaign outlet rules must not replace
retained purchase rights. Missing refund terms require manual review.

A later Digital Core layer can narrow maximumCouponUnitsPerCheckout. Fixtures
cover invalid fractions, failed owner reads, zero-match coupon writes and partial
reservation handoff. They are authored, not executed acceptance. An uncertain
second acquisition remains recovery-required even after the first is released.

Override only `src/templates/email/digital-coupon-purchased/en/email.html` for
branding; manifest and text alternatives inherit. Use fake non-secret references
for previews. Files alone neither select a notice nor send it; never add raw
coupon code parameters or a provider trigger in a presentation override.
