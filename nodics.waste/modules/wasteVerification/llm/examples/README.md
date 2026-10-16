# wasteVerification Examples

The executable examples in `test/wasteOperationalRolesContract.test.js` cover
independent verification, approval, rejection, assignment, public feedback,
evidence holds and replay. With required verification, a held illustration cannot
be approved or rejected merely by supplying human acknowledgement. A legitimately
verified rejection needs a public reason but no approval acknowledgement, and
creates no asset or impact record.

`test/wasteEvidenceRejection.test.js` exercises the distinct evidence-only command:
an assigned scoped reviewer rejects unusable artwork with a public reason, keeps
the original evidence/facts and records no physical verification or asset/reward.
Examples cover changed-evidence refusal and recovery after audit/final-save failure.
Existing ordinary approval/rejection tests continue requiring prior verification.

Changes requested remains unsupported. Generic lifecycle enum values are not
authority to update persisted submissions. See the
[review contract](../contracts/review-workspace.md#evidence-only-rejection).
