/** @module loyaltyProgram/config/properties @description Defines loyaltyProgram schema access policy. @layer config @owner loyaltyProgram */
module.exports = {
    schemaPolicies: { loyaltyProgram: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } }
};
