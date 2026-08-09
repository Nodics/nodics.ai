# Process QA and Regression Guide

Process automation touches business operations, so small bugs can become noisy
in production. QA must test both the happy path and the boundaries.

## Minimum backend regression

Run the Process contract suite:

```bash
cd nodics.ai/nodics.process
npm test
```

This validates module structure, secured routes, permission catalog coverage,
generated schemas, graph validation, definition lifecycle, operation inspection,
runtime lifecycle, trigger execution, and action adapter blocking.

## Fresh database acceptance

From the reference customer project, run the fresh local acceptance when you
need evidence that bootstrap, imports, module registration, Axis content, and
runtime servers still cooperate:

```bash
cd nodics.kickoff
npm run acceptance:local:fresh
```

This is heavier than unit tests, but it catches integration drift.

## Manual Axis smoke checklist

1. Login to Axis.
2. Open Business Process & Automation.
3. Create a sample draft.
4. Save a graph change in Designer.
5. Validate the draft.
6. Publish the draft.
7. Start an instance.
8. Claim and complete a task.
9. Create a scheduled trigger relationship.
10. Activate and execute the trigger.
11. Confirm a new instance appears.
12. Open the timeline and verify audit evidence.

## Negative tests that matter

- Unknown action adapter must fail.
- Paused or archived trigger must not execute.
- Draft definition must not start.
- Archived trigger must not update.
- User without Process permission must be denied.
- Axis refresh must not be required after every operation.

If these fail, stop and fix the contract before adding more UI.

