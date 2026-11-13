'use strict';
/** @module nConfig/test/activeModuleGraph @description Offline graph parity, direct provenance, immutable metadata, indexing and failure contracts. @layer test @owner nConfig */
const {test}=require('node:test'),assert=require('node:assert/strict');
const graph=require('../src/service/defaultActiveModuleGraphService');
const initializer=require('../src/service/DefaultFrameworkInitializerService');
function fixture(){
    const descriptors={};
    const add=(name,kind,parent,index,extra={})=>descriptors[name]={name,parent,index,path:'/fixture/'+name,metaData:{name,nodics:{kind,runtime:{router:false,publish:false,web:false}},...extra}};
    add('project','application',null,'100');add('environment','environment','project','100.1');add('server','server','environment','100.1.1');add('node','node','server','100.1.1.1');
    add('foundation','group',null,'1');add('external','group',null,'2');add('business','group',null,'3');
    descriptors.server.metaData.nodics.extends=['business'];descriptors.business.metaData.nodics.extends=['foundation','external'];
    add('selected','capability','business','3.10',{requiredModules:['token']});add('token','capability','external','2.1');
    add('unrelated','capability','business','3.2');add('content','content-pack','business','3.11');add('dynamo','capability','foundation','1.2');
    descriptors.business.metaData.selected=['selected','content'];
    return {descriptors,input:{properties:{activeModules:{groups:[],modules:['selected','content']},dynamoEnabled:false,publishEnabled:false},
        serverName:'server',rootName:'environment',nodeName:'node',projectName:'project',projectPath:'/fixture/project',resolveModule:name=>descriptors[name],normalizeModuleIdentity:name=>name}};
}
function globals(t,f){const saved=global.NODICS;t.after(()=>{global.NODICS=saved;});global.NODICS={addLogger:()=>{},getRawModule:name=>f.descriptors[name],getRawModules:()=>f.descriptors,
    getEnvironmentName:()=>f.input.projectName,getEnvironmentPath:()=>f.input.projectPath,getServerRootName:()=>f.input.rootName,getServerName:()=>f.input.serverName,
    getNodeName:()=>f.input.nodeName,getNodePath:()=>f.input.nodeName?'/node':undefined};}
