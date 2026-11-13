/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module config/test/nodeAdoptionDocumentation @description Verifies the forward guide release against exact immutable predecessor records and aligned public search/provenance. @owner config @layer test */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),contract=require('../../nTooling/src/service/defaultApplicationDocumentationContractService');
test('node adoption guide advances without altering immutable predecessor or unrelated article content',()=>{
 const frozen=require('./fixtures/documentationAdoptionPredecessor.json'),previous=frozen.sections.documentation,current=require('../data/manifest.json').sections.documentation;
 assert.equal(current.version,frozen.successorVersion);contract.validateGeneration(previous,current);
 const oldFile=p=>{const f=path.join(__dirname,'fixtures/documentationAdoptionPredecessor',p);return fs.existsSync(f)?f:path.join(root,'data',p);},currentFile=p=>path.join(root,'data',p);
 for(const [p,h]of Object.entries(previous.generatedHashes))assert.equal(contract.sha256(fs.readFileSync(oldFile(p))),h);
 for(const [p,h]of Object.entries(current.generatedHashes))assert.equal(contract.sha256(fs.readFileSync(currentFile(p))),h);
 assert.equal(contract.releaseChecksum(current.generatedHashes),current.releaseChecksum);
 const records=(section,suffix,resolve)=>Object.keys(section.generatedHashes).filter(p=>p.endsWith(suffix+'Data.js')).flatMap(p=>Object.values(require(resolve(p))));
 const old=records(previous,'Component',oldFile),components=records(current,'Component',currentFile),pages=records(current,'PageMetadata',currentFile),search=records(current,'SearchMetadata',currentFile);
 for(const component of components){const prior=old.find(r=>r.code===component.code);assert(prior);const article=component.properties;if(!article?.blocks){assert.deepEqual(component,prior);continue;}
  const changed=article.code==='configuration.runtime-behavior-management';
  assert.deepEqual(changed?article.blocks.slice(0,-2):article.blocks,prior.properties.blocks);
  if(changed){const text=article.blocks.at(-1).text;for(const term of ['propertyAcknowledgement','expectedRevision','appliedRevision','STALE','Profile','Rollback'])assert(text.includes(term));}
  const body=contract.documentationText(article.blocks);assert.equal(article.source.checksum,contract.sha256(body));assert.equal(article.source.wordCount,contract.countWords(body));
  const page=pages.find(p=>p.articleComponent===component.code);assert.equal(page.sourceChecksum,article.source.checksum);assert.equal(page.sourcePath,article.source.path);assert.deepEqual(page.headings,article.headings);assert.equal(page.lifecycleState,'STAGED');
  const result=search.find(r=>r.targetType==='PAGE'&&r.targetCode===page.code);assert(result.searchText.includes(article.searchText));assert.equal(result.lifecycleState,page.lifecycleState);
 }
 const targets=new Map(Object.keys(current.generatedHashes).filter(p=>p.includes('/records/')&&!p.includes('PublicationState')).flatMap(p=>Object.values(require(currentFile(p))).map(r=>[r.code,r])));
 for(const state of records(current,'PublicationState',currentFile)){assert.equal(state.checksum,contract.sha256(JSON.stringify(targets.get(state.targetCode))));assert.equal(state.lifecycleState,'STAGED');assert.equal(state.stagedVersion,current.version);assert.equal(Object.hasOwn(state,'approver'),false);}
 contract.validateDataRelease(root);
});
