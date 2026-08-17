# Nodics Accelerators

`nodics.accelerators` composes reusable industry capabilities above standard
Nodics authorities. It is a runtime group and never owns industry business
logic, schemas, APIs, or data directly; concrete accelerator capabilities own
those artifacts below their domain group.

Standard framework groups never depend on this group. Customer projects may
activate the complete group or one child domain group. Read `AGENTS.md`, then
the selected domain and capability guidance before implementation.
