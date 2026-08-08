# Documentation-content contract

- This repository contains content and release validation only; it is not a runtime or frontend.
- Every document must declare one canonical functional-module owner.
- Technical-module identity is optional detail and never replaces functional ownership.
- Document IDs are stable, globally unique, and must not encode filesystem paths.
- Platform consumes immutable releases; Axis never imports files from this repository directly.
- Backend-importable framework documentation CMS data belongs here, not in
  frontend repositories.
- Axis product documentation belongs to `nodics.platform/modules/axis`.
- `nodics.axis` owns executable documentation renderers only; it must not own
  CMS catalog, Site, page, component, route, or documentation content-pack data.
- Do not refer to legacy source paths, repositories, or runtime assumptions.