// Executes the former getActiveModules algorithm through its existing owner methods,
// rather than asserting a second rewritten interpretation of group/dependency rules.
function priorGraph(f){const owner={...initializer,normalizeModuleIdentity:name=>name},modules=[];
    owner.getConfiguredActiveModuleGroups(f.input.properties).forEach(name=>owner.prepareModuleLevelActiveGroup(f.input.properties,name,modules));
    [f.input.rootName,f.input.serverName,f.input.nodeName].filter(Boolean).forEach(name=>owner.addRuntimeActiveModule(f.input.properties,name,modules,{explicit:true}));
    owner.getConfiguredActiveModuleNames(f.input.properties).forEach(name=>owner.addRuntimeActiveModule(f.input.properties,name,modules,{explicit:true}));
    modules.forEach(name=>owner.resolveModuleHierarchy(name));const dependencies=[];
    modules.forEach(name=>{owner.resolveSubDependency(name,dependencies);owner.resolveParentDependency(name,dependencies);});
    dependencies.forEach(name=>{if(!modules.includes(name))modules.push(name);});return modules;
}
test('canonical helper preserves existing group, direct module, required and parent encounter order',t=>{
    const f=fixture();globals(t,f);const expected=priorGraph(f);
    for(const descriptor of Object.values(f.descriptors))delete descriptor.parentModules;
    const before=structuredClone(f.descriptors),actual=graph.resolve(f.input);
    assert.deepEqual(actual.modules,expected);assert.deepEqual(f.descriptors,before);
    assert.deepEqual(actual.explicitGroups,['business']);assert.deepEqual(actual.explicitModules,['server','node','selected','content']);
    assert(!actual.modules.includes('unrelated'));assert(!actual.explicitGroups.includes('external'));assert(!actual.explicitModules.includes('token'));
});
test('initializer delegates to the same graph and retains numeric dotted index ordering and duplicate refusal',t=>{
    const f=fixture();globals(t,f);const owner={...initializer,loadServerProperties:()=>f.input.properties,normalizeModuleIdentity:name=>name};
    const result=owner.getActiveModules();assert.deepEqual(result,graph.resolve(f.input).modules);
    let indexed;NODICS.isModuleActive=name=>result.includes(name);NODICS.setIndexedModules=value=>{indexed=value;};owner.loadModuleIndex();
    assert.deepEqual([...indexed.keys()],initializer.sortModules(result.map(name=>f.descriptors[name].index)));
    f.descriptors.content.index=f.descriptors.selected.index;assert.throws(()=>owner.loadModuleIndex(),/already exist/);
    const original=Error('resolver unavailable');NODICS.getRawModule=()=>{throw original;};assert.throws(()=>owner.getActiveModules(),error=>error===original);
});
test('selectors activate only their named children and direct intent never includes selected children or transitive groups',()=>{
    const f=fixture();f.input.properties.activeModules={groups:['business:selected'],modules:[]};
    f.input.normalizeModuleIdentity=name=>name==='alias'?'business':name;
    f.input.properties.activeModules.groups=['alias:selected'];
    const actual=graph.resolve(f.input);assert(actual.modules.includes('selected'));assert(actual.modules.includes('content'));
    assert(!actual.modules.includes('unrelated'));assert.deepEqual(actual.explicitGroups,['business']);assert.deepEqual(actual.explicitModules,['server','node']);
    for(const list of Object.values(actual))assert(list.every(name=>!name.includes(':')));
});
test('publication/dynamo gates and explicit content activation preserve loader admission semantics',t=>{
    for(const publication of ['STAGED','ONLINE','OPERATIONAL']){
        const f=fixture();globals(t,f);f.descriptors.external.metaData.nodics.runtime.publish=true;
        f.input.properties.runtimeRole={publication};f.input.properties.publishEnabled=publication==='STAGED';
        f.input.properties.activeModules.modules.push('dynamo');
        assert.deepEqual(graph.resolve(f.input).modules,priorGraph(f));
        assert(!graph.resolve(f.input).modules.includes('dynamo'));
        f.input.properties.dynamoEnabled=true;assert(graph.resolve(f.input).modules.includes('dynamo'));
    }
});
test('project parent boundary matches existing loader without cached hierarchy mutation',t=>{
    const f=fixture();f.descriptors.project.parent='container';f.descriptors.container={name:'container',path:'/fixture',index:'0',metaData:{name:'container',nodics:{kind:'group',runtime:{}}}};
    globals(t,f);const expected=priorGraph(f);for(const descriptor of Object.values(f.descriptors))delete descriptor.parentModules;
    assert.deepEqual(graph.resolve(f.input).modules,expected);assert(!expected.includes('project'));
});
test('missing references and each traversed cycle fail closed without swallowed resolver errors',()=>{
    for(const change of [
        f=>{delete f.descriptors.server;},f=>{f.descriptors.server.metaData.nodics.extends=['missing'];},
        f=>{f.input.properties.activeModules.modules=['missing'];},f=>{f.descriptors.selected.metaData.requiredModules=['missing'];},
        f=>{f.descriptors.selected.parent='missing';},f=>{f.descriptors.foundation.metaData.nodics.extends=['business'];},
        f=>{f.descriptors.token.metaData.requiredModules=['selected'];},f=>{f.descriptors.business.parent='selected';},
        f=>{f.input.properties.activeModules.groups='business';},f=>{f.descriptors.selected.metaData.requiredModules='token';},
    ]){const f=fixture();change(f);assert.throws(()=>graph.resolve(f.input),/Invalid Nodics configuration/);}
    const f=fixture(),error=Error('canonical source failure');f.input.resolveModule=()=>{throw error;};assert.throws(()=>graph.resolve(f.input),e=>e===error);
});
test('resolution is immutable and independent on every call',()=>{
    const f=fixture();const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
    freeze(f.descriptors);freeze(f.input.properties);const before=JSON.stringify(f.descriptors),a=graph.resolve(f.input);a.modules.length=0;a.explicitGroups.push('forged');
    const b=graph.resolve(f.input);assert(b.modules.includes('selected'));assert.deepEqual(b.explicitGroups,['business']);assert.equal(JSON.stringify(f.descriptors),before);
});
