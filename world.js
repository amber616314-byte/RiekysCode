import * as T from './vendor/three.module.js';

export const V = (x=0,y=0,z=0) => new T.Vector3(x,y,z);
export const clamp = T.MathUtils.clamp;
const metal = (color,roughness=.48,metalness=.45) => new T.MeshStandardMaterial({color,roughness,metalness});
const bodyMat=metal(0x858f98,.42,.62), edgeMat=metal(0x46545f,.51,.58), darkMat=metal(0x1a2830,.6,.45);
const tireMat=metal(0x10151a,.85,.1), nozzleMat=metal(0x50515a,.36,.85);

function box(parent,w,h,d,x,y,z,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function loft(sections,material,sides=10){
  const p=[],idx=[];
  for(const [z,w,h,y] of sections)for(let a=0;a<sides;a++){const t=a/sides*Math.PI*2;p.push(Math.cos(t)*w,Math.sin(t)*h+y,z);}
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides;idx.push(a,b,a+sides,b,b+sides,a+sides);}
  for(let i=1;i<sides-1;i++){idx.push(0,i+1,i);const q=(sections.length-1)*sides;idx.push(q,q+i,q+i+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;return m;
}
function plate(points,thickness,material){
  const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const g=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,-thickness/2,0);const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;return m;
}
function lines(parent,sets,color=0x30434f,opacity=.42){const p=[];sets.forEach(s=>{for(let i=0;i<s.length-1;i++)p.push(...s[i],...s[i+1]);});const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));parent.add(new T.LineSegments(g,new T.LineBasicMaterial({color,transparent:true,opacity})));}

