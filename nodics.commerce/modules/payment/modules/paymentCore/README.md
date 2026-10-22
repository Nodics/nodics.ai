# Payment Core

Payment Core is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

`POST /internal/evidence/query` is a private, service-token-only exact journey
read for acceptance and recovery evidence. It requires `commerce.payment.read`
and exact Order, Cart and owner coordinates, uses the generated Payment transaction
owner, rejects ambiguous or foreign rows, and returns only a bounded safe projection.
It is not a generic transaction search or customer API.

Refund execution follows the [guarded original-capture contract](llm/contracts/README.md).
Generic token-based refunds are unavailable. The scoped full Loyalty capture path
requires persisted Order approval and remaining-authority preflight; failed,
delayed or unconfirmed settlement stays reconciliation work. Local isolated tests
do not establish live provider or physical reversal qualification.

Fresh CARD captures explicitly selected by the server as `LOCAL_SANDBOX_DEMO`
support a tokenless, original-capture-bound **offline** refund through persisted
Order approval. Capture and refund receipts are retained and read back from the
existing generated Payment owners. Every result remains `sandbox: true` and
`OFFLINE_CONFORMANCE`; no funds move. Legacy unbound captures and real CARD remain
unavailable. The new contract is not live provider qualification. See the
[original-capture CARD boundary](llm/contracts/README.md#card-original-capture-gate).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
