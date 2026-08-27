# Customer Engagement in Axis

Customer Engagement gives business teams one lightweight place to review and
act on customer contact requests, testimonials, reviews and ratings, feedback,
and shared operational evidence. Axis does not own those records or decide
their lifecycle. It renders the workspaces, permissions, states, and actions
published by `nodics.engagement` through the Platform BackOffice contract.

## Beginner mental model

Think of Axis as the work desk and Engagement as the case system behind it.
Axis helps an employee find the right work quickly. Engagement validates every
action, stores the authoritative evidence, enforces tenant and permission
boundaries, and coordinates Process or Communication when required.

| Engagement area | Business user need | Axis behavior | Backend authority |
| --- | --- | --- | --- |
| Contact | Receive, classify, assign, and resolve customer enquiries | Domain landing cards, queue view, detail, and state-aware actions | Engagement owns submissions, correspondence, lifecycle, Process handoff, and audit |
| Testimonials | Turn approved customer stories into governed publication candidates | Candidate, consent, editorial, and publication workspaces | Engagement owns consent, editorial versions, eligibility, withdrawal, and publication coordination |
| Reviews and ratings | Moderate reviews fairly and preserve evidence | Review queues, response surfaces, appeal evidence, and aggregate views | Engagement owns authenticity, moderation, immutable publication, response lifecycle, and aggregate rebuilds |
| Feedback and complaints | Capture issues, escalate, resolve, and learn from trends | Classification, assignment, follow-up, and insight presentation | Engagement owns policy, priority, sentiment evidence, complaint lifecycle, and recovery state |
| Governance and automation | Keep sensitive actions reviewable and recoverable | Recommendation and recovery workspaces with safe provider-neutral evidence | Engagement, Process, Communication, and AI governance own execution, providers, approval, and rollback |

Developers should treat every Engagement workspace as a projection of a
backend-owned domain contract. Add lifecycle fields, policies, providers,
permissions, projections, or automation in the owning backend capability, then
extend Axis with typed clients and CMS renderers that consume those contracts.

The Customer Engagement landing page intentionally shows six business domains
instead of every technical workspace:

1. **Contact** for enquiries, correspondence, resolution, and Process handoff.
2. **Testimonials** for candidates, consent, editorial versions, and controlled
   publication.
3. **Reviews & ratings** for moderation, responses, abuse, aggregates,
   acquisition, and syndication evidence.
4. **Feedback** for feedback, complaints, follow-up, surveys, and insights.
5. **Work management** for unified queues, dashboards, and masked export
   previews.
6. **Governance & automation** for repairs, decision support, delivery,
   recovery, and compatibility evidence.

Only domains containing at least one authorized backend-published workspace
appear. Opening a domain selects its first authorized view. Within a domain,
use the compact **Current view** selector instead of scanning a large wall of
duplicated links.

## Business-user journeys

For example, a support employee can start from the Contact domain, resolve one
request, then switch to Feedback without seeing testimonial editorial or review
syndication controls that are irrelevant to that task and role.

### Contact request

Open **Customer Experience → Contact** and choose **Contact Submissions**.
Filter the queue, open a request, and use only the actions offered for its
current state. Assignment, request-information, resolve, close, reopen, and
Process handoff remain backend lifecycle operations. If a handoff fails, open
**Process Handoffs** to inspect retry, dead-letter, and reconciliation evidence.
Do not copy customer correspondence into an internal browser note to work
around an unavailable operation.

### Testimonial

Open **Testimonials** and start with **Testimonial Candidates**. Verify source,
purpose, consent scope, expiry, and withdrawal state before editorial work.
Editorial versions preserve the original submission. Publication is a separate
controlled step and does not follow automatically from approval. If consent is
withdrawn, Engagement removes eligibility and coordinates removal through the
owning publication contract.

### Review and rating

Open **Reviews & ratings** to moderate a review, inspect authenticity and
incentive disclosure, publish an approved immutable version, or add a versioned
business response. Negative sentiment alone is never a valid suppression
reason. Abuse reports and appeals use their dedicated evidence. Aggregates and
public projections are derived and rebuildable; operators reconcile drift from
the authoritative review lifecycle rather than editing totals.

### Feedback and complaint

Open **Feedback** to classify, assign, request information, escalate a
complaint, record follow-up, resolve, confirm, or reopen. Derived topics,
sentiment, priority, and insights remain correctable suggestions with source,
policy, and confidence evidence. A downstream handoff does not transfer
ownership of the original feedback unless an explicitly configured authority
mode says so.

