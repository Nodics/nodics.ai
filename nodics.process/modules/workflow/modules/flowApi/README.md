# Workflow API

`flowApi` is the workflow technical module that owns secured Process HTTP APIs.

It exposes process definition and designer contracts under the `/nodics/process/v0` API family by using the `process` route prefix.

Do not place persistence schemas or engine logic here. Delegate to `flowCore` services and keep schema ownership in `flowSchema`.