export function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.15,'rgba(255,255,255,.95)');r.addColorStop(.4,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);
}
export function makeJet(enemy=false){
  const jet=new T.Group();const mat=enemy?metal(0x566976,.54,.48):bodyMat;
  const fuselage=loft([[-8.1,.015,.025,.05],[-6.8,.47,.27,.02],[-4.5,.83,.48,.02],[-2.8,1.11,.65,.02],[-.8,1.55,.61,0],[2,1.73,.57,0],[4.3,1.8,.48,0],[6,1.38,.38,0]],mat,12);jet.add(fuselage);
  for(const s of [-1,1]){
    const wing=plate([[s*1.03,-3.3],[s*2.08,-2.2],[s*6.95,2.3],[s*6.3,3.7],[s*1.7,2.0]],.13,mat);wing.position.y=.03;jet.add(wing);
    const tail=plate([[s*1.35,2.8],[s*4.05,5.4],[s*3.55,6.25],[s*1.1,5.35]],.12,mat);tail.position.y=.25;jet.add(tail);
    const pod=loft([[-1.5,.55,.57,.02],[.3,.79,.62,.02],[4.7,.75,.58,.03],[6.25,.61,.48,.02]],mat,10);pod.position.x=s*.93;jet.add(pod);
    const intake=plate([[s*.95,-3.2],[s*1.78,-2.7],[s*2.05,-1.1],[s*1.3,-1.4]],.1,edgeMat);intake.position.y=-.27;jet.add(intake);
    const intakeHole=box(jet,.65,.44,.13,s*1.42,-.17,-2.25,darkMat);intakeHole.rotation.y=s*-.2;
    // Twin outward-canted vertical stabilizers.
    const fin=plate([[0,2.4],[s*2.5,4.4],[s*2.45,5.8],[0,5.15]],.11,mat);fin.rotation.z=s*Math.PI/2-s*.32;fin.position.set(s*1.14,.38,0);jet.add(fin);
    const nozzle=new T.Mesh(new T.CylinderGeometry(.49,.57,.9,16,1,true),nozzleMat);nozzle.rotation.x=Math.PI/2;nozzle.position.set(s*.94,.04,6.15);jet.add(nozzle);
    const hole=new T.Mesh(new T.CircleGeometry(.45,16),darkMat);hole.position.set(s*.94,.04,6.59);jet.add(hole);
    const fire=new T.Mesh(new T.ConeGeometry(.38,3.6,12),new T.MeshBasicMaterial({color:0x8bc5ff,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));fire.rotation.x=Math.PI/2;fire.position.set(s*.94,.04,7.65);jet.add(fire);
    const core=new T.Mesh(new T.ConeGeometry(.2,2.5,8),new T.MeshBasicMaterial({color:0xffe0bd,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));core.rotation.x=Math.PI/2;core.position.set(s*.94,.04,7.1);jet.add(core);
    jet.userData.flames??=[];jet.userData.flames.push(fire,core);
    lines(jet,[[[s*1.65,.15,-2.2],[s*6.3,.15,2.6],[s*5.98,.15,3.22]],[[s*2.3,.15,1.9],[s*5.0,.15,2.75]],[[s*2.62,.15,-.95],[s*2.8,.15,.38],[s*4.45,.15,1.55]],[[s*.32,.58,-1],[s*.35,.58,1.8],[s*1.2,.58,3.55]]]);
    const nav=new T.Mesh(new T.SphereGeometry(.085,6,4),new T.MeshBasicMaterial({color:s<0?0xff3434:0x45ffb5}));nav.position.set(s*6.72,.15,2.7);jet.add(nav);
  }
  const cockpit=new T.Mesh(new T.SphereGeometry(1,24,12),new T.MeshStandardMaterial({color:0x2b363d,metalness:.85,roughness:.13,transparent:true,opacity:.93,envMapIntensity:1.6}));cockpit.scale.set(.61,.43,1.7);cockpit.position.set(0,.58,-3.52);jet.add(cockpit);
  lines(jet,[[[-.59,.57,-4.0],[0,1.02,-3.6],[.59,.57,-4]],[[0,.84,-4.9],[0,1.0,-3.3],[0,.81,-2.02]]],0x35404a,.8);
  const chine=plate([[-.48,-6.4],[0,-7.9],[.48,-6.4],[.62,-5.3],[-.62,-5.3]],.04,edgeMat);chine.position.y=.28;jet.add(chine);
  const gear=new T.Group();jet.add(gear);for(const [x,z] of [[0,-4.25],[-1.48,1.2],[1.48,1.2]]){box(gear,.1,.8,.12,x,-.85,z,nozzleMat);const wheel=new T.Mesh(new T.CylinderGeometry(.28,.28,.22,12),tireMat);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-1.26,z);gear.add(wheel);}jet.userData.gear=gear;
  jet.userData.flames.forEach(f=>f.visible=enemy);return jet;
}

function deckTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=2048;const g=c.getContext('2d');g.fillStyle='#464f55';g.fillRect(0,0,512,2048);
  let seed=13;function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  for(let i=0;i<15000;i++){const v=Math.floor(55+rand()*55);g.fillStyle=`rgba(${v},${v+3},${v+5},.3)`;g.fillRect(rand()*512,rand()*2048,rand()*3+1,rand()*3+1);}
  g.strokeStyle='#303a40';g.lineWidth=1;for(let y=0;y<2048;y+=36){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}for(let x=0;x<512;x+=42){g.beginPath();g.moveTo(x,0);g.lineTo(x,2048);g.stroke();}
  g.strokeStyle='#d6d0b5';g.lineWidth=5;g.beginPath();g.moveTo(120,0);g.lineTo(120,1000);g.lineTo(285,2048);g.moveTo(300,0);g.lineTo(300,1000);g.lineTo(465,2048);g.stroke();
  g.strokeStyle='#c9c5ac';g.lineWidth=3;g.setLineDash([35,23]);g.beginPath();g.moveTo(210,0);g.lineTo(210,1040);g.lineTo(375,2048);g.stroke();g.setLineDash([]);
  g.strokeStyle='#e8bd5a';g.lineWidth=3;g.beginPath();g.moveTo(96,40);g.lineTo(96,920);g.stroke();
  g.strokeStyle='#dbd0b6';g.lineWidth=5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(15,1100+i*46);g.lineTo(325,1100+i*46);g.stroke();}
  g.fillStyle='#d9d8c9';g.font='bold 72px sans-serif';g.textAlign='center';g.fillText('18',209,188);g.font='bold 35px sans-serif';g.fillText('02',95,670);
  g.strokeStyle='#a89256';g.lineWidth=2;g.strokeRect(340,310,120,230);g.strokeRect(340,880,120,230);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;
}
export function makeCarrier(){
  const ship=new T.Group(),hull=metal(0x58636d,.67,.35),deck=metal(0x59626b,.8,.18),white=metal(0xb1b7b5,.7,.2);
  const h=loft([[-145,19,5.2,4],[-127,27,7.6,4],[-70,30,8.3,4],[60,30,8.3,4],[129,25,7.8,4],[145,16,5.5,4]],hull,8);ship.add(h);
  const deckMesh=plate([[-29,-146],[22,-146],[34,-122],[34,95],[26,147],[-31,147],[-39,112],[-39,20],[-30,-55]],.9,deck);deckMesh.position.y=13;ship.add(deckMesh);
  const flightDeck=new T.Mesh(new T.PlaneGeometry(60,289),new T.MeshStandardMaterial({map:deckTexture(),roughness:.83,metalness:.17}));flightDeck.rotation.x=-Math.PI/2;flightDeck.position.set(-.5,13.5,0);flightDeck.receiveShadow=true;ship.add(flightDeck);
  box(ship,14,6,47,22,16,-9,hull);box(ship,11,6,32,23,22,-10,hull);box(ship,11.8,2.9,17,23,26,-15,white);
  const glass=metal(0x142b38,.15,.65);box(ship,12,1.3,15,23,26.35,-15,glass);box(ship,12.5,.4,18,23,28,-15,white);box(ship,4,8,5,23,30,3,hull);box(ship,1,15,1,23,34,-8,hull);box(ship,10,.6,3,23,38,-8,hull);box(ship,.5,10,.5,23,40,2,hull);box(ship,6,1,1,23,42,2,white);
  for(let z=-130;z<145;z+=11){for(const x of [-29,29]){const light=new T.Mesh(new T.SphereGeometry(.18,5,3),new T.MeshBasicMaterial({color:x<0?0x73d6d1:0xe8c789}));light.position.set(x,13.75,z);ship.add(light);}}
  for(const [x,z,rot] of [[-23,67,-.35],[-24,99,-.35],[15,82,.1],[15,110,.1],[-23,29,-.35]]){const jet=makeJet();jet.scale.setScalar(.66);jet.position.set(x,14.3,z);jet.rotation.y=rot;ship.add(jet);}
  for(const x of [-23,-9]){box(ship,.55,.06,155,x,13.57,-60,nozzleMat);box(ship,1.1,.06,3,x,13.62,-116,white);}
  for(let z=-100;z<130;z+=40){box(ship,3,1.7,8,-31,11,z,hull);box(ship,3,1.7,8,31,11,z,hull);}
  ship.userData.deckHeight=13.5;return ship;
}
export function makeDestroyer(hostile=false){
  const g=new T.Group(),h=metal(hostile?0x414b58:0x677782,.66,.35),deck=metal(0x606c71,.65,.35);
  g.add(loft([[-43,.1,1,2],[-31,5.6,3.6,2],[18,6.2,3.6,2],[40,4.8,3.5,2]],h,8));box(g,10,1,68,0,5,3,deck);
  box(g,7,5,23,0,8,-3,h);box(g,5.5,4,14,0,12,-4,h);box(g,6,.9,7,0,13.3,-9,metal(0x1a3442,.2,.4));box(g,1,13,1,0,19,-1,h);box(g,7,.5,2,0,21,-1,h);box(g,4,3,5,0,15,10,h);
  const turret=new T.Mesh(new T.CylinderGeometry(1.5,2.1,2.5,6),h);turret.position.set(0,7,-28);g.add(turret);box(g,.35,.4,7,0,8,-32,h);
  for(let x=-2.5;x<=2.5;x+=1.5)for(let z=-17;z<-10;z+=1.8)box(g,1.1,.12,1.3,x,5.61,z,darkMat);
  return g;
}

