# Nodics Release Contract

Nodics release work flows from `development` to `master`. Feature and fix work
lands on `development`; `master` represents the released framework state.

## Release gate

Before promoting a release, run the release gate:

```bash
npm run release:check -- --execute
```

The gate must include syntax, copyright, documentation, ownership, AI context,
test suites, and dependency checks such as:

```bash
npm audit --omit=dev
```

## CI policy

GitHub Actions must delegate to repository scripts instead of duplicating
release logic. The repository scripts remain the source of truth so local,
CI, and partner validations stay aligned.

## Release notes

Every release must document changed modules, compatibility impact, migration
steps, security considerations, and operator actions.
