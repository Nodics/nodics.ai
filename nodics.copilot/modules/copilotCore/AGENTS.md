# copilotCore Agents

Trigger proposals require explicit verbs, literal trigger/instance identities
and explicit activation/context choices. Keep their exchanges out of provider
history. Native manage/execute permissions and the configured Workflow target
filter the planner catalogue; the model cannot choose routes or execute commands.
Run the trigger action/live suites when changing this dispatch path.

Natural-language preparation follows `llm/examples/natural-language-preparation.md`.
Human task proposals require an explicit command verb, exact task/assignee tokens
and explicit approved true/false evidence; never interpret complete as approve.
Keep task exchanges out of later provider history and retain deterministic
validation, reviewed confirmation and native Workflow receipt recovery.
Offer only current permission-filtered preparers; validate untrusted JSON and
literal human-input evidence before creating a review. Use the existing provider
usage ledger, never direct model transport, executable output or hidden fallback.
Run intent-planning, Workbench and phase acceptance tests together.
Product proposals reuse Request's bounded command validator and the existing
Product/PriceRow preparer. Require explicit count and active choice from model
output; preserve exact decimal strings. Recheck current policy and target before
each native Product/PriceRow call. Do not reinterpret update/delete requests as
product creation. Native draft persistence does not prove reference existence
or publication. Run the opt-in Product/Pricing live tests for owner integration.

Operation-access explanations are inert initial-prerequisite diagnostics, not
authorization or another capability registry. Preserve source privacy, missing
grant precedence, explicit unimplemented adapters and `OWNER_CHECK_REQUIRED`
instead of an authorized/ready claim. Read
`llm/examples/operation-access-and-remediation.md` and run its focused test.

Provider history admits only explicitly eligible messages. Live exchanges and
legacy unmarked messages are excluded even with recording enabled. Never infer
current data access from a prior answer or retry failed live queries via a model.
Read Knowledge's `llm/examples/live-evidence-conversation.md`.

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

- Confirmed Product/PriceRow creation uses the owning canonical schema PUT API
  through `createOwnedSchemaRecord`; do not fallback to Workbench mutations.
  Preserve remote target authority, tenant, confirmation, policy and idempotency
  key forwarding. Forwarding does not provide durable replay protection.

Use copilot.api.enabled as the sole conversation API switch; reject retired group/core flags and preserve independent provider, source and permission gates.
