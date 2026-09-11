/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/controller/defaultCustomerBrowserSessionController
 * @description Maps customer-only secure browser sessions and external link commands into Profile; selects policy server-side and never exposes refresh credentials.
 * @owner profile @layer controller
 * @override Later controllers may decorate responses without weakening origin, cookie, proof or principal checks. Methods mutate cookies and delegate owner persistence; failures use standard callbacks.
 */
module.exports = {
  /** Pins customer cookie policy before validating browser origin. @param {object} request Trusted HTTP envelope. */
  prepare: function (request) {
    request.browserSessionPrincipalType = "Customer";
    request.httpResponse?.setHeader("Cache-Control", "no-store");
    const sessions = SERVICE.DefaultBrowserSessionService;
    sessions.validateOrigin(request, sessions.config(request));
  },
  /** Maps only external application and proof fields; identity remains verified by Profile. */
  externalRequest: function (request) {
    const body = request.httpRequest.body || {};
    return {
      entCode: request.entCode,
      tenant: request.tenant,
      authData: request.authData,
      applicationCode: body.applicationCode,
      proof: body.proof,
      loginId: body.loginId,
    };
  },
  /** Validates public launch data without issuing a browser session or exposing a linked account. */
  launch: function (request, callback) {
    return this.respond(
      SERVICE.DefaultExternalIdentityService.launch(
        this.externalRequest(request),
      ),
      callback,
    );
  },
  /** Provides a verified source recipient to an authenticated customer's backend adapter. */
  origin: function (request, callback) {
    return this.respond(
      SERVICE.DefaultExternalIdentityService.origin(
        this.externalRequest(request),
      ),
      callback,
    );
  },
  /** Resolves a link destination only on the dedicated service-authenticated route. */
  destination: function (request, callback) {
    const body = request.httpRequest?.body || {};
    return this.respond(
      SERVICE.DefaultExternalIdentityService.destination({
        tenant: request.tenant,
        entCode: request.entCode,
        authData: request.authData,
        linkCode: body.linkCode,
        recipientId: body.recipientId,
      }),
      callback,
    );
  },
  /** Starts a customer session from the existing password authentication facade. */
  authenticate: function (request, callback) {
    const operation = Promise.resolve()
      .then(() => {
        this.prepare(request);
        const body = request.httpRequest.body || {};
        request.loginId = body.loginId;
        request.password = body.password;
        return FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(
          request,
        );
      })
      .then((authentication) =>
        SERVICE.DefaultBrowserSessionService.start(
          request,
          authentication.result,
        ),
      );
    return this.respond(operation, callback);
  },
  /** Restores only a customer refresh session; separate cookies prevent employee/customer replacement. */
  restore: function (request, callback) {
    return this.respond(
      Promise.resolve().then(() => {
        this.prepare(request);
        return SERVICE.DefaultBrowserSessionService.restore(request);
      }),
      callback,
    );
  },
  /** Revokes the customer refresh session and clears only customer cookies. */
  logout: function (request, callback) {
    return this.respond(
      Promise.resolve().then(() => {
        this.prepare(request);
        return SERVICE.DefaultBrowserSessionService.logout(request);
      }),
      callback,
    );
  },
  /** Exchanges a verified external link for a customer browser session, or reports secure sign-in required. */
  externalSession: function (request, callback) {
    const operation = Promise.resolve()
      .then(() => {
        this.prepare(request);
        const input = this.externalRequest(request);
        if (
          CONFIG.get("profileExternalIdentity")?.applications?.[
            input.applicationCode
          ]?.requireBrowserHandoff === true
        )
          throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
        return SERVICE.DefaultExternalIdentityService.session(input);
      })
      .then((tokens) => {
        if (tokens.requiresProfileSession) return tokens;
        request.loginId = tokens.loginId;
        return SERVICE.DefaultBrowserSessionService.start(request, tokens);
      });
    return this.respond(operation, callback);
  },
  /** Prepares a one-use external browser handoff for an authenticated application service; forwards no refresh credential. */
  prepareExternalSession: function (request, callback) {
    return this.respond(
      Promise.resolve().then(() => {
        this.prepare(request);
        return SERVICE.DefaultExternalBrowserHandoffService.prepare({
          ...request,
          ...this.externalRequest(request),
        });
      }),
      callback,
    );
  },
  /** Completes a one-use handoff on Profile's browser path so refresh rotation and HttpOnly cookie ownership remain unchanged. */
  completeExternalSession: function (request, callback) {
    return this.respond(
      Promise.resolve()
        .then(() => {
          this.prepare(request);
          return SERVICE.DefaultExternalBrowserHandoffService.complete({
            ...request,
            ...this.externalRequest(request),
            handoffToken: request.httpRequest.body?.handoffToken,
          });
        })
        .then((tokens) => {
          request.loginId = tokens.loginId;
          return SERVICE.DefaultBrowserSessionService.start(request, tokens);
        }),
      callback,
    );
  },
  /** Links the verified channel to the authenticated customer after explicit account sign-in/registration. */
  link: function (request, callback) {
    return this.respond(
      Promise.resolve().then(() => {
        this.prepare(request);
        return SERVICE.DefaultExternalIdentityService.link(
          this.externalRequest(request),
        );
      }),
      callback,
    );
  },
  /** Revokes the caller's verified link and clears the current customer browser session. */
  unlink: function (request, callback) {
    return this.respond(
      Promise.resolve()
        .then(() => {
          this.prepare(request);
          return SERVICE.DefaultExternalIdentityService.unlink(
            this.externalRequest(request),
          );
        })
        .then((result) => {
          SERVICE.DefaultBrowserSessionService.clear(
            request,
            SERVICE.DefaultBrowserSessionService.config(request),
          );
          return result;
        }),
      callback,
    );
  },
  /** Adapts owner promises to the existing Nodics envelope/callback contract, with no token logging. */
  respond: function (operation, callback) {
    const promise = operation.then((result) => ({
      code: "SUC_AUTH_00000",
      result,
    }));
    if (callback) {
      promise.then((value) => callback(null, value)).catch(callback);
      return;
    }
    return promise;
  },
};
