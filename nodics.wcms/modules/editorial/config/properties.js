/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/config/properties
 * @description Defines generated configurable defaults for editorial.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  tooling: {
    commands: {
      "acceptance:editorial-live": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script:
          "src/service/acceptance/defaultEditorialLiveJourneyAcceptanceService.mjs",
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      editorial: {
        serviceNames: {
          DefaultEditorialArticleLocalizationService: true,
          DefaultEditorialArticleService: true,
          DefaultEditorialArticleTaxonomyService: true,
          DefaultEditorialAuthorService: true,
          DefaultEditorialContentTypeService: true,
          DefaultEditorialCorrectionService: true,
          DefaultEditorialOnlineArticleService: true,
          DefaultEditorialPublicationReceiptService: true,
          DefaultEditorialSeriesService: true,
          DefaultEditorialTaxonomyTermService: true,
        },
      },
    },
  },

  schemaPolicies: {
    editorial: {
      tenantOwned: {
        accessGroups: {
          adminGroup: 10,
          serviceAccountUserGroup: 10,
          employeeUserGroup: 10,
        },
      },
      operational: {
        accessGroups: {
          adminGroup: 10,
          serviceAccountUserGroup: 10,
          employeeUserGroup: 10,
        },
      },
    },
  },
  editorial: {
    authoring: {
      featuredMedia: {
        presentation: {
          en: {
            ready: 'The exact featured image is published and its stored bytes are verified.',
            pending: 'Publish the featured image through Media review and approval before submitting or publishing this article. Then refresh this article.',
            unavailable: 'Featured image readiness could not be confirmed. Inspect Media publication, then refresh this article.',
            open: 'Review featured image publication',
            saveFirst: 'Save the selected image with this draft to check its publication readiness.',
          },
          ar: {
            ready: 'الصورة المحددة منشورة وتم التحقق من سلامة ملفها.',
            pending: 'انشر الصورة عبر مراجعة الوسائط واعتمادها قبل إرسال المقال أو نشره، ثم حدّث المقال.',
            unavailable: 'تعذر تأكيد جاهزية الصورة. افحص نشر الوسائط ثم حدّث المقال.',
            open: 'مراجعة نشر الصورة',
            saveFirst: 'احفظ الصورة المحددة مع المسودة للتحقق من جاهزية نشرها.',
          },
        },
      },
      // Layer this purpose, never a customer folder/provider mapping, for an article image.
      mediaIntake: {
        contextCode: 'contentMedia',
        presentation: {
          en: {
            title: 'Article image', choose: 'Choose image', check: 'Review image policy', upload: 'Upload reviewed image',
            inspect: 'Inspect original upload', apply: 'Use this image', clear: 'Choose another image',
            checking: 'Checking image policy…', uploading: 'Uploading image…', inspecting: 'Inspecting original upload…',
            review: 'Review the selected file and its approved intake purpose before uploading. Uploading does not save or publish this article.',
            confirmed: 'Image upload confirmed. Use this image to add it to the open draft, then save the article. Publication remains a separate step.',
            uncertain: 'The upload outcome is unconfirmed. Keep this reference and inspect the original upload before continuing. The file will not be resent.',
            unavailable: 'Image intake is unavailable. Restore the authorized Media connection and its configured purpose before uploading.',
            failed: 'The image could not be qualified. Check the file and Media access, then review its policy again.',
            reference: 'Upload reference', applied: 'Image added to this draft. Save the article to keep the association; review and publication remain separate.',
          },
          ar: {
            title: 'صورة المقال', choose: 'اختيار صورة', check: 'مراجعة سياسة الصورة', upload: 'رفع الصورة المراجعة',
            inspect: 'فحص الرفع الأصلي', apply: 'استخدام هذه الصورة', clear: 'اختيار صورة أخرى',
            checking: 'جارٍ التحقق من سياسة الصورة…', uploading: 'جارٍ رفع الصورة…', inspecting: 'جارٍ فحص الرفع الأصلي…',
            review: 'راجع الملف والغرض المعتمد قبل الرفع. رفع الصورة لا يحفظ المقال ولا ينشره.',
            confirmed: 'تم تأكيد رفع الصورة. أضفها إلى المسودة ثم احفظ المقال. النشر خطوة مستقلة.',
            uncertain: 'نتيجة الرفع غير مؤكدة. احتفظ بالمرجع وافحص الرفع الأصلي قبل المتابعة. لن تتم إعادة إرسال الملف.',
            unavailable: 'رفع الصور غير متاح. استعد اتصال الوسائط المصرح به والغرض المضبوط قبل الرفع.',
            failed: 'تعذر التحقق من الصورة. راجع الملف وصلاحية الوسائط ثم راجع السياسة مجدداً.',
            reference: 'مرجع الرفع', applied: 'أضيفت الصورة إلى المسودة. احفظ المقال للاحتفاظ بالارتباط؛ المراجعة والنشر خطوتان مستقلتان.',
          },
        },
      },
      maximumDraftBytes: 1048576,
      presentation: {
        en: {
          editLabel: 'Edit content', previewLabel: 'Preview draft', saveLabel: 'Save draft', savingLabel: 'Saving draft…',
          refreshLabel: 'Refresh saved article', archiveLabel: 'Archive article', archiveTitle: 'Archive this article?',
          archiveMessage: 'This ends work on the saved revision. An Online copy must be withdrawn first. History is retained.',
          confirmArchiveLabel: 'Confirm archive', cancelLabel: 'Keep editing', inspectLabel: 'Inspect original command',
          localeLabel: 'Content language', unsavedMessage: 'This preview includes unsaved changes. Save the draft before validation or review.',
          savedMessage: 'Draft saved. Validate this revision before submitting it for review.',
          archivedMessage: 'Article archived. Its history and publication references are retained.',
          draftLocaleMessage: 'This language is saved as a draft. Add a title, URL slug and story before it can be published.',
          commandReferenceLabel: 'Operation reference',
          validationBlockedMessage: 'The saved revision is not ready. Review the validation results below.',
          validationReadyMessage: 'The saved revision is ready to submit for review.',
          uncertainMessage: 'The outcome is uncertain. Your draft and original command are retained. Inspect the original command before another action.',
          changedMessage: 'The saved article changed. Review its current revision before continuing; your edits are retained.',
          refreshTitle: 'Load the saved article?', refreshMessage: 'This replaces the open draft with the current saved revision. Unsaved edits will be discarded.',
          confirmRefreshLabel: 'Load saved article', missingLocaleMessage: 'No saved copy exists for this language. Add a title, URL slug and story; incomplete copy can be saved as a draft.',
          closeLabel: 'Close', closeTitle: 'Leave this article?',
          closeMessage: 'Unsaved edits and selected files will be discarded. Saved records and publication history are retained.', confirmCloseLabel: 'Leave article',
          readOnlyBodyMessage: 'This story contains content that requires a compatible editor. Other fields can still be edited.',
          inReviewMessage: 'This revision is in review. Wait for the review decision before editing its copy.',
          publicationMessage: 'A publication reference is retained independently of this draft. Inspect its owner for current state and history.',
          pendingPublicationMessage: 'Editing is on hold while this publication request awaits confirmation. Inspect the request. Resume continues the same request; a failed request requires recovery by its publication owner first.',
          resumePublicationLabel: 'Resume original publication', inspectPublicationLabel: 'Inspect publication request',
          unavailableMessage: 'The owning Editorial editor is unavailable. Restore its connection and inspect the saved article before editing.',
        },
        ar: {
          editLabel: 'تحرير المحتوى', previewLabel: 'معاينة المسودة', saveLabel: 'حفظ المسودة', savingLabel: 'جارٍ حفظ المسودة…',
          refreshLabel: 'تحديث المقال المحفوظ', archiveLabel: 'أرشفة المقال', archiveTitle: 'أرشفة هذا المقال؟',
          archiveMessage: 'ينهي هذا العمل على النسخة المحفوظة. يجب سحب النسخة المنشورة أولاً. يبقى السجل محفوظاً.',
          confirmArchiveLabel: 'تأكيد الأرشفة', cancelLabel: 'متابعة التحرير', inspectLabel: 'فحص العملية الأصلية',
          localeLabel: 'لغة المحتوى', unsavedMessage: 'تتضمن المعاينة تغييرات غير محفوظة. احفظ المسودة قبل التحقق أو المراجعة.',
          savedMessage: 'تم حفظ المسودة. تحقّق من هذه النسخة قبل إرسالها للمراجعة.',
          archivedMessage: 'تمت أرشفة المقال. يبقى سجله ومراجع نشره محفوظة.',
          draftLocaleMessage: 'تم حفظ المحتوى بهذه اللغة كمسودة. أضف العنوان والرابط والنص قبل النشر.',
          commandReferenceLabel: 'مرجع العملية',
          validationBlockedMessage: 'النسخة المحفوظة غير جاهزة. راجع نتائج التحقق أدناه.',
          validationReadyMessage: 'النسخة المحفوظة جاهزة للإرسال للمراجعة.',
          uncertainMessage: 'نتيجة العملية غير مؤكدة. تم الاحتفاظ بمسودتك ومرجع العملية الأصلية. افحص العملية قبل أي إجراء آخر.',
          changedMessage: 'تغيّر المقال المحفوظ. راجع نسخته الحالية قبل المتابعة؛ تم الاحتفاظ بتعديلاتك.',
          refreshTitle: 'تحميل المقال المحفوظ؟', refreshMessage: 'يستبدل هذا المسودة المفتوحة بالنسخة المحفوظة الحالية ويلغي التعديلات غير المحفوظة.',
          confirmRefreshLabel: 'تحميل المقال المحفوظ', missingLocaleMessage: 'لا يوجد محتوى محفوظ بهذه اللغة. أضف العنوان والرابط والنص؛ يمكن حفظ المحتوى غير المكتمل كمسودة.',
          closeLabel: 'إغلاق', closeTitle: 'مغادرة هذا المقال؟',
          closeMessage: 'سيتم تجاهل التعديلات غير المحفوظة والملفات المحددة. سيتم الاحتفاظ بالسجلات المحفوظة وسجل النشر.', confirmCloseLabel: 'مغادرة المقال',
          readOnlyBodyMessage: 'يحتوي النص على محتوى يتطلب محرراً متوافقاً. يمكن تعديل الحقول الأخرى.',
          inReviewMessage: 'هذه النسخة قيد المراجعة. انتظر قرار المراجعة قبل تعديل محتواها.',
          publicationMessage: 'يبقى مرجع النشر مستقلاً عن هذه المسودة. افحص طلب النشر لمعرفة حالته وسجله.',
          pendingPublicationMessage: 'التحرير معلّق حتى تأكيد طلب النشر هذا. افحص الطلب. تستأنف المتابعة الطلب نفسه؛ وإذا فشل، يجب استعادته لدى جهة النشر أولاً.',
          resumePublicationLabel: 'استئناف طلب النشر الأصلي', inspectPublicationLabel: 'فحص طلب النشر',
          unavailableMessage: 'محرر المحتوى غير متاح. أعد الاتصال وافحص المقال المحفوظ قبل التحرير.',
        },
      },
    },
    workflow: {
      actionAuthority: {
        connectionName: "process",
        connectionType: "abstract",
        publication: "OPERATIONAL",
        timeoutMs: 5000,
      },
      definitionCode: "editorialApproval",
      requiredStatus: "READY",
      readyStatus: "APPROVED",
      notificationIntent: "editorial.workflow.task",
    },
    publication: {
      runtimeRole: { $config: "context", name: "publication" },
      targetTransportProvider: { $config: "context", name: "publication",
        cases: { STAGED: "DefaultEditorialPublicationModuleTransportService", ONLINE: null, OPERATIONAL: null } },
      maximumDependencies: 500,
      maximumProjections: 500,
      maximumProjectionBytes: 5242880,
      versionProvider: "DefaultEditorialPublicationVersionProviderService",
      target: {
        moduleName: "editorial",
        publication: "ONLINE",
        connectionName: null,
        connectionType: "abstract",
      },
    },
    delivery: {
      defaultLimit: 20,
      maximumLimit: 100,
      cacheTtl: 30000,
      supportedLocales: ["en", "ar"],
      supportedChannels: ["web"],
    },
    syndication: { maximumItems: 100 },

  },
  process: {
    actionAdapters: {
      allowedActions: [
        {
          moduleName: "nodics.process",
          operation: "noop",
          description: "Safe Process no-op adapter",
        },
        {
          moduleName: "editorial",
          operation: "applyDecision",
          service: "DefaultEditorialWorkflowAdapterService",
          method: "applyProcessDecision",
          description:
            "Apply a completed Editorial review decision with exact revision correlation",
        },
        {
          moduleName: "editorial",
          operation: "publishApproved",
          service: "DefaultEditorialPublicationService",
          method: "applyProcessPublication",
          description:
            "Resume an approved Editorial release through nPublish authority",
        },
      ],
    },
  },
  publish: {
    providers: {
      domainAdapters: {
        editorial: "DefaultEditorialPublicationAdapterService",
      },
      versionProviders: {
        editorial: "DefaultEditorialPublicationVersionProviderService",
      },
    },
  },
  apiExposure: {
    categories: {
      editorialAuthoring: {
        enabled: true,
      },
      editorialPublic: {
        enabled: true,
      },
      moduleInternal: {
        enabled: true,
      },
    },
  },
};
