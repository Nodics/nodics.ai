/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module nodics.docs/test/searchFreshnessForward @description Verifies reviewed search-freshness successors, exact predecessor bytes and aligned authoring/search/publication metadata. @owner nodics.docs @layer test */
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),contract=require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
for(const [owner,changedId] of [['nodics.foundation/modules/nCache/cache','cache.runtime-state-management'],['nodics.copilot/modules/copilotKnowledge','copilot.knowledge-generation-recovery']])test(owner+': search freshness advances immutable documentation without unrelated edits',()=>{
 const dir=path.join(root,owner),fixture=require(path.join(dir,'test/fixtures/documentationSearchPredecessor.json')),previous=fixture.sections.documentation,current=require(path.join(dir,'data/manifest.json')).sections.documentation;
 const oldFile=p=>{const frozen=path.join(dir,'test/fixtures/documentationSearchPredecessor',p);return fs.existsSync(frozen)?frozen:path.join(dir,'data',p);},newFile=p=>path.join(dir,'data',p);
 assert.equal(current.version,fixture.successorVersion);contract.validateGeneration(previous,current);assert.throws(()=>contract.validateGeneration(previous,{...current,version:previous.version}));
 for(const [p,h]of Object.entries(previous.generatedHashes))assert.equal(contract.sha256(fs.readFileSync(oldFile(p))),h);for(const [p,h]of Object.entries(current.generatedHashes))assert.equal(contract.sha256(fs.readFileSync(newFile(p))),h);assert.equal(contract.releaseChecksum(current.generatedHashes),current.releaseChecksum);
 const rows=(s,suffix,resolve)=>Object.keys(s.generatedHashes).filter(p=>p.endsWith(suffix+'Data.js')).flatMap(p=>Object.values(require(resolve(p))));
 const older=rows(previous,'Component',oldFile),components=rows(current,'Component',newFile),pages=rows(current,'PageMetadata',newFile),search=rows(current,'SearchMetadata',newFile);
 for(const row of components){const article=row.properties;if(!article?.blocks)continue;const old=older.find(r=>r.code===row.code).properties;const changed=article.code===changedId;assert.deepEqual(changed?article.blocks.slice(0,-4):article.blocks,old.blocks);assert.deepEqual(article.sourceEvidence,old.sourceEvidence);const text=contract.documentationText(article.blocks);assert.equal(article.source.checksum,contract.sha256(text));assert.equal(article.source.wordCount,contract.countWords(text));assert.equal(article.lifecycleState,'STAGED');const page=pages.find(p=>p.articleComponent===row.code);assert.equal(page.sourcePath,article.source.path);assert.equal(page.sourceChecksum,article.source.checksum);assert.equal(page.wordCount,article.source.wordCount);assert.equal(page.sourceWordCount,article.source.wordCount);assert.deepEqual(page.headings,article.headings);const index=search.find(r=>r.targetType==='PAGE'&&r.targetCode===page.code);assert(index.searchText.includes(article.searchText));assert.equal(index.lifecycleState,'STAGED');}
 const targets=new Map(Object.keys(current.generatedHashes).filter(p=>p.includes('/records/')&&!p.includes('PublicationState')).flatMap(p=>Object.values(require(newFile(p))).map(r=>[r.code,r])));for(const state of rows(current,'PublicationState',newFile)){assert.equal(state.checksum,contract.sha256(JSON.stringify(targets.get(state.targetCode))));assert.equal(state.stagedVersion,current.version);assert.equal(state.lifecycleState,'STAGED');for(const k of ['onlineVersion','reviewer','approver','publisher'])assert.equal(Object.hasOwn(state,k),false);}
 contract.validateDataRelease(dir);
});

test('documentation baseline selectors match the selected forward owner releases',()=>{const configuration=require('../config/properties');const baselines=configuration.cms.publication.baselines;for(const [code,owner] of [['docs-cache','nodics.foundation/modules/nCache/cache'],['docs-copilotknowledge','nodics.copilot/modules/copilotKnowledge'],['docs-config','nodics.foundation/modules/nConfig'],['docs-cms','nodics.wcms/modules/cms']])assert.equal(baselines[code].releaseVersion,require(path.join(root,owner,'data/manifest.json')).sections.documentation.version);});
