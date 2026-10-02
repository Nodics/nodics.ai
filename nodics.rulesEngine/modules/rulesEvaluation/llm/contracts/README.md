# rulesEvaluation Contracts

Evaluation is recursive, deterministic, side-effect free and version-bound. Property resolution comes from registered consumer providers; operator semantics remain generic.

`INPUT_QUALITY` and `DefaultRuleQualityService.ranks` are the existing canonical
quality owners, not a separate registry. `CONTACT_VERIFIED` is registered at the
customer-confirmation tier (4), below `OPERATOR_VERIFIED` and
`VERIFIED_MEASUREMENT`. It describes contact-possession evidence, never regulated
identity or KYC approval. Consumer providers emit it only for actual affirmative
Contact owner evidence; unknown/failed evidence remains unavailable. Minimum
quality comparisons are ordinal, not certificates of evidence kind; approved
policies must select the proper provider/property and affirmative value. The
authored `contactQualityContract.test.js` fixture is NOT RUN.
