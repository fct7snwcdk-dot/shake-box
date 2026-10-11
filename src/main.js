import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createSimulation} from './physics.js';
import './style.css';
const status=document.querySelector('#status'),sensor=document.querySelector('#sensor');
const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f0e8');
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);camera.position.set(0,6,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.querySelector('#stage').append(renderer.domElement);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
scene.add(new THREE.HemisphereLight(0xffffff,0xa4a0b0,2.4));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,6,4);scene.add(light);
const stage=document.querySelector('#stage');
new ResizeObserver(()=>{
 const {width,height}=stage.getBoundingClientRect(),aspect=width/height;
 // Preserve the box proportions; align its long side with the screen's long side.
 const portrait=height>width;
 camera.up.set(portrait?1:0,0,portrait?0:-1);camera.lookAt(0,0,0);
 const boxWidth=portrait?1.0082:1.8,boxHeight=portrait?1.8:1.0082;
 const viewHeight=Math.max(boxHeight,boxWidth/aspect)*1.04;
 camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;
 camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();
 renderer.setSize(width,height);
}).observe(stage);
const instruction='Secouez votre téléphone pour faire décoller les balles';
let sim,last=performance.now(),accumulator=0,lastShake=-Infinity,gravity={x:0,y:0,z:0},enabled=false;
function launch(strength=1){if(!sim)return;sim.shake(strength);lastShake=performance.now()}
document.querySelector('#reset').onclick=()=>{sim?.reset();accumulator=0;status.textContent=instruction};
function motion(e){let a=e.acceleration;if(!a||a.x===null){const v=e.accelerationIncludingGravity;if(!v||v.x===null)return;for(const k of ['x','y','z'])gravity[k]=.85*gravity[k]+.15*(v[k]??0);a={x:v.x-gravity.x,y:v.y-gravity.y,z:v.z-gravity.z}}const magnitude=Math.hypot(a.x??0,a.y??0,a.z??0);if(magnitude>14&&performance.now()-lastShake>650)launch(Math.min(1.45,magnitude/20))}
sensor.onclick=async()=>{try{if(!window.isSecureContext)throw Error('Les capteurs nécessitent HTTPS.');if(!window.DeviceMotionEvent)throw Error('Capteur de mouvement indisponible sur cet appareil.');if(typeof DeviceMotionEvent.requestPermission==='function'&&await DeviceMotionEvent.requestPermission()!=='granted')throw Error('Accès aux capteurs refusé. Vous pouvez réessayer.');if(!enabled){window.addEventListener('devicemotion',motion);enabled=true}sensor.hidden=true;status.textContent=instruction}catch(e){status.textContent=e.message}};
document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0});
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(sim&&!document.hidden){accumulator+=dt;while(accumulator>=1/120){sim.world.step();accumulator-=1/120}sim.sync()}renderer.render(scene,camera)}requestAnimationFrame(frame);
try{const gltf=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}box.glb`);sim=await createSimulation(gltf.scene);scene.add(gltf.scene);document.querySelectorAll('button').forEach(b=>b.disabled=false);status.textContent=instruction}catch(e){console.error(e);status.textContent='Impossible de charger la scène. Recharge la page.'}
