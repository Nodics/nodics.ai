# Waste Reward

The canonical material-value article is `waste.material-value`, maintained
directly in `data/docs-v001/records/documentation`. Select its documentation pack
independently from business permissions and releases; these draft records do
not qualify payment evidence or activate contributor credits.

Material-value credits target the canonical LOYALTY runtime role. They do not use
COMMERCE as a transport alias or add customer-owned routing defaults.

`wasteReward` owns reusable Waste reward-assessment persistence and historical calculation evidence.

Domain accelerators such as eWaste contribute the property catalogue, policy selection and reward context. Generic rule mechanics remain in `nodics.rulesEngine`. Loyalty remains the wallet/ledger authority.

The material-value extension owns confirmed recycler valuation, original-beneficiary allocation evidence and a narrow payment-gated release coordinator. It requests the existing Loyalty `/reward-earnings` operation and retains its ledger reference; it never mutates wallet balances or executes recycler payment. Existing participation assessments remain independent and immutable. See [the material-value contract](llm/contracts/material-value.md) for provider qualification, exact attribution and recovery.

POST /waste/material-value/allocations is the private customer/represented-Enterprise projection. It resolves current Profile identity/scopes and returns only the original owner's valuation/payment/credit progress; amounts here are never spendable balances. Assessment, full-batch lookup and release stay service-only. Cross-module unit tests load the real Loyalty API, wallet, earning and transaction services behind fake transport/storage; they do not qualify a live financial provider or runtime.

The opt-in `wasteMaterialValueNativePersistenceAcceptance.test.js` gate uses only an explicit credential-free loopback
replica set and a fresh random database. It proves policy, batch, contribution/payment claim persistence, payment gating,
stable Loyalty idempotency, concurrent reconciliation and restart recovery. Its valuation, payment and Loyalty ports are
synthetic; it does not qualify recycler payment, live Loyalty or an external financial provider.
`materialPermissionImportAcceptance.test.js` executes the actual permission release through Foundation's admitted
identity-authority import dispatch without installing grants.
