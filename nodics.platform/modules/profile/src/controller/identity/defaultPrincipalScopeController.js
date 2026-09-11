/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/controller/defaultPrincipalScopeController @description Projects the authenticated principal's effective Profile scopes without accepting caller-selected identities. @layer controller @owner profile @override Preserve authenticated identity and Profile-owned resolution. */
module.exports = {
  /** Resolves only the authenticated human's current scope assignments. */
  mine: function(request, callback) {
    const auth = request.authData || {};
    const promise = Promise.resolve().then(() => {
      if (auth.tokenType !== 'access' || auth.principalType !== 'human' || !auth.loginId) throw new CLASSES.NodicsError('ERR_AUTH_00003','A human access token is required');
      return SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes({tenant:request.tenant,authData:auth});
    }).then(data=>({code:'SUC_PRFL_00000',data}));
    return callback ? promise.then(result=>callback(null,result)).catch(callback) : promise;
  }
};
