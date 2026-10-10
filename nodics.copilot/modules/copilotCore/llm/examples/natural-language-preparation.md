# Natural-Language Business Preparation

## Workflow Trigger Proposals

The four fixed `process.trigger.create/update/archive/execute` preparers reuse
the accounted provider and existing action review. Example: `Please update
trigger monthly-review with status ACTIVE and active true`. The backend checks
the verb, whole literal identifiers and explicit named numeric/boolean values;
empty context must be explicitly written as `context {}`. No activation choice,
instance identity, endpoint or scheduler action may be inferred. Preparation
needs native manage/execute authority and a valid enabled trigger target before
the provider sees these forms. Typed commands bypass the provider. All trigger
exchanges are excluded from later model history. See the canonical
[trigger guide](../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js).

## What This Mode Does

This opt-in Core interpreter translates human prose into inputs for existing
enterprise/invitation, product/price, collection-centre and fixed human-task preparers. It is not arbitrary Axis
automation, a tool registry, an autonomous agent or a domain execution engine.
The default is `copilot.core.intentPlanning.enabled: false`.

Task commands additionally require `workbench.processTaskTarget` and the exact
native command permission. The interpreter cannot infer approval from complete:
`approved true` or `approved false` must appear explicitly for a boolean proposal.
Task and assignee identifiers must match whole supplied tokens. Typed and exact
short forms bypass the provider. Task exchanges are excluded from later provider
history. See [the task guide](../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js)
for native receipts, supported decision shapes and failure investigation.

```text
Human prose -> current permission/configuration filter
                           |
             existing provider + usage reservation
                           |
              bounded untrusted JSON proposal
                           |
             human-input evidence + adapter validation
                      /           \
                 clarify       full review
                                  |
                           human confirmation
                                  |
                      existing owner execution
```

## Administrator Setup

1. Configure and test the local Ollama adapter using the Provider guide. Select
   the effective provider/profile through the existing provider owner, and
   allocate a usable employee budget. This interpreter uses that same provider;
   it never connects to Ollama or an external vendor independently.
2. Enable only the required Workbench target. Enterprise creation also requires
   `profile.enterprise.create` and `profile.enterpriseAccess.assign`.
3. Enable `core.intentPlanning.enabled` in the intended deployment layer. Set
   `clarificationMessage` there if different business copy is required.
4. Verify one missing-information request, one complete synthetic request, one
   denied user and an exhausted budget before adopting the mode for users.
5. Review the preview but do not execute against real business data during
   preparer acceptance. Domain execution acceptance is a separate explicit step.

## Business-User Steps

1. Open the separate Copilot conversation page in the intended enterprise.
2. Give explicit values. Example: `Create enterprise ACME named Acme Limited
   with administrator admin@example.invalid and no employees.` For invitations,
   supply every employee email and role; accounts are still activated through
   Profile registration, not by the model.
3. For centres, supply the centre code/name, collection-point type, existing
   location code, operator enterprise code, operating status, visibility and
   lifecycle status. The operator must be the current enterprise.
4. Respond to clarification by restating the completed request. The interpreter
   intentionally does not merge old assistant output or prior turns into an
   action instruction. Use the explicit JSON command when exact extraction is
   not possible.
5. Inspect the full canonical review. A plausible model interpretation is not
   proof that the values are correct. Approve and execute only after review.

### Products and Their Prices

Configure the existing `workbench.target.productModule`, `pricingModule` and
registered `connectionName`. Both native owners must independently allow the
employee's Staged schema writes. Standalone-price admission does not gate the
already-existing combined Product/PriceRow journey. The model never supplies a
connection, URL, tenant or employee credential.

1. Select the intended enterprise and verify catalogue/price-book identifiers in
   their owning workspace. Preparation does not prove referenced records exist.
2. Send: `Create 1 product, name Acceptance product, codePrefix acceptance_product,
   catalogVersion acceptance_catalogue, priceBookCode acceptance_book, currency
   AED, price 12.50, active false.` These are synthetic example identifiers.
