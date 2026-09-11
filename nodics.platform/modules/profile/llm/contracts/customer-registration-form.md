# Customer account form registration

Profile owns generic registration validation, normalization and customer identity
creation. Customer adapters may forward email, full name and password; they must
not implement another credential policy, invent customer references or persist
accounts. Browser validation helps interaction but does not replace owner checks.

`POST /customer/registrations` is a service-authenticated controller route requiring
`profile.customer.register`. It maps only the form fields through
`DefaultCustomerRegistrationService.formModel` and the existing signup facade and
registration pipeline. That pipeline retains group/principal policy, uniqueness,
KYC enforcement, password hashing and generated persistence. The response is only
`registered: true`; shared browser sign-in remains a separate Profile operation.
The existing structured `/customer/signup` contract remains compatible.

`profileCustomerRegistrationForm` owns form limits. Email is trimmed/lowercased;
full name is whitespace-normalized and mononyms remain supported. Overlong name
parts are rejected rather than silently truncated. Passwords are never trimmed.
Caller-supplied code, owner, groups, permissions, principal type and verification
flags are ignored. Registration and channel proof do not claim verified email
ownership. No OTP or discovery-first step is introduced.

The existing `CUSTOMER_` reference format is retained for compatibility. Later
layers may override the documented `formCustomerCode` member or owner policy
limits while preserving uniqueness and principal security. Invalid configuration
fails closed. An interrupted signup response must be reconciled through normal
account sign-in/recovery; no customer shadow record or duplicate pipeline exists.

Business users receive the same account form on supported hosts. Administrators
configure Profile policy, integrators submit bounded forms through service-auth
routes, and operators retain existing Profile registration/authentication evidence.
Validation: `profileCustomerRegistrationForm.test.js` proves success, rejection,
mononyms, identity stability, privileged-field isolation and customization.
