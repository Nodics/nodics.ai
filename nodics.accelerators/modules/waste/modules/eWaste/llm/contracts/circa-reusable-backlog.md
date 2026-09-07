# Nodics Circa Reusable Backlog

This backlog is reusable framework and accelerator work. It is not
customer-project-specific. Customer projects later activate, override, or
configure these records and flows through data and policy.

## Asset Foundation

1. Define `wasteAssetType`.
2. Define `wasteAsset`.
3. Define `wasteAssetOwnershipEvent`.
4. Define approved submission -> asset creation contract.
5. Define asset status lifecycle.
6. Define asset custody state.
7. Define physical versus digital ownership.
8. Define asset lock/reservation model.
9. Define ownership history projections.
10. Define data retention policy.

## Wallet, Rewards, And Carbon

11. Define `wasteRewardSettlementPolicy`.
12. Define `wasteCarbonSettlementPolicy`.
13. Define reward provenance.
14. Define carbon-credit provenance.
15. Define enterprise settlement accounts.
16. Define split settlement policies.
17. Define double-spend prevention.
18. Define wallet failure handling.

## Transfer, Marketplace, And Commerce Projection

19. Define `wasteAssetTransferPolicy`.
20. Define `wasteMarketplaceEligibilityPolicy`.
21. Define product/listing projection policy.
22. Define bid/offer policy.
23. Define asset valuation policy.
24. Define asset visibility policy.
25. Define recipient acceptance policy.
26. Define ownership transfer trigger.
27. Define cancellation/reversal behavior.
28. Define dispute lifecycle.

## Coupon Marketplace And Entitlement Settlement

29. Define `wasteCouponRedemptionSettlementPolicy`.
30. Define coupon reward debit/reserve modes.
31. Define carbon receiver modes for coupon purchase.
32. Define enterprise coupon catalog linkage.
33. Define coupon entitlement reference model.
34. Define coupon claim lifecycle.
35. Define cross-enterprise coupon rules.
36. Define coupon purchase failure handling.

## Circa API And Customer Experience

37. Define Circa API contract.
38. Define customer bucket views.
39. Define Circa MVP screen backlog.
40. Define notification events.
41. Define analytics events.
42. Define Circa local app/server setup.

## Governance, Security, Compliance, And Operations

43. Define fraud/risk hooks.
44. Define compliance constraints.
45. Define customer identity/KYC hooks.
46. Define legal disclaimer policy.
47. Define admin/BackOffice override actions.
48. Define customer support views.
49. Define reporting/dashboard needs.
50. Define import/export requirements.
51. Define permissions.
52. Define observability, versioning, migration, idempotency, and rate limits.

## Circa Customer Frontend Journey

53. Define public Circa single-page content sections.
54. Define public navigation contract for `Submit Waste`, `Find Collection Center`,
    `Shop`, and `Help`.
55. Define login-only gate for `Submit Waste` using username or email and
    password.
56. Define simplified customer registration with email, name, and password.
57. Define register-and-login handoff behavior.
58. Define conversational e-waste submission UI contract.
59. Define pre-image location-confirmation step.
60. Define nearby collection-center lookup and fallback message behavior.
61. Define camera capture and file-upload image intake.
62. Define AI image metadata extraction request and response contract.
63. Define customer confirmation summary with generated item name, type,
    reward estimate, carbon estimate, and benefit summary.
64. Define submission creation after customer confirmation.
65. Define under-approval customer message and notification expectation.

## Axis Review And Approval Journey

66. Define Axis waste review navigation section.
67. Define `Pending Review`, `Approved Assets`, `Rejected Assets`, and
    policy-enabled `Needs More Info` lists.
68. Define submitted asset detail view for business users.
69. Define immutable original evidence view.
70. Define AI-suggested data view.
71. Define customer-submitted data view.
72. Define admin final verified data overlay.
73. Define approve action contract.
74. Define reject action contract with required reason.
75. Define approval-created customer-owned asset behavior.
76. Define approval wallet settlement trigger for rewards and carbon credits.
77. Define approval and rejection notification contracts.
78. Define admin audit history and final-data update history.

## Customer Dashboard, Asset Detail, And Shop

79. Define customer asset dashboard listing contract.
80. Define customer asset filters for status, ownership, tradeability, family,
    category, material, collection center, reward range, carbon range,
    submission date, and verification result.
81. Define customer asset card fields and primary action behavior.
82. Define customer asset detail route and page contract.
83. Define approved asset action matrix for trade, gift, donate, redeem,
    history, wallet references, and certificate/evidence.
84. Define trade/list action that creates Product/Commerce projection.
85. Define listed asset lifecycle and marketplace visibility.
86. Define Circa `Shop` listing source and card fields.
87. Define buyer journey handoff to Product/Commerce.
88. Define sale-completion callback behavior for Waste ownership lifecycle and
    wallet/carbon settlement policy.
