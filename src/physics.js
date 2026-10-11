import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
export async function createSimulation(root) {
 await RAPIER.init();
 const world=new RAPIER.World({x:0,y:-9.81,z:0}); world.timestep=1/120;
 const meshes=[]; root.updateMatrixWorld(true); root.traverse(m=>{if(m.isMesh)meshes.push(m)});
 const balls=meshes.filter(m=>/^Sphere/.test(m.name));
 const boxes=meshes.filter(m=>/^Cube/.test(m.name));
 if(balls.length!==48||boxes.length!==2)throw Error('Structure GLB inattendue');
 const transform=new THREE.Matrix4().makeRotationX(Math.PI).premultiply(new THREE.Matrix4().makeScale(.1,.1,.1));
 const records=[]; const seen=new Set();
 for(const m of boxes){
  const geo=m.geometry.clone().applyMatrix4(m.matrixWorld).applyMatrix4(transform);
  const signature=JSON.stringify(Array.from(geo.attributes.position.array));
  if(seen.has(signature)){m.removeFromParent();continue}seen.add(signature);
  m.removeFromParent();m.geometry=geo;m.position.set(0,0,0);m.quaternion.identity();m.scale.set(1,1,1);root.add(m);
  world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(geo.attributes.position.array),new Uint32Array(geo.index.array)).setFriction(.45).setRestitution(.25));
 }
 for(let i=0;i<balls.length;i++){
  const m=balls[i],geo=m.geometry.clone().applyMatrix4(m.matrixWorld);
  const bounds=new THREE.Box3().setFromBufferAttribute(geo.attributes.position),center=bounds.getCenter(new THREE.Vector3());
  geo.translate(-center.x,-center.y,-center.z);geo.applyMatrix4(new THREE.Matrix4().makeScale(.1,.1,.1));
  m.removeFromParent();m.geometry=geo;m.quaternion.identity();m.scale.set(1,1,1);root.add(m);
  const radius=bounds.getSize(new THREE.Vector3()).length() ? Math.max(...bounds.getSize(new THREE.Vector3()).toArray())*.05 : .1;
  const start={x:-.735+(i%8)*.21,y:.18+Math.floor(i/32)*.21,z:-.315+(Math.floor(i/8)%4)*.21};
  const body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(start.x,start.y,start.z).setCcdEnabled(true).setLinearDamping(.12).setAngularDamping(.2));
  world.createCollider(RAPIER.ColliderDesc.ball(radius).setDensity(1).setFriction(.35).setRestitution(.45),body);
  records.push({mesh:m,body,start,radius});
 }
 // A broad invisible floor catches balls after they leave the original box.
 world.createCollider(RAPIER.ColliderDesc.cuboid(20,.05,20).setTranslation(0,-.15,0).setRestitution(.35));
 const sync=()=>records.forEach(({mesh,body})=>{mesh.position.copy(body.translation());mesh.quaternion.copy(body.rotation())});
 const reset=()=>{records.forEach(({body,start})=>{body.setTranslation(start,true);body.setRotation({x:0,y:0,z:0,w:1},true);body.setLinvel({x:0,y:0,z:0},true);body.setAngvel({x:0,y:0,z:0},true)});sync()};
 const shake=(strength=1)=>records.forEach(({body})=>{const mass=body.mass();body.applyImpulse({x:(Math.random()-.5)*2.8*mass*strength,y:mass*(5.7+Math.random()*1.4)*strength,z:(Math.random()-.5)*2.8*mass*strength},true)});
 reset();return {world,records,shake,reset,sync};
}
