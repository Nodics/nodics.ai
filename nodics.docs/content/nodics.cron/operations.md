# Cron operations

Cron is the Nodics optional functional module for scheduled and manually
triggered backend work. It extends Core and contributes the `cronjob`
technical module. A project registers Cron when it needs scheduled jobs,
background maintenance, retries, cleanup, synchronization, or other timed
business processes.

## Why Cron is optional

Core, Platform, and WCMS are mandatory for Axis-driven onboarding and governed
content. Cron is different. Many deployments do not need scheduled work on day
one, so Cron should appear in the module registry as an optional functional
module when a cron runtime is live. Registering or activating Cron persists
project intent; restarting servers should not ask the same registration
question again.

## Ownership model

Cron owns scheduler mechanics, lifecycle routes, persisted job definitions,
runtime containers, execution state, logging, events, and failure handling.
The server hosts Cron, but the server is not the functional owner. Node
placement fields decide where a job may run; they do not create another module
identity.

Customer jobs belong in project modules. Reusable scheduler behavior belongs
in `nodics.cron`. If a partner needs custom scheduling behavior, they may
create a customer extension module that loads after Cron and overrides the
approved service contract.

## Job lifecycle

A job definition normally describes:

- job code and active state;
- schedule, start, optional end, and trigger type;
- handler or target module operation;
- tenant, enterprise, and node placement;
- retry, timeout, priority, and overlap expectations;
- last execution status and safe operational evidence.

Cron supports create or register, update, run, start, stop, pause, resume, and
remove through secured backend operations. Manual run and scheduled execution
must share the same tenant, permission, node, logging, and failure contracts.

## Production safety

Scheduled jobs are deceptively simple. A timer firing every minute is easy;
making it safe in production is the real work. Jobs that change external state
must define idempotency keys, duplicate-run policy, timeout behavior, retry
safety, compensation or reconciliation steps, and alerting.

Multi-node deployments must treat scheduler memory as disposable. Persisted
job definitions are authoritative; in-memory schedules are rebuilt from
runtime state. Node failover can help, but it is not a universal exactly-once
guarantee. Network partitions, process termination, downstream timeouts, and
uncertain completion must be handled by the job contract.

## Security model

Cron lifecycle routes require authentication and authorization. A human may
authorize a Cron operation, but the job itself must use governed internal
service-token flow when calling another module. Do not accept arbitrary URLs,
service names, credentials, executable code, or node identifiers from
untrusted request data.

## DevOps model

Operations teams should monitor scheduler readiness, active job count, due
jobs, started jobs, completed jobs, failed jobs, skipped jobs, schedule delay,
duration, retry count, overlap denial, temporary ownership, node handoff, and
downstream latency. Logs should carry tenant, enterprise, job code, trigger
type, assigned node, attempt, correlation identity, and safe outcome.

Before production use, every real job should have tests for schedule boundary,
manual run, unauthorized access, cross-tenant access, duplicate execution,
timeout, retry, partial failure, restart, drain, node loss, node return,
downstream recovery, idempotency, and reconciliation.

## Axis and BackOffice view

Axis should show Cron as a functional module, not as every internal technical
schema. Once registered and active, Cron-owned navigation and workbench
capabilities can appear through BackOffice and WCMS data just like other module
capabilities. Axis remains the renderer; Cron remains the runtime authority.
