# nSetup

`nSetup` contains the Core-owned Nodics setup, onboarding, architecture, and development-governance assets shared by all Nodics repositories.

It is physically distributed under `nodics.core/modules` because every Nodics runtime consumes Core, but it is **not** part of runtime module loading.

`nSetup` retains the standard module-shaped files `package.json`, `nodics.js`, and `README.md` so repository tools can identify its ownership and instruction entrypoint.

It is excluded from runtime startup by `package.json` metadata:

```json
{
    "runtimeModule": false,
    "nodics": {
        "runtimeModule": false,
        "loadableByNodicsModuleLoader": false
    }
}
```

It is a setup/instruction package, not a runtime capability.

This folder is intended for project-wide enablement material that should survive beyond temporary refactoring notes. It is not a generated artifact folder and should not be removed by clean/build.

Current contents:

- `llm/`: tool-neutral guidance taxonomy for AI-assisted Nodics development.
  Permanent rules live in `llm/contracts` and `llm/standards`; procedures live
  in `llm/playbooks`; reusable rubrics live in `llm/templates`; historical
  phase/refactor material lives in `llm/records`.
- `package.json`: machine-readable setup package metadata with runtime loading disabled.
- `nodics.js`: no-op lifecycle file retained only for module-shape consistency.
- `config/properties.js`, `config/prescripts.js`, `config/postscripts.js`: no-op config files retained only for module-shape consistency.

## LLM Bootstrap

When starting any AI-assisted Nodics project, ask the LLM to read:

```text
modules/nSetup/llm/ai-enablement-index.md
```

Then ask it to follow the linked principles, standards, playbooks, examples,
and templates before making code changes.

If an AI tool automatically scans the repository, this folder should be treated as the canonical instruction source for Nodics development behavior.

## Runtime Boundary

Do not add runtime module behavior here unless `nSetup` is intentionally promoted into the active module hierarchy with a clear startup contract.

Do not include `nSetup` in server/module startup lists.

Do not place generated build artifacts in `nSetup`.

The config module has a test that protects this rule: `modules/nConfig/test/nonRuntimePackageDiscovery.test.js`.
