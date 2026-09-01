/** @module loyaltyRewardType/config/properties @description Defines loyaltyRewardType schema access policy. @layer config @owner loyaltyRewardType */
module.exports = {
    schemaPolicies: { loyaltyRewardType: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } }
};
