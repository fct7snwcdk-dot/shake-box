import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {createSimulation} from '../src/physics.js';
test('original GLB: placement, settling, ejection and reset',async()=>{
 const b=fs.readFileSync(new URL('../public/box.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');const sim=await createSimulation(gltf.scene);
 assert.equal(sim.records.length,48);
 for(let i=0;i<48;i++){const a=sim.records[i];assert.ok(Math.abs(a.start.x)+a.radius<.856);assert.ok(Math.abs(a.start.z)+a.radius<.471);for(let j=i+1;j<48;j++){const c=sim.records[j];assert.ok(Math.hypot(a.start.x-c.start.x,a.start.y-c.start.y,a.start.z-c.start.z)>a.radius+c.radius)}}
 for(let i=0;i<600;i++)sim.world.step();
 for(const {body} of sim.records){const p=body.translation();assert.ok(p.y>.085&&p.y<1.16,JSON.stringify(p));assert.ok(Math.abs(p.x)<.86);assert.ok(Math.abs(p.z)<.48)}
 sim.shake();let exits=new Set();for(let i=0;i<240;i++){sim.world.step();sim.records.forEach(({body},j)=>{if(body.translation().y>1.26)exits.add(j)})}assert.ok(exits.size>0,'balls must clear rim');
 sim.reset();for(const {body,start} of sim.records){assert.ok(Math.abs(body.translation().y-start.y)<1e-6);assert.equal(body.linvel().y,0)}console.log('Balls clearing rim:',exits.size);sim.world.free();
});
