# Workflow Core

`flowCore` is the workflow technical module that owns backend process behavior.

It contains:

- graph validation;
- process definition draft lifecycle;
- publication/versioning services;
- future runtime execution, retry, task, audit, and compensation services.

Do not expose HTTP routes here. Route/controller/facade projection belongs in `flowApi`.