const oceanVertex=`
  uniform float uTime; varying vec3 vWorld;
  float wave(vec2 p){return sin(p.x*.025+p.y*.019+uTime*.8)*.7+sin(p.x*.041-p.y*.029+uTime*1.15)*.42+sin(p.y*.082+p.x*.012+uTime*1.5)*.15;}
  void main(){vec4 world=modelMatrix*vec4(position,1.);world.y+=wave(world.xz);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}
`;
const oceanFragment=`
  uniform float uTime; uniform vec3 uSun; uniform vec3 uEye; varying vec3 vWorld;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  float height(vec2 p){float t=uTime;return sin(p.x*.025+p.y*.019+t*.8)*.7+sin(p.x*.041-p.y*.029+t*1.15)*.42+sin(p.y*.082+p.x*.012+t*1.5)*.15+noise(p*.25+vec2(t*.18,t*.08))*.22+noise(p*.67-vec2(t*.2,t*.22))*.07;}
  void main(){vec2 p=vWorld.xz;float e=.25;float h=height(p);vec3 n=normalize(vec3((h-height(p+vec2(e,0)))/e,1.,(h-height(p+vec2(0,e)))/e));vec3 view=normalize(uEye-vWorld);float fres=pow(1.-max(dot(n,view),0.),3.8);vec3 reflection=reflect(-view,n);
    vec3 deep=vec3(.015,.10,.135);vec3 shallow=vec3(.028,.18,.21);vec3 water=mix(deep,shallow,.25+noise(p*.013)*.35);
    vec3 sky=mix(vec3(.40,.47,.49),vec3(.17,.31,.44),clamp(reflection.y*2.3,0.,1.));float cloud=noise(reflection.xz*7.+reflection.y*5.);sky=mix(sky,vec3(.65,.62,.51),pow(cloud,3.)*.3);
    float sunSpec=pow(max(dot(reflection,uSun),0.),160.)*5.;float sunBroad=pow(max(dot(reflection,uSun),0.),14.)*.42;vec3 color=mix(water,sky,fres*.8)+vec3(1.,.64,.29)*(sunSpec+sunBroad);
    float foam=smoothstep(.79,1.,noise(p*.44+uTime*.1))*smoothstep(.2,.8,h)*.055;color+=foam*vec3(.6,.78,.75);
    float dist=length(uEye-vWorld);color=mix(color,vec3(.43,.49,.51),1.-exp(-dist*.00013));gl_FragColor=vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createWorld(scene,renderer){
  scene.fog=new T.FogExp2(0x9daeb7,.00038);
  const hemi=new T.HemisphereLight(0xbcd9ed,0x243d44,2.15);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffd9a5,3.7);sun.position.set(110,65,-480);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;sun.shadow.camera.near=1;sun.shadow.camera.far=750;sun.shadow.bias=-.0006;sun.shadow.normalBias=.18;scene.add(sun);scene.add(sun.target);
  const ocean=new T.Mesh(new T.PlaneGeometry(28000,28000,180,180),new T.ShaderMaterial({uniforms:{uTime:{value:0},uSun:{value:V(.23,.14,-.96).normalize()},uEye:{value:V()}},vertexShader:oceanVertex,fragmentShader:oceanFragment}));ocean.rotation.x=-Math.PI/2;scene.add(ocean);
  const skyGeo=new T.SphereGeometry(15000,48,32);const uv=skyGeo.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,clamp(uv.getY(i)*1.5-.5,0,1));
  const sky=new T.Mesh(skyGeo,new T.MeshBasicMaterial({color:0xc5d2de,side:T.BackSide,fog:false}));sky.rotation.y=-.35;scene.add(sky);
  const ready=new Promise(resolve=>{new T.TextureLoader().load('./assets/sky.png',texture=>{texture.colorSpace=T.SRGBColorSpace;texture.wrapS=T.RepeatWrapping;texture.minFilter=T.LinearFilter;sky.material.map=texture;sky.material.color.set(0xffffff);sky.material.needsUpdate=true;const env=texture.clone();env.mapping=T.EquirectangularReflectionMapping;env.needsUpdate=true;scene.environment=env;resolve();},undefined,()=>resolve());});
  const carrier=makeCarrier();scene.add(carrier);
  const escort=[];for(const [x,z,scale] of [[-320,-160,1],[-590,-490,1.2],[290,-510,1.05],[580,-1150,1.1]]){const d=makeDestroyer();d.position.set(x,0,z);d.scale.setScalar(scale);scene.add(d);escort.push(d);}
  const wakeTex=glowTexture();const wakes=[];for(const ship of [carrier,...escort]){for(let i=0;i<3;i++){const m=new T.Mesh(new T.PlaneGeometry(ship===carrier?42:13,ship===carrier?160:80),new T.MeshBasicMaterial({map:wakeTex,color:0xd4eddf,transparent:true,opacity:.16,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(ship.position.x+(i-1)*(ship===carrier?16:4),1.1,ship.position.z+(ship===carrier?200:72));scene.add(m);wakes.push(m);}}
  return {ready,carrier,ocean,sky,hemi,sun,escort,wakes,update(time,eye,plane){ocean.position.x=Math.round(eye.x/1000)*1000;ocean.position.z=Math.round(eye.z/1000)*1000;ocean.material.uniforms.uTime.value=time;ocean.material.uniforms.uEye.value.copy(eye);sky.position.copy(eye);sun.position.set(plane.x+110,plane.y+65,plane.z-480);sun.target.position.copy(plane);carrier.rotation.z=Math.sin(time*.3)*.0015;for(let i=0;i<wakes.length;i++)wakes[i].material.opacity=.14+Math.sin(time*.7+i)*.025;}};
}

export class ParticleSystem{
  constructor(scene,texture,max=700){this.max=max;this.items=[];this.positions=new Float32Array(max*3);this.colors=new Float32Array(max*3);this.sizes=new Float32Array(max);this.alphas=new Float32Array(max);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(this.positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('color',new T.BufferAttribute(this.colors,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('size',new T.BufferAttribute(this.sizes,1).setUsage(T.DynamicDrawUsage));geo.setAttribute('alpha',new T.BufferAttribute(this.alphas,1).setUsage(T.DynamicDrawUsage));this.mesh=new T.Points(geo,new T.ShaderMaterial({uniforms:{map:{value:texture},pixelScale:{value:window.innerHeight*.55}},vertexShader:`attribute float size;attribute float alpha;varying vec3 vColor;varying float vAlpha;uniform float pixelScale;void main(){vColor=color;vAlpha=alpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*pixelScale/-mv.z,1.,150.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform sampler2D map;varying vec3 vColor;varying float vAlpha;void main(){gl_FragColor=vec4(vColor,vAlpha)*texture2D(map,gl_PointCoord);}`,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));this.mesh.frustumCulled=false;scene.add(this.mesh);}
  emit(pos,vel,size,life,color,fade=.85){if(this.items.length>=this.max)this.items.shift();this.items.push({p:pos.clone(),v:vel.clone(),size,life,maxLife:life,color:new T.Color(color),fade});}
  burst(pos,count=50,scale=1){for(let i=0;i<count;i++){const v=V((Math.random()-.5)*35,(Math.random()-.3)*24,(Math.random()-.5)*35).multiplyScalar(scale);this.emit(pos,v,(3+Math.random()*9)*scale,.4+Math.random()*1.5,i%4?0xff9b38:0xffe6b1);}}
  update(dt){for(let i=this.items.length-1;i>=0;i--){const q=this.items[i];q.life-=dt;if(q.life<=0){this.items.splice(i,1);continue;}q.p.addScaledVector(q.v,dt);q.v.multiplyScalar(Math.exp(-dt*.7));q.v.y+=dt*.8;}
    for(let i=0;i<this.max;i++){const q=this.items[i];if(q){this.positions[i*3]=q.p.x;this.positions[i*3+1]=q.p.y;this.positions[i*3+2]=q.p.z;this.colors[i*3]=q.color.r;this.colors[i*3+1]=q.color.g;this.colors[i*3+2]=q.color.b;this.sizes[i]=q.size*(1+(1-q.life/q.maxLife)*.5);this.alphas[i]=Math.min(1,q.life/q.maxLife*2)*q.fade;}else{this.sizes[i]=0;this.alphas[i]=0;}}
    for(const key of ['position','color','size','alpha'])this.mesh.geometry.attributes[key].needsUpdate=true;this.mesh.geometry.setDrawRange(0,this.items.length);
  }
  clear(){this.items.length=0;this.update(0);}
}
