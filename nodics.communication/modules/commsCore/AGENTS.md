# commsFoundation Agent Contract

Keep canonical notification guidance in the selected v002 CMS source record pack,
not only README contracts. Preserve sealed v001 files and business-release bytes.
Successor technical summaries must reference the selected sourcePath, not the
sealed predecessor; update dependent checksums and test the rendered reference.
Transfer, coupon, auction and gift dispatch adapters revalidate exact Profile
recipients; selected Employees use the existing inbox namespace, never fabricated
Customer ownership. Source/unit integration is not installed or live acceptance.

Source-dependent messages use the existing durable intent and the fixed
`communication.dispatchEligibilityOwners` map. Preserve its frozen intent bit
and metadata-only source/recipient-bound checks before claim and before send;
missing owners fail closed. Never retarget rendered messages, add a parallel
outbox, or couple domain value movement to transport outcomes. See
[durable outcome delivery](llm/contracts/durable-outcome-delivery.md).

Follow the root Nodics AI agent contract before changing this boundary:

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the Communication group contract: `../../AGENTS.md`.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

Preserve tenant isolation, idempotency, content-free events, provider neutrality, secured callbacks, and domain ownership. Do not use archived Notify code as authority. Update source, tests, documentation, and generated evidence together.

Uncertain-outcome reconciliation must recognize an exact recorded revision/action/
reason/operator replay as read-only, returning current owner state even after a
lost acknowledgement. It must never append another decision or authorize/send
again. Changed commands still conflict. Preserve source admission and attempt caps.

Malformed Telegram acknowledgement shapes remain `UNCERTAIN` / `TELEGRAM_UNCERTAIN`;
never infer no-send or retry automatically from null, primitive or array JSON.
Only failed destination invocation before transport may return the fixed
`DESTINATION_RESOLUTION_FAILED` retry-pending outcome; retain historical uncertainty.

Follow [template resources](llm/contracts/template-resources.md) before changing
rendering. Use module-owned `src/templates` files, indexed/raw discovery, typed
escaped parameters and immutable private rendered content. Do not put HTML in
configuration, activate domain services for files or add a second template/module
registry. Keep legacy text compatibility and override evidence.
