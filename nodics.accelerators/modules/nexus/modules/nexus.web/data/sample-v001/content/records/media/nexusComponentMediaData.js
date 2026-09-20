/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/media/nexusComponentMediaData
 * @description Declares Nexus CMS component media bindings so Staged-to-Online publication carries referenced visual assets.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may replace these bindings with their own approved Nexus visual assets.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const components = require('../wcms/corporate/nexusComponentData');

const mediaFields = new Set(['referenceImageCode', 'avatarReferenceImageCode', 'featuredMediaCode']);

const roleFor = function (fieldName) {
  if (fieldName === 'avatarReferenceImageCode') return 'thumbnail';
  return 'background';
};

const collectMediaReferences = function (componentCode, value, result) {
  if (Array.isArray(value)) {
    value.forEach(item => collectMediaReferences(componentCode, item, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  Object.entries(value).forEach(([key, child]) => {
    if (mediaFields.has(key) && typeof child === 'string' && child.trim()) {
      result.push({ componentCode, mediaCode: child, role: roleFor(key), altText: value.imageAlt || value.avatarAlt || value.altText });
    }
    collectMediaReferences(componentCode, child, result);
  });
  return result;
};

const uniqueReferences = Object.values(components).reduce((result, component) => {
  collectMediaReferences(component.code, component.properties || {}, result);
  return result;
}, []).reduce((result, reference) => {
  const key = reference.componentCode + '|' + reference.mediaCode;
  if (!result.seen.has(key)) {
    result.seen.add(key);
    result.items.push(reference);
  }
  return result;
}, { seen: new Set(), items: [] }).items;

const media = function (reference, index) {
  const code = [reference.componentCode, reference.role, index + 1].join('-');
  return {
    active: true,
    code,
    tenant: 'default',
    componentMediaCode: code,
    componentCode: reference.componentCode,
    mediaCode: reference.mediaCode,
    mediaType: 'IMAGE',
    role: reference.role,
    slot: 'content',
    localeCode: 'en',
    position: (index + 1) * 10,
    altText: reference.altText || reference.mediaCode
  };
};

const activeComponentCodes = new Set(Object.values(components)
  .filter(component => component.active !== false).map(component => component.code));

// Filter after deriving identities so surviving associations retain their stable codes.
module.exports = Object.freeze(Object.fromEntries(uniqueReferences.map((reference, index) => [
  'record' + index,
  media(reference, index)
]).filter(([, binding]) => activeComponentCodes.has(binding.componentCode))));
