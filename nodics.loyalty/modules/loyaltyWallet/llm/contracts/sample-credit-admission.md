# Reviewed Sample Credits

`DefaultLoyaltySampleCreditContributionService` is the Loyalty owner adapter for
the existing nImport custom-installer mechanism, not a second importer. Its fixed
installer is `LOYALTY_SAMPLE_CREDITS`; its fixed JSON basename is
`loyaltyCredits.json`. The module group remains composition-only.

## Admission

| Boundary | Required evidence |
| --- | --- |
| Source | Checksummed nImport-qualified `sample`, `EXPLICIT`, `OPERATIONAL_VERSIONED`, destination `LOYALTY` |
| Deployment | Actual selected environment explicitly present in `loyalty.sampleCredits.allowedEnvironments`, enabled sample-credit policy, LOYALTY runtime role |
| Approval | Exact environment, signed enterprise, release/version/checksum, instruction and approval reference in deployment policy |
| Operator | Original human access token, verified tenant and enterprise, independent `loyalty.sampleCredit.apply` permission, not general reward earnings |
| Wallet | One existing OPEN sample CUSTOMER wallet with exact source owner/code |
| Program | Existing active earning program and active POINT reward precision |
| Balance | One existing sample balance matching the original six counters and revision |
| Persistence | Real transaction provider, opaque context propagation, identical installed database wrapper for all participating schemas, installed unique code indexes and balance CAS capability |

Import permission, source JSON, deployment flags and successful preflight do not
independently grant earning authority. Configuration is off by default. Do not
use this adapter for real production funding or carbon funding. Partner modules can
narrow validation through loader composition without replacing the importer.

Environment class is not an admission authority. A later environment/server layer
may explicitly select a non-Local demo environment using the existing allowlist
and exact `approvedSources` pins; changing its class alone grants nothing. Request
fields cannot select the deployment environment. Defaults remain disabled with
empty environment and source lists. Each selected environment needs its own exact
environment/enterprise/release/version/checksum/instruction/approval match; an
approval for a different environment is not portable authority. No real funds,
new wallets or ordinary reward earning are authorized by this customization.

The historical `localDemoOnly: true` receipt/ledger metadata is retained as a
sample-only compatibility marker, not a deployment-class check. Changing it would
conflict with persisted original replay evidence; non-Local demo credits preserve
the same once-only ledger and balance transaction contract.

Preflight refusals may include a fixed owner gate label for operator diagnosis.
The label never contains provider exception text, wallet data or credentials, and
does not change any admission condition. Unknown exceptions retain the normal
private error path.

Schema participation refusals may additionally identify one of the three fixed
module/schema names (wallet, reward balance or ledger entry). No provider fields,
record identities, configuration, client handles or exception text are returned.
A database mismatch remains a refusal: canonical nDatabase registration must
provide the same actual wrapper/client, not a Loyalty-side URI comparison or
cross-client transaction exemption. Qualification occurs before any wallet,
balance or ledger reads.

## Posting And Recovery

1. Preflight every instruction before any write.
2. Begin the Loyalty transaction through nDatabase.
3. Recheck current operator, wallet, source approval and expected balance.
4. Apply the exact available/earned delta through the existing Loyalty balance
   operation and insert its EARN ledger entry with source/intent metadata.
5. Read both records through generated services inside that transaction. A
   missing posting, failed acknowledgement or contradictory balance aborts it.
6. Return only instruction and ledger identities, not private record bodies.

Each instruction is atomic, not an entire multi-instruction contribution. After
an uncertain response, refresh the original source/installation evidence. An
original replay returns `CURRENT` even after later spending; it never restores
the opening balance or replenishes the wallet. A changed amount, approval or
source checksum conflicts with retained original intent. Never choose another
instruction identity to work around a conflict.

The caller's signed identity remains unchanged. Generated storage uses Loyalty's
established private storage actor; it is not a new service token or permission
assignment. The opaque transaction token is forwarded without cloning or
serializing it. No tenant or enterprise fields are added to ordinary wallet or
balance models.

`test/loyaltySampleCreditContribution.test.js` proves isolated contribution and
posting behavior, including rollback, source/authority refusal and replay. It
does not prove installed transaction support, HTTP acceptance or real funding.
