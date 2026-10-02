# Email Provider Agent Contract

## Inheritance

- Root authority: `../../../AGENTS.md`.
- Communication authority: `../../AGENTS.md`.
- Global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Follow the repository and Communication ancestor AGENTS contracts and the nSetup
coding, configuration, documentation and ownership rules. Keep this existing
provider as the sole owner of SMTP transport. Profile requests intents; Axis does
not hold credentials or SMTP logic. Preserve the injected sandbox interface.

SMTP mode is disabled by default, explicitly configured, test-recipient restricted
and not production-qualified. Use existing runtime/secure secret references and
the Communication sender reference. Keep TLS verification, tenant/lease checks,
content bounds, no file/URL access, and content-free evidence. Never convert an
uncertain send into an automatic resend or claim inbox delivery from SMTP acceptance.

Runtime and configured value changes require focused tests, nearest README and
contract updates, and the canonical provider runbook. Default plus later-layer
customization evidence is mandatory. No live secret or recipient dataset belongs
in the repository. Tests may run ephemeral loopback-only SMTP fixtures with fake
content; that does not qualify Gmail or any production provider.
