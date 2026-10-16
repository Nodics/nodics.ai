# Nodics Accelerators

`nodics.accelerators` composes reusable industry capabilities above standard
Nodics authorities. It is a runtime group and never owns industry business
logic, schemas, APIs, or data directly; concrete accelerator capabilities own
those artifacts below their domain group.

Standard framework groups never depend on this group. Runtime composition may
load the complete group or one child domain group. This is loader composition,
not a business activation switch: the umbrella declares no functional-module
identity in the Axis Module Registry. Individual applications use Setup &
Accelerators and declare their actual required capabilities, such as Commerce
or Waste. Import, permissions, readiness, and publication remain owner-governed.
Read `AGENTS.md`, then
the selected domain and capability guidance before implementation.

Circa and Agora reference modules in Kickoff contain optional demo data, assets
and inert composition. They must not implement reusable accelerator behavior,
define access rights, or repair grants at startup. Each implementing capability
owns its permission vocabulary and standard business access mappings in explicit
data packs administered through Profile and Axis. Demo identities and assignments
reference those definitions without copying them. The same separation applies
to every accelerator; genuine partner projects may still implement their own
customer-specific extensions.

The umbrella extends Foundation only. It must not force Commerce or Discovery
into every accelerator runtime. Apparel/Electronics (and Telco through
Electronics) retain Commerce inheritance; Waste scenarios retain Waste
inheritance. Required local schema/implementation dependencies belong to the
selected concrete capability, not a blanket activation gate on Accelerators.

The `nexus` accelerator extends WCMS and separates inert `nexusCore` administration
descriptors from the `nexus.web` reference content pack. Customer runtimes explicitly
select their required contributions; the independent frontend remains outside this
repository. Read [Nexus](modules/nexus/README.md).
