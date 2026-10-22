# Waste Carbon Agent Contract

Follow the repository root contract at `../../../AGENTS.md`, the Waste parent contract at `../../AGENTS.md`, and global guidance at `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`. Read `README.md` and `llm/contracts/README.md` before editing.

Own waste-derived credit evidence, original-beneficiary allocations and exact lot holdings. Impact calculation, certificates, rewards, Digital manifests and Payment remain separate owners. Never mint from estimates or relabel rewards. Use generated persistence through DefaultWastePersistenceService, tenant context and optimistic revisions. Operations and allocations live in the lot document so a transfer never exposes an unpaired debit/credit.

Only qualified, configured provider services may supply authoritative lot and eligibility evidence. No caller paid/issued/transferable flag, customer-selected provider or synthetic fallback. Preserve allocations after certificate transfer or consumption. External adapter qualification and live acceptance are separate from focused unit verification. Do not add retirement or conversion flows.

All defaults belong in config/properties.js. Program, original beneficiary, units, precision, quantity, shares and evidence are governed records. Keep routes service-only for mutations; calling Digital/Profile owners authorize the human and acting owner first, and this owner rechecks service permission, tenant and exact holding ownership.

Lifecycle, allocation-kind, operation and eligibility wire definitions belong to
this owner's `src/utils/enums.js`; runtime consumers use loaded `ENUMS` values.
Preserve existing wire strings and explicit transition/permission guards. Adding
an enum member is not authority to add a transition. Unit fixtures must construct
the contributions with nConfig's real Enum constructor.
The transition dispatcher must reject unsupported actions even when the caller
has a matching permission. Reuse nCommon `exactAmount` through the effective
`amount()` accessor; this owner retains quantity admission and fixed-scale presentation.

TRANSFERRED quantity remains recipient-reserved until original-key finalize persists COMPLETED. Never equate lookup with finalization, release transferred holdings, or allow onward reservation during partial bundle delivery. Digital finalizes only after all transfer checkpoints; Carbon checks original terms and finalization permission. Test lost acknowledgements, CAS races, mixed manifests and duplicate finalization.

Native persistence acceptance must remain owner-local, opt-in and isolated to a random database on an explicitly supplied
credential-free loopback replica set. It may use clearly labelled synthetic evidence to test persistence and recovery but
must keep external issuance, registry eligibility and external transfer explicitly unqualified. Permission import tests
use the actual release files and Foundation admitted dispatch without creating Profile assignments.

Participant reads use DefaultWasteCarbonReadAccessService and the existing Profile /customer/identity or /identity/scopes/me API with the unchanged access credential. Do not infer customer identity from loginId, accept a browser owner as authority, broaden Enterprise scopes to a parent, or reuse a service credential for a human read. Preserve explicit denies, current tenant/Enterprise binding and no-store/private read routes. Profile transport defaults belong here, not in a frontend or runtime composition module.