### Unified operations

Open **Work management** when a role spans domains. Unified queues and
dashboards are rebuildable read projections. Batch, export, and repair surfaces
are previews with limits, purpose, reason, masking, expected revisions, and
audit correlation; they do not directly mutate domain records. Return to the
owning domain for the real lifecycle command.

### Automation and recovery

Open **Governance & automation** to review provider-neutral recommendations,
evaluations, delivery attempts, recovery checkpoints, or compatibility
records. AI output cannot directly publish, reject, suppress, or contact a
customer. High-impact outcomes require the backend-declared human review.
Provider payloads, credentials, and raw protected customer content must not be
shown in operational evidence.

## Unauthorized, unavailable, and invalid behavior

An employee sees only workspaces and actions allowed by the authenticated
bootstrap. Hidden or unavailable modules must not leave navigation or a usable
deep link. A direct route without the required capability, context, or
permission fails closed. Revision conflicts require refresh and reconsideration
instead of silently overwriting another operator's work.

If a backend is unavailable, Axis keeps the failure visible and offers a safe
retry or return path. It does not invent a local success state. If Process,
Communication, a provider, search, or cache fails after domain acceptance, the
accepted domain record remains authoritative and recovery proceeds from
persisted handoff, delivery, checkpoint, or reconciliation evidence.

## Responsive and accessible use

On a wide screen, the landing domains use a small card grid. On a narrow screen,
they reflow to one column without horizontal scrolling. Detail pages retain the
same six-domain switcher and one bounded current-view selector. Keyboard users
must be able to reach every card, selector, filter, row, and lifecycle action
with visible focus. Labels, errors, loading progress, empty states, dialogs,
and post-action results must remain understandable without color alone.

Operators should test zoom and reflow, keyboard-only use, focus return after
dialogs, contrast, screen-reader names, loading and error announcements, and
session-lock recovery. Automated scanning is useful but does not replace these
human journeys.

## Administrator and operator checks

Before enabling Engagement for a tenant:

- confirm `nodics.engagement` is registered, active, healthy, and reachable;
- assign the smallest required domain and action permissions;
- verify tenant policies for anonymous intake, consent, retention, legal hold,
  rate limits, attachments, publication, exports, automation, and providers;
- confirm Process and Communication handoffs are configured and observable;
- keep external providers disabled until credentials, sender identity,
  callbacks, residency, monitoring, and rollback pass qualification;
- verify queue age, SLA, projection drift, retries, dead letters, checkpoints,
  privacy propagation, and compatibility alerts;
- rehearse repair, restart, provider outage, and rollback procedures.

## Customize and extend safely

Presentation labels and help may be supplied through backend-owned CMS and
capability metadata. A customer project may add a later-loaded Engagement
module, policy, permission, schema extension, service override, or provider
adapter. Axis may add a typed renderer or client for a newly published contract.

Do not copy Engagement lifecycle logic into React, create a browser-side module
registry, infer permissions from labels, persist customer records in the
browser, or expose generic schema CRUD. Preserve the `nodics.engagement`
functional identity and extend the smallest owning backend capability.

## Common mistakes

- Showing every technical workspace as an equal top-level button.
- Duplicating the same operation in navigation, cards, tabs, and action menus.
- Treating an approved review or testimonial as automatically published.
- Editing aggregates, queues, dashboards, or repair evidence as domain state.
- Retrying an ambiguous provider action without its idempotency evidence.
- Hiding a negative review because of sentiment rather than an allowed policy.
- Treating AI confidence as permission to bypass human review.
- Logging protected customer content, provider payloads, or credentials.
- Claiming production readiness from local mocks or configured RPO/RTO values.

## Verification

Release evidence includes successful and rejected journeys, tenant and
permission isolation, optimistic concurrency, duplicate/replay behavior,
provider and Process failure recovery, consent withdrawal, publication
removal, projection rebuild, repair preview, masked export preview, restart,
responsive and accessibility review, generated contracts, and effective
runtime composition. Production acceptance additionally requires measured
load and soak, penetration testing, backup/restore, failover, RPO/RTO, regional
residency, and external-provider qualification in the target deployment.

Continue with the framework Customer Engagement documentation for domain data,
API, security, lifecycle, customization, and operations contracts.
