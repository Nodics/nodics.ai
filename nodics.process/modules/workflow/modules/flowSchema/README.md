# Workflow Schema

`flowSchema` is the workflow technical module that owns process persistence contracts.

It defines schemas and stable status/error vocabulary for:

- process definitions;
- immutable process definition versions;
- process instances;
- process tasks;
- process audit events.

Do not place HTTP routes or lifecycle engine logic here. API projection belongs in `flowApi`; validation and lifecycle services belong in `flowCore`.
