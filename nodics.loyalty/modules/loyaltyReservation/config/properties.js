/** @module loyaltyReservation/config/properties @description Defines default reservation policy for reward holds. @layer config @owner loyaltyReservation @override Project layers may shorten or lengthen holds. */
module.exports = {
    schemaPolicies: { loyaltyReservation: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    loyalty: {
        reservations: {
            ttlSeconds: 900
        }
    }
};
