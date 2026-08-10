# nLocalization contracts

- Input locale tags are bounded and canonicalized to BCP 47; `default` is not a locale.
- `LocalizationContext` version 1 is immutable and contains trusted scope plus requested/resolved locale metadata.
- Resolution order is requested locale, requested base language, configured fallbacks, then default locale, filtered by supported locales.
- Client calls use the configured provider service. Only context resolution may use a caller-supplied trusted policy fallback; bundle retrieval fails without an authority.
- Scope/cache identities include tenant, scope, channel, locale, namespace set, and release version.
- This module never persists or serves localized values.
- Compatible API responses retain `message` and may add `messageKey`,
  allow-listed scalar `messageParameters`, and `messageExposure`. Clients must
  ignore absent or unsafe metadata and never derive keys by parsing messages.
