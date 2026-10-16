/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/data/backoffice/mediaLibraryWorkspaceData @description Defines Media-owned library and publication workspace presentation. @layer data @owner media */
module.exports = {
  workspace: {
    contractVersion: 1,
    ownerSelector: {
      runtimeRoleCode: "WCMS_STAGED",
      publicationRole: "STAGED",
    },
    renderer: "axis.workspace.backend-operations",
    title: "Media Library",
    description: "Current governed media metadata and exact source versions.",
    defaultTab: "library",
    tabs: [
      {
        id: "library",
        label: "Library",
        sections: [
          {
            id: "media-library-records",
            type: "listing",
            title: "Media Records",
            endpoint: {
              method: "GET",
              path: "/nodics/media/v0/library",
              resultPath: "items",
            },
            rowNavigation: {
              label: "Inspect publication",
              route: "/media/publication",
              parameters: { mediaCode: "code" },
            },
            columns: [
              { field: "code", label: "Media code" },
              { field: "name", label: "Name" },
              { field: "folderCode", label: "Folder" },
              { field: "status", label: "Status" },
              { field: "versionId", label: "Exact version" },
              { field: "access", label: "Access" },
              {
                field: "publicationRequestAvailable",
                label: "Publication eligible",
              },
            ],
            filters: [
              {
                name: "code",
                label: "Media code",
                type: "TEXT",
                maximumLength: 192,
              },
              {
                name: "folderCode",
                label: "Folder code",
                type: "TEXT",
                maximumLength: 192,
              },
              {
                name: "pageNumber",
                label: "Page",
                type: "TEXT",
                defaultValue: "1",
                maximumLength: 5,
              },
              {
                name: "pageSize",
                label: "Page size",
                type: "TEXT",
                defaultValue: "50",
                maximumLength: 3,
              },
            ],
          },
        ],
      },
    ],
  },
  publicationWorkspace: {
    contractVersion: 1,
    renderer: "axis.workspace.backend-operations",
    ownerSelector: {
      runtimeRoleCode: "WCMS_STAGED",
      publicationRole: "STAGED",
    },
    title: "Media Publication",
    defaultTab: "request",
    tabs: [
      {
        id: "request",
        label: "Request Approval",
        sections: [
          {
            id: "media-publication-request",
            type: "form",
            title: "Exact-Version Publication Request",
            submitLabel: "Request Approval",
            successMessage:
              "Publication request recorded. Approval and Online activation remain governed.",
            endpoint: {
              method: "POST",
              path: "/nodics/media/v0/library/publications",
              bodyShape: "FIELDS",
            },
            readSource: {
              endpoint: {
                method: "GET",
                path: "/nodics/media/v0/library/{mediaCode}",
              },
              parameter: "mediaCode",
              fields: { mediaCode: "code", versionId: "versionId" },
              commandId: "requestPublication",
              unavailableMessagePath: "publicationReadiness.message",
              unavailableMessage:
                "Current Media source is not eligible for publication. Review its prerequisites and refresh inspection.",
            },
            fields: [
              {
                name: "mediaCode",
                label: "Media code",
                type: "TEXT",
                required: true,
                maximumLength: 192,
                defaultFromParameter: "mediaCode",
              },
              {
                name: "versionId",
                label: "Exact version",
                type: "TEXT",
                required: true,
                maximumLength: 16,
                defaultFromParameter: "versionId",
              },
              {
                name: "publicationCode",
                label: "Publication request reference",
                type: "IDEMPOTENCY",
                required: true,
                maximumLength: 128,
              },
            ],
          },
        ],
      },
    ],
  },
};
