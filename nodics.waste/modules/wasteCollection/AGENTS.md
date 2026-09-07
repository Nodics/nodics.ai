# wasteCollection Agents

`wasteCollection` owns collection point business semantics and accepted material
rules. Location/map/search remain external framework capabilities referenced by
source references.

Every collection point must be associated with at least one enterprise. Use
`operatorEnterpriseRef` for the organization that owns or operates the bin,
centre, recycler drop-off, or receiving point. For legacy or seed imports where
the real operator is not yet confirmed, use the module-owned
`NODICS_WASTE_MANAGEMENT_CO` enterprise contributed by Waste Core data. Use the
Profile `default` platform owner only as a bootstrap fallback.

Collection-centre samples belong in `wasteCollection/data/sample-v001`, but
split import manifest sections by target runtime authority: Profile addresses
to `PLATFORM`, Location records to `LOCATION`, and collection-point records to
`WASTE`. When creating sample data from any source export, clean the records
before committing them so framework samples carry only Nodics-owned fields.
