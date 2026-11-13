/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryConfig/controller/defaultDiscoveryConfigurationReadController @description Adapts two fixed internal reads without accepting payload identity or execution targets. @layer controller @owner discoveryConfig */
module.exports = {
    /** Reads current index configuration. @param {Object} request Authenticated request. @param {Function} [callback] Pipeline callback. @returns {Promise|undefined} Read result. */
    readIndex: function(request,callback) {return this.read(request,callback,'readIndex');},
    /** Reads current query profile. @param {Object} request Authenticated request. @param {Function} [callback] Pipeline callback. @returns {Promise|undefined} Read result. */
    readQueryProfile: function(request,callback) {return this.read(request,callback,'readQueryProfile');},
    /** Preserves trusted middleware identity and rejects payload tenant substitution.
     * @param {Object} request Authenticated request.
     * @param {Function} callback Optional pipeline callback.
     * @param {string} operation Fixed controller-selected operation.
     * @returns {Promise|undefined} Read result.
     * @throws {Error} Rejected promise for mismatched tenant or owner failure.
     */
    read: function(request,callback,operation) {
        const promise=Promise.resolve().then(()=>{
            const body=request.body||{};
            if (body.tenant!==undefined && body.tenant!==request.tenant) throw new Error('Discovery tenant mismatch');
            return SERVICE.DefaultDiscoveryConfigurationReadService[operation]({tenant:request.tenant,authData:request.authData,query:body.query});
        });
        if(callback){promise.then(value=>callback(null,value),error=>callback(error));return;}
        return promise;
    }
};
