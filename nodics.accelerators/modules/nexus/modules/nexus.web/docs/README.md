# Nexus application documentation source

This directory is the ownership boundary for Nexus-specific authored
documentation. It is intentionally not a runtime or import directory, and it
does not replace the framework `nodics.docs` catalogue.

When Nexus-specific documentation is added:

- keep its catalogue and Markdown sources under this `docs/` directory;
- generate WCMS and `cmsDocumentation*` records into the module data boundary;
- declare every generated file in one immutable `data/manifest.json` section;
- install into WCMS Staged through nImport, review through Axis, and publish
  through nPublish before Nexus can consume it from Online;
- preserve stable document, page, route, component, renderer, navigation,
  dashboard, access-policy, publication-state, and search-metadata codes;
- keep installation optional and available only through authorized Axis
  operations;
- never hand-edit generated records or perform direct database CRUD.

Nexus renders only approved Online content for public readers. Authenticated or
role-based documentation must stay behind Axis or another authenticated
consumer until its access policy explicitly allows public rendering.
