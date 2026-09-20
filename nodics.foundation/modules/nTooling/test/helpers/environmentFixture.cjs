/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Builds isolated test deployments using real module metadata and layered properties. */
const fs = require('node:fs');
const path = require('node:path');
function json(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value)); }
function properties(root, value) { const file = path.join(root, 'config/properties.js'); fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(value) + ';\n'); }
module.exports = function writeEnvironment(root, definition) {
 json(path.join(root, 'package.json'), { name: path.basename(root), index:'1001.00', nodics: {kind:'group',runtimeModule:true} });
 const {topology = {}, composition, acceptance, qualificationClass, environment, contractVersion, profileCode, ...container} = definition;
 const {groups = {}, ...topologyOptions} = topology;
 properties(root, {environment:{class:qualificationClass || 'LOCAL'}, activeModules:{compositions:composition || {}}, frontends:Object.fromEntries((groups.frontends || []).map(({code,...value})=>[code,value])), tooling:{topology:topologyOptions, acceptance, ...(profileCode ? {container:{...container,code:profileCode}} : {})}});
 for (const [index, runtime] of (groups.backends || []).entries()) {
  const {code,port,host,label,...launch} = runtime;
  const server = path.join(root,code);
  json(path.join(server,'package.json'),{name:code,index:'1002.'+String(index).padStart(2,'0'),nodics:{kind:'server',runtimeModule:true,displayName:label}});
  properties(server,{servers:{default:{endpoint:{httpHost:host || '127.0.0.1',httpPort:port}}},tooling:{runtime:launch}});
 }
};
