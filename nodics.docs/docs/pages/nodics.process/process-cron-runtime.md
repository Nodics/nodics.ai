# Process and Cronjob Shared Runtime

Workflow and cronjob can run together in one runtime server when a partner
wants a smaller topology. This is useful for local development, small
installations, or customers who want business process automation and scheduled
jobs without running many microservice processes.

## The key rule

Shared runtime does not mean shared ownership.

| Concern | Owner |
| --- | --- |
| Process definitions | `nodics.process` |
| Published workflow versions | `nodics.process` |
| Runtime instances and tasks | `nodics.process` |
| Trigger relationship metadata | `nodics.process` |
| Cron job definition | `nodics.process/modules/cronjob` |
| Scheduler firing and retries | `nodics.process/modules/cronjob` |
| Domain business action | Domain module |
| UI rendering | `nodics.axis` |

## Example topology

```mermaid
flowchart LR
  ProcessServer["processServer"] --> Core["includes nodics.foundation"]
  ProcessServer --> Process["extends nodics.process"]
  Process --> Workflow["loads workflow"]
  Process --> CronJob["loads cronjob"]
  Workflow --> Trigger["processTrigger metadata"]
  CronJob --> Job["cronJob execution"]
  Trigger -.references.-> Job
```

The trigger can reference a Cron job code. It does not become the Cron job.
Cronjob still decides when the job fires. When a cronjob-owned job wants to
start a process, it declares a `jobDetail.processTrigger` target. The cronjob
trigger pipeline then calls the Process trigger executor with a service identity,
correlation id, schedule context, and job evidence. Process verifies the
trigger is active, starts the workflow instance, and records audit events.

## Why this is attractive for partners

Partners often start with one server for operational simplicity. Later they may
split runtimes when scale, isolation, or team ownership requires it. Nodics
should support both without changing functional module identity.

This keeps the mental model stable:

- Process console shows workflows and automation relationships.
- Cronjob console shows jobs and scheduler behavior.
- Axis can place both under "Business Process & Automation".
- Backend ownership still protects maintainability.

## Safe lifecycle behavior

Process can be registered, activated, deactivated, and deregistered through the
module registry. Process APIs and cronjob controls are projected from the same
functional module registration, while module ownership still remains separate.

The local acceptance smoke proves this by exercising Process registration and
verifying that both `workflow` and `cronjob` appear as technical modules.

## Cron job handoff shape

A Cron job that starts a Process workflow should look declarative. It should not
embed workflow logic or call arbitrary code when the intent is scheduled
automation.

```js
{
  code: 'dailyContentApprovalJob',
  tenant: 'default',
  trigger: { expression: '0 10 * * *' },
  jobDetail: {
    processTrigger: {
      triggerCode: 'dailyContentApproval',
      context: {
        businessDateMode: 'CURRENT_DAY'
      }
    }
  }
}
```

That shape keeps the responsibilities readable:

- Cronjob reads the schedule and fires the job.
- Cronjob passes `cronJobCode`, tenant, schedule expression, and correlation
  evidence into Process.
- Process loads the active trigger relationship.
- Process starts the published workflow version.
- Process writes `process.trigger.execution.*` and instance audit events.

If `nodics.process` is not loaded in the same runtime, the Cron job fails closed
with a dependency error instead of silently pretending the automation ran.

## Continue

- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)
- [DevOps and Runtime Topology](devops-topology.md)

## Common mistakes

- Confusing shared runtime composition with merged functional ownership.
- Starting duplicate schedulers or registering the same trigger through parallel Process and Cron authorities.

## Verification

Prepare processServer, confirm `nodics.process` is observed once with `workflow` and `cronjob` technical modules, execute a scheduled trigger with correlation evidence, and verify no standalone cronjob listener is required.
A beginner developer should confirm this shared runtime before adding another server.