3. Include a numeric quantity from 1 to 100 and `active true` or `active false`.
   Missing choices produce clarification; model output cannot activate products
   by omission. Exact decimal strings preserve scale, including trailing zeroes.
4. Review the generated `-001` product code and linked `-001-PRICE` row, catalogue,
   book, amount, currency, status and revisions. Approval still writes no business
   records. `ACTIVE` authoring status is not publication or storefront activation.
5. Execute once. Product and Pricing receive separate native secured requests.
   Current target, API admission and policy are checked before each dispatch.
6. If a response is lost, inspect the original action. Original native receipts
   can confirm completed rows; unstarted rows require a fresh approval. No product
   or price is recreated merely because its response was lost.

The equivalent provider-free typed command is:

```json
{"operation":"commerce.product.create","count":1,"name":"Acceptance product","codePrefix":"acceptance_product","catalogVersion":"acceptance_catalogue","priceBookCode":"acceptance_book","currency":"AED","price":"12.50","active":false}
```

This explicit command has the same required fields and bounds. The legacy
untyped API and deterministic prose parser remain separate compatibility paths;
do not assume they supply the new interpreter's explicit-field guarantees.
Unsupported product update/delete requests require clarification, not creation.

## Low-Level Contract

The provider receives only the current human message and forms for currently
available preparers. It receives no retrieved instructions, transcript history,
tool functions, mutation endpoint or credentials. Output is bounded to the
smaller of 2,048 tokens and the effective provider profile's output allowance,
and to 32 KiB, parsed as JSON, allowlisted by operation and revalidated by the
owning preparer. Material scalar values must occur in the human input after
case/Unicode normalization. Fixed canonical reference constants and initial
revision zero are the only non-human literals. Product count must be grounded in
an explicit numeric create/add quantity or count/quantity field; its boolean
choice must occur as `active true` or `active false`. Monetary/quantity strings
must match a whole decimal token, not a substring of another amount. Empty invitation lists require an
explicit no-employees statement. These checks prevent invented literals, not
semantic misunderstanding; human review remains mandatory.
An allowance too small for the complete structured response can cause
clarification. Adjust the profile through normal configuration review; the
interpreter never increases it or bypasses accounting.

Invocation uses `DefaultCopilotProviderService.invoke`, call identity
`<turnCode>:intent`, and the existing conversation usage purpose. Budget
exhaustion and uncertain provider accounting propagate; there is no unmetered
fallback. The terminal conversation event carries the returned measured usage.
Permission/configuration is rechecked after inference and again by preparation
and execution. Invalid output becomes the configured clarification, never an
executable command. Coupon/token/password-bearing requests are excluded from
this interpreter; coupon redemption needs a separate sensitive-input adapter.

## Customization And Tests

Partners may customize clarification copy and configured target/provider
selection. Adding an operation requires an actual permission-filtered preparer,
bounded schema, full review and owner execution path, not a new prompt alone.
Never turn a model-provided URL, method, permission or JavaScript into a tool.

Run `copilotIntentPlanning.test.js`, Workbench action tests and Core phase
acceptance. They cover unavailable operations, invented identifiers, escalation,
revocation during inference, explicit empty selection and provider failures.
Real Ollama extraction quality and signed-in employee acceptance remain separate
from deterministic contract tests.

The opt-in `copilotProductRuntime.live.test.js` and `copilotPriceRuntime.live.test.js`
exercise real Profile, Ollama, private receipts and CURRENT versioned Staged
MongoDB authoring. They cover no-write review/approval, denied readers, stale
revisions, exact persisted fields, response loss, original inspection, fresh
continuation and restart. See the reproducible commands in
[Standalone Business Actions](../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js#native-authoring-acceptance).
These tests author synthetic identifiers; they do not establish catalogue/book
existence, production publication, customer pricing or browser acceptance.
