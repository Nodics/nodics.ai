# Module-Owned Data Manifest Contract

Every concrete Nodics module, project, environment, server, or node boundary
that owns system-importable data must own exactly one aggregate manifest at
`data/manifest.json`.

The manifest belongs inside `data/` because it versions, describes, and
protects that boundary's data payload. A repository-root or module-root
`manifest/` directory, and per-type files such as
`data/init/manifest.json`, are not valid for new Nodics-owned data.

## Canonical shape

```text
<owner>/
  data/
    manifest.json
    init/
    core/
    sample/
```

`data/manifest.json` uses aggregate contract version 2:

```json
{
  "contractVersion": 2,
  "module": "owningModule",
  "sections": {
    "init": {
      "kind": "DATA_RELEASE",
      "dataType": "init",
      "version": "1.0.0",
      "description": "Bootstrap records",
      "files": {
        "init/data/example.js": "sha256"
      }
    }
  }
}
```

Sections allow one owner to package different data responsibilities without
creating separate manifest files. Supported kinds are:

- `DATA_RELEASE` for executable `init`, `core`, or `sample` imports;
- `CONTENT_PACK` for immutable generated CMS/documentation releases;
- `SOURCE_CONTRIBUTION` for governed source data that a generator consumes but
  nImport must not execute directly.

Each independently releasable section owns its semantic version, description,
file map, checksum evidence, and kind-specific metadata. Section file paths
must be relative to the containing `data/` directory, remain inside it, and
must not be absolute, traverse with `..`, or resolve through symbolic links.

Every runtime-executable section must additionally declare its data lifecycle
and permitted placement through governed contract fields:

- `owningDomain`: authoritative functional module/domain identity;
- `lifecycle`: `PUBLISHABLE`, `OPERATIONAL_VERSIONED`, or `REFERENCE`;
- `destinationRole`: the runtime role allowed to import the section;
- `environmentScope`: explicit permitted environment classes;
- `sensitivity`: a registered data classification;
- `versioningPolicy`: whether business records are immutable-versioned;
- `publicationPolicy`: `REQUIRED` or `NONE`;
- `initialPublicationPolicy`: for publishable data, normally
  `ADMIN_INITIATED`; startup import must never imply Online publication;
- `removalPolicy`: explicit governed retention, unpublish, retire, or deletion
  semantics; omission from a later release never deletes records.

`PUBLISHABLE` data imports only into a Staged authoring runtime and reaches
Online only through `nPublish`. `OPERATIONAL_VERSIONED` data remains in its
owning runtime and never enters Staged-to-Online publication. `REFERENCE` data
has neither a publishing lifecycle nor artificial business versioning unless
its owning contract explicitly promotes it to another class.

Destination-qualified contributions may be selected for another runtime only
through an explicit manifest contract resolved by nImport. Selection must not
activate the source module's runtime behavior, scan arbitrary packages, or
create a second importer. Test fixtures and expected Online projections are
never runtime-executable manifest sections.

## Ownership and process

- The nearest concrete module or project boundary owns its manifest and data.
- One manifest must never hash or version another module's files.
- Generated sections must be updated by the owning generator; generated
  manifests must not be hand-edited.
- A changed immutable section requires an intentional section version change.
- The aggregate file may contain several sections; changing one section must
  preserve unrelated sections.
- nImport remains the only execution authority. Manifest placement does not
  create another loader or importer.
- Runtime discovery normally considers active modules and executable
  `DATA_RELEASE` sections. An explicitly selected destination-qualified
  contribution may be discovered without source-module runtime activation only
  when its manifest identity, owner, destination, compatibility, checksum,
  dependency, environment, and security policy all qualify through nImport.
- Content-pack configuration must identify both `data/manifest.json` and its
  `manifestSection`.

## Compatibility

The framework may read legacy per-type or root-level manifests during a
bounded migration period so released customer projects do not fail abruptly.
All active Nodics-owned modules, generators, examples, and project templates
must use contract version 2. Compatibility is a consumer safeguard, not
permission to create new legacy manifests.

## Compliance

Structure validation must fail when an active Nodics-owned boundary contains
system data but lacks `data/manifest.json`, contains a manifest outside its
data root, uses a mismatched module identity, has an unsupported section kind,
or leaves per-type manifests in `data/init`, `data/core`, or `data/sample`.
Test fixtures and server-owned runtime staging directories are excluded because
they are test/runtime evidence rather than published module data.
