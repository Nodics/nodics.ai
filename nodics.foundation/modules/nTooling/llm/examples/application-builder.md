# Application Builder Examples

The beginner path should feel like this:

```text
What are you building?            Telco commerce storefront
Project name?                     acme-mobile
Market, locale, currency?         AE, en-AE, AED
Frontends?                        Agora storefront + Axis BackOffice
Sample data?                      Yes, local demo catalogue
Output folder?                    /workspace/generated/acme-mobile

Builder explains:
- Backend: Telco with Electronics, Commerce, and Foundation dependencies.
- Storefront: Agora Telco composition.
- Customer data: agora.telco.
- Qualification: generated skeleton first, reference runtime evidence optional.
- Next command: create and review the plan.
```

For command-line automation, save those answers as JSON and run:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:questionnaire \
  --exp=/workspace/nodics.exp \
  --kickoff=/workspace/nodics.kickoff \
  --output=/workspace/answers/acme-mobile.json \
  --dry-run=true
```

`builder:questionnaire` asks each question one at a time. It writes prompts to
stderr and JSON to stdout, so a terminal user sees the questions while scripts
can still parse the structured result.

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:answers-template \
  --exp=/workspace/nodics.exp \
  --kickoff=/workspace/nodics.kickoff \
  --project-code=acmeMobile \
  --customer-code=acme \
  --display-name="Acme Mobile" \
  --preset=telco \
  --country=AE \
  --locale=en-AE \
  --currency=AED \
  --frontends=AGORA,AXIS \
  --sample-data=true \
  --output=/workspace/answers/acme-mobile.json \
  --dry-run=true
```

The command above creates a valid guided answers document and, when
`--dry-run=true` is supplied, immediately returns the read-only dry-run
projection. It still does not generate an application.

After the answers are saved, create a review pack:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:guide \
  --exp=/workspace/nodics.exp \
  --kickoff=/workspace/nodics.kickoff \
  --answers=/workspace/answers/acme-mobile.json \
  --workspace=/workspace/reviews/acme-mobile
```

`builder:guide` returns the full solution, the approval-required plan, and
beginner next steps. With `--workspace`, it also writes a review-only folder
containing:

- `guided-answers.json`
- `solution.json`
- `generation-plan.json`
- `beginner-summary.md`
- `builder-guide-report.json`

These are review artifacts, not generated application projects. The plan is
still `PENDING` and must be approved before `builder:generate`.

Before approval or generation, a new user can ask for a no-write dry run:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:dry-run \
  --exp=/workspace/nodics.exp \
  --kickoff=/workspace/nodics.kickoff \
  --answers=/workspace/answers/acme-mobile.json
```

For a Telco preset, the dry run explains that Telco is the active customer
experience, Electronics is resolved as backend behavior, and only
`agora.telco` data pack is selected unless the user asks
for Electronics or Combined.

The low-level command path still exists for auditability. From the `nodics.ai`
repository root, either use `--exp` to resolve Agora from the frontend workspace
catalogue or pass `--agora` directly:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:discover \
  --exp=/workspace/nodics.exp \
  --kickoff=/workspace/nodics.kickoff
```

Validate a solution without changing any repository:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:validate \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --solution=/workspace/solutions/acme-telco.json
```

Create an approval-required plan:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:plan \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --solution=/workspace/solutions/acme-telco.json
```

A Telco solution selects `telco`; discovery and planning resolve `electronics`,
`nodics.commerce`, and `nodics.foundation` transitively. Its Agora composition
and Kickoff data pack must also exist. The plan lists proposed relative
operations and writes nothing. Save that JSON, then bind an external approval
reference:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:approve \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --plan=/workspace/plans/commerce-plan.json \
  --approval-reference=CHANGE-1234
```

After saving the approved JSON, WP-B4 can generate Commerce-only or Apparel into
an absent absolute test root:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:generate \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --solution=/workspace/solutions/commerce.json \
  --plan=/workspace/plans/commerce-approved.json \
  --output=/workspace/generated/reference-commerce
```

After generation, start with the generated handoff:

```bash
cd /workspace/generated/reference-commerce
cat README.md
cat builder-handoff.json
npm test
npm run verify:runtime
```

`README.md` is for the beginner. `builder-handoff.json` is the
machine-readable summary for future Builder, AI, or CI workflows.

The same approved workflow supports Electronics, Telco, and Combined solutions.
Telco resolves Electronics in its backend graph but generates the Telco Agora
composition and Telco customer data pack. Combined generates the exact union of
Apparel, Electronics, and Telco contributions.

Generated output is self-contained enough to boot its generated backend and
Agora storefront probes:

```bash
cd /workspace/generated/reference-combined
npm test
npm run verify:runtime
```

Qualify a generated output after generation:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:qualify \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --solution=/workspace/solutions/combined.json \
  --plan=/workspace/plans/combined-approved.json \
  --output=/workspace/generated/reference-combined \
  --reference-evidence=/workspace/actionsRepo/Agora/nodics-multi-domain-qualification-evidence-2026-08-15.md
```

Without `--reference-evidence`, the lock is qualified only as
`FULL_GENERATED_APPLICATION` when generated self-tests and runtime probes pass.
With reference evidence, the report also links the prior fresh-database
nine-runtime qualification. Reference evidence complements generated runtime
proof; it does not replace the generated backend/storefront probes.
Qualification writes `qualification/builder-qualification-report.json` for
machine evidence and `qualification/builder-qualification-summary.md` for the
beginner-readable state, scope, passed gates, failed diagnostics, handoff
artifacts, and next commands.

Create a local digest-bound release manifest from an approved target plan:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:release-manifest \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --solution=/workspace/solutions/apparel.json \
  --plan=/workspace/plans/apparel-approved.json \
  --release-channel=LOCAL_BUILDER
```

Plan an upgrade from an existing generated lock to that target release:

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js builder:upgrade-plan \
  --agora=/workspace/nodics.exp/nodics.agora.apparel \
  --kickoff=/workspace/nodics.kickoff \
  --current-lock=/workspace/generated/reference-commerce/solution-lock.json \
  --release=/workspace/releases/apparel-release.json \
  --solution=/workspace/solutions/apparel.json \
  --plan=/workspace/plans/apparel-approved.json
```

Upgrade planning is non-mutating. It compares locks, packages, data packs, and
release digests, then emits the safe operations that a later approved upgrade
executor would perform.
