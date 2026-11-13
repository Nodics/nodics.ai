# nPublish AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nPublish` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

`publicationRequest` and `publicationAudit` support secured generic read/search
only. Their `backoffice` read-only contract denies generic HTTP mutations;
authoritative lifecycle/repository services retain internal updates. Never let
generic CRUD manufacture approval, Online state or transition evidence. Verify
the existing authority test and lifecycle/atomicity suites when changing this
boundary; a domain retry must read or reuse the existing publication authority.


If a qualified withdrawal loses its target response, inspect the exact request.
For example, the original WITHDRAWING revision 6 and subsequent FAILED revision 7
retain one journal command key ending `:withdraw:6`. Send the inspected expected
revision 7 to the existing authorized retry API. nPublish resumes WITHDRAWING at
revision 8 while passing that same original key; it does not validate, approve or
activate content. A lost terminal response requires another read before action.
Do not resubmit a terminal request merely because its earlier response was lost.
Missing legacy command proof requires owner review, never a replacement journal
entry, database repair, fresh key or fabricated lifecycle revision. Permissions,
scoped runtime credentials and normal approval rules remain independently required.


For a declared retry, open the original request/source and read its current owner
inspection. Intersect `operatorOperations` with the current permission-filtered
navigation action. Prepare with another GET, review its unchanged request and
publication revision, then explicitly POST that expected revision to the declared
retry route. A VALIDATED result is revalidation, not approval or Online delivery.
For rollback, display the retained predecessor and use the same inspected CAS
revision. An older request whose version is no longer current has no qualified
rollback control. After response loss, refresh and inspect before preparing again;
never automatically POST, resubmit, approve or construct a new publication key.

Qualified Online request inspection checks the current target even when the
request has no retained predecessor. A superseded or withdrawn first publication
remains readable history; its stored ONLINE state is not current delivery proof.
Unknown/negative target evidence holds recovery. This read-only presentation adds
no lifecycle transition or permission. Customize provider evidence through the
existing contract, not caller flags or replacement history.
