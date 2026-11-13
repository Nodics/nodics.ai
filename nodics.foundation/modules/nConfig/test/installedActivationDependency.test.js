'use strict';
/** @module nConfig/test/installedActivationDependency @description Isolated installed dependency closure and transactional registry admission. @layer test @owner nConfig */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const initializer=require('../src/service/DefaultFrameworkInitializerService'),utils=require('../src/utils/utils');
function fixture(t){
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'installed-activation-'))),framework=path.join(root,'framework'),project=path.join(root,'project');
 const saved=global.NODICS;t.after(()=>{global.NODICS=saved;fs.rmSync(root,{recursive:true,force:true});});
 const write=(folder,name,kind,extra={})=>{fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'package.json'),JSON.stringify({name,index:'1',nodics:{kind,runtime:{router:false}},...extra}));};
 write(framework,'framework','framework',{nodics:{kind:'framework',runtimeModule:false}});write(project,'project','application');
 const foundation=path.join(framework,'foundation');write(foundation,'foundation','group');
 write(path.join(foundation,'modules/client'),'client','capability',{requiredModules:['externalCore']});
 const external=path.join(framework,'external');write(external,'external','group',{requiredModules:['unrelated']});write(path.join(external,'modules/core'),'externalCore','capability',{requiredModules:['publication']});write(path.join(external,'modules/publication'),'publication','capability');write(path.join(external,'modules/unrelated'),'unrelated','capability');
 write(path.join(project,'env'),'environment','group');write(path.join(project,'env/server'),'server','server');
 let raw={};const records=[];utils.collectModuleRecords(foundation,records,null);utils.collectModuleRecords(project,records,null);utils.indexModuleRecords(records,raw);
 let registrations=0;
 global.NODICS={getRawModule:name=>raw[name],getRawModules:()=>raw,addRawModules:value=>{registrations++;raw=value;},getNodicsHome:()=>foundation,getCustomHome:()=>project,
 getServerName:()=> 'server',getServerRootName:()=> 'environment',getNodeName:()=>undefined,getEnvironmentName:()=> 'project',getEnvironmentPath:()=>project,addLogger:()=>{}};
 const owner={...initializer,normalizeModuleIdentity:name=>name,loadServerProperties:()=>({activeModules:{groups:[],modules:['client']},runtimeRole:{publication:'OPERATIONAL'}})};
 return {write,external,framework,owner,raw:()=>raw,registrations:()=>registrations};
}
test('missing installed dependency closure registers canonical parents and transitive sources without siblings or executable loading',t=>{
 const f=fixture(t);fs.mkdirSync(path.join(f.external,'config'));fs.writeFileSync(path.join(f.external,'config/properties.js'),'throw Error("must not load config during graph resolution")');
 const existing={...f.raw()};
 const modules=f.owner.getActiveModules();for(const [key,value] of Object.entries(existing))assert.equal(f.raw()[key],value);for(const name of ['client','externalCore','publication','external'])assert(modules.includes(name));
 assert(!modules.includes('unrelated'));assert(f.raw().unrelated);
 assert.equal(f.raw().externalCore.parent,'external');assert.equal(f.raw().externalCore.canonicalIdentity,'external/externalCore');assert.equal(f.registrations(),1);
 const again=f.owner.getActiveModules();assert.deepEqual(again,modules);assert.equal(f.registrations(),1);
});
for(const mode of ['missing','cycle','duplicate','escape'])test('installed dependency '+mode+' fails without partial registry mutation',t=>{
 const f=fixture(t),before=JSON.stringify(f.raw());
 if(mode==='missing')f.write(path.join(f.external,'modules/core'),'externalCore','capability',{requiredModules:['absent']});
 if(mode==='cycle')f.write(path.join(f.external,'modules/publication'),'publication','capability',{requiredModules:['externalCore']});
 if(mode==='duplicate')f.write(path.join(f.framework,'duplicate'),'externalCore','capability');
 if(mode==='escape')fs.symlinkSync(f.external,path.join(f.framework,'linked'));
 assert.throws(()=>f.owner.getActiveModules(),/Missing installed|Circular requiredModules|Duplicate runtime|escapes its trusted root/);
 assert.equal(JSON.stringify(f.raw()),before);assert.equal(f.registrations(),0);
});
