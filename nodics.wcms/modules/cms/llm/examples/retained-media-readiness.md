# Retained Media Readiness

Inspect the existing exact Online publication without invoking any command:

```js
const evidence = await SERVICE.DefaultCmsMediaDependencyReadinessService
    .inspect(publication, request);
```

The publication must have its real retained target manifest. CMS validates each
declared pinned asset against Media's retained metadata and physical bytes.
The default provider reads pointer batches before and after those checks; an
overlay without `getOnlineVersions` retains the original single-asset protocol.
The request's tenant and independently bound internal target remain unchanged.

An owner failure can project `status: 'UNAVAILABLE'`, `qualified: false`, a fixed
`inspectionStage` and a sanitized `ownerErrorCode`. It never exposes the original
exception, provider URL, credential, private path or repair command. A changed
final pointer yields `ACTIVATION_CHANGED` for that asset and removes its byte
qualification. No status read approves a task, repairs storage or rebases pins.

CMS `ONLINE` plus incomplete asset evidence remains
`MEDIA_DEPENDENCIES_PENDING`. Explicit coordinated publication may submit only
the missing exact Media operations through their existing authorization and
Process approvals. Re-read readiness after those owner operations finish.
