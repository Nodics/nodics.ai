/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/records/groups/commercePublicationStarterGroupData
 * @description Starts publication review with the original human token; no definition reads, decisions or management.
 * @layer data
 * @owner profile
 * @override Preserve narrow Process grants and ordinary Employee ancestry.
 */
module.exports = {
  commercePublicationStarter: {
    code: "commercePublicationStarterUserGroup",
    name: "Commerce Publication Starter",
    active: true,
    parentGroups: ["employeeUserGroup"],
    permissions: ["process.instance.start"],
  },
};
