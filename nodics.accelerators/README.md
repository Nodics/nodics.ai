# Nodics Accelerators

`nodics.accelerators` composes reusable industry capabilities above standard
Nodics authorities. It is a runtime group and never owns industry business
logic, schemas, APIs, or data directly; concrete accelerator capabilities own
those artifacts below their domain group.

Standard framework groups never depend on this group. Customer projects may
activate the complete group or one child domain group. Read `AGENTS.md`, then
the selected domain and capability guidance before implementation.

The umbrella extends Foundation only. It must not force Commerce or Discovery
into every accelerator runtime. Apparel/Electronics (and Telco through
Electronics) retain Commerce inheritance; Waste scenarios retain Waste
inheritance. Required local schema/implementation dependencies belong to the
selected concrete capability, not a blanket activation gate on Accelerators.

The `nexus` accelerator extends WCMS and separates inert `nexusCore` administration
descriptors from the `nexus.web` reference content pack. Customer runtimes explicitly
select their required contributions; the independent frontend remains outside this
repository. Read [Nexus](modules/nexus/README.md).
