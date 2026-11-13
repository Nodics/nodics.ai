# Circa Local Demo Credits

The separate `circa.ewaste:circaLocalDemoCredit` sample contribution defines one
7,645 POINTS instruction for the original `circa-customer` sample wallet. This
provides the reviewed 38-coupon batch with 7,763 total spendable POINTS when the
original 118 POINTS remain intact. It is not campaign budget, cash, carbon,
replenishment, real merchant funding or a customer production policy.

| Source | Value |
| --- | --- |
| Release folder/version | `data/sample-v001`, `0.0.1` |
| Pack selection | Explicit, environment-portable, destination Loyalty; execution remains separately enabled and qualified |
| Instruction | `CIRCA_LOCAL_DEMO_BUYER_POINTS` |
| Review reference | `CIRCA_LOCAL_DEMO_POINT_CREDIT_20261009` |
| Expected original state | 118 available/earned, zero other counters, revision 0 |
| Posting | One atomic EARN through Loyalty, retaining original release identity |

That original instruction is installed historical evidence and is never replayed.
For the separate `kickoffLocal` E2E continuation, the immutable
`circa.ewaste:circaLocalE2ECustomerWalletCredit` release defines a new 7,645
POINTS instruction with independent identities and the authoritative observed
wallet guard below.

| Successor source | Value |
| --- | --- |
| Release folder/version | `data/sample-v001`, `0.0.1` |
| Instruction | `CIRCA_KICKOFF_LOCAL_E2E_CUSTOMER_POINTS_20261020` |
| Approval reference | `CIRCA_KICKOFF_LOCAL_E2E_FUNDING_20261020` |
| Expected live state | 0.00 available, 0.00 reserved, 7,763.00 earned, 7,763.00 spent, 0.00 expired, 82.00 reversed, revision 86 |
| Posting | One atomic 7,645 POINTS EARN through the Loyalty owner |

Only the `kickoffLocal` Loyalty server admits these exact releases, checksums,
instructions and approval references. Fresh Circa setup selects the original
revision-0 credit. The successor remains an explicit continuation selection for
the exact retained revision-86 state after the earlier E2E transactions. A
counter or revision mismatch must refuse either instruction without writes.
Source preparation does not claim a live import.

The original `circa.ewaste:loyalty` sample source and its installed receipt remain
unchanged. Select the new contribution through normal Axis/nImport preparation;
do not reimport the wallet snapshot or call reward-earnings as a manual top-up.
Native `kickoffLocal` selects the exact reviewed source in the Commerce runtime that hosts Loyalty Wallet. Docker and all other deployments remain disabled. The signed
GREENPERKS_ONLINE human operator must independently hold `loyalty.sampleCredit.apply`.
For fresh setup, select `loyaltyWallet:specialAccessGroups` before
`loyaltyWallet:specialAccessRoles`, and `import:specialAccessGroups` before
`import:specialAccessRoles`, through their PLATFORM Init releases. These existing
implementing owners supply the reusable definitions and pinned prerequisites.
Then explicitly select `circa.ewaste:circaLocalDemoCreditStaffAssignment`, sample
0.0.1 under `sample-v001`, environment-portable and REFERENCE/RETAIN. Its sole
instruction adds roles `LOYALTY_SAMPLE_CREDIT` and `IMPORT_SAMPLE_OPERATOR`, with
groups `loyaltySampleCreditUserGroup` and `importSampleOperatorUserGroup`, to the
original `circa-online-administrator` / `online.administrator@circa.local` /
`GREENPERKS_ONLINE` human through Profile's
`DefaultEmployeeService.addReferenceGroupsAll`. No role vocabulary or permission
definitions belong in Circa properties or a Circa role pack. Resolve current
owner release versions/checksums from their manifests, not old handoff descriptors.
Runtime service grants cannot replace this human membership.

The additive owner retains existing groups, credentials, metadata and scopes,
checks the original enterprise and uses the current groups/security stamp in its
CAS. Never replay `operations` or save an employee snapshot to install this role.
After normal session refresh, verify the genuine original human. Fresh historical
setup may validate/install the unchanged `circaLocalDemoCredit` only against its
original 118 available/earned and revision-0 guard. The E2E continuation instead
validates/installs `circaLocalE2ECustomerWalletCredit` against its independent
revision-86 guard; neither release may be retargeted. The original descriptors,
hashes and preparation order in
`test/evidence/circa-bounded-human-role-source-handoff-2026-10-09.json` are sealed
historical evidence, including retired Circa role selections. Preserve those bytes
and installed receipts; they are not current import instructions. Existing
installations require separately reviewed Profile reconciliation, never replay of
the original credit or employee snapshots. This source contract does not claim
an installed role, credited wallet or native acceptance.

The canonical owner contract is
`loyaltyWallet/llm/contracts/sample-credit-admission.md`. A source manifest or
passing unit test does not qualify native persistence. If the native provider
cannot execute a fail-closed multi-record transaction, import must refuse without
crediting the wallet. Preserve the selected instruction on recovery; never issue
another successor merely because a response or client checkpoint is missing.

Execute any quantity-one asset purchase/refund float before the coupon-spending
batch. The unused coupon refund returns its original POINTS before ITEM cases.
ITEM delivery remains explicitly simulated and already-redeemed benefit reversal
remains disabled. Neither this credit nor a setup READY state proves checkout,
redemption, refund, seller settlement or real delivery acceptance.
