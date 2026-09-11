# wasteVerification Contracts

Waste Verification owns reviewer decisions and verified facts. It must not
overwrite submitted facts.


Permission-based verification uses a durable `wasteVerification` record and preserves submitted facts. With `waste.operations.requireVerification`, decisions require prior verification; review and approval are independent grants. A reviewer with approval permission, including an administrator, may approve the same submission. The default `requireDifferentApprover: false` preserves this behavior. The optional `requireDifferentApprover: true` restriction applies only when a project explicitly requires separate actors. Approvers cannot alter verified facts. Verification requires confirmation, revision and idempotency; it does not earn rewards. Approval/rejection and audit retain actor and settlement references. Run `test/wasteOperationalRolesContract.test.js` for success, role/scope denial, stale facts, combined-role approval and explicitly configured separation coverage.

- [Review workspace and recovery](review-workspace.md)

## Module-owned review views

`waste.reviewWorkspace.views` is a keyed map contributed by core and each active accelerator. `viewCode` selects an existing key; unknown keys fail. Modes are OVERVIEW, SUBMISSIONS and REVIEW_QUEUE. Fixed family scope cannot be overwritten by caller filters; review queues allow only pending/under-review states. These filters do not grant access: normal Profile operational scope still applies.
