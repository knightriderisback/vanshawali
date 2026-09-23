import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/loaders/GLTFLoader.js";
import { CSS2DRenderer, CSS2DObject } from "https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/renderers/CSS2DRenderer.js";

const ASSETS = {
  male:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Superhero_Male_FullBody.glb",
  female:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Superhero_Female_FullBody.glb",
  hairLong:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Hair_Long_rigged.glb",
  hairBuns:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Hair_Buns_rigged.glb",
  hairBuzz:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Hair_Buzzed_rigged.glb",
  hairParted:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Hair_SimpleParted_rigged.glb",
  beard:"https://raw.githubusercontent.com/Ashen-Skool/Aot-Fable-5.1/main/assets/staged/anim/UBC_Hair_Beard_rigged.glb"
};
const REL = {
  parent:{label:"Parent / Child",color:0xd6b85f,width:.075},
  spouse:{label:"Spouse / Marriage",color:0x6fd4ff,width:.095},
  sibling:{label:"Sibling",color:0x9a8cff,width:.055},
  adoption:{label:"Adoption",color:0x61d58b,width:.065},
  step:{label:"Step relationship",color:0xff8a72,width:.06}
};
const KEY="vansh-vruksh-3d-v2";
const demoPeople=[
{id:"ravi",name:"Raghunath",gender:"male",age:"elder",birth:"1942",occupation:"Teacher",place:"Nagpur",notes:"Family elder and storyteller.",generation:0},
{id:"sita",name:"Savitri",gender:"female",age:"elder",birth:"1946",occupation:"Homemaker",place:"Nagpur",generation:0},
{id:"mohan",name:"Mohan",gender:"male",age:"adult",birth:"1968",occupation:"Engineer",place:"Raipur",generation:1},
{id:"lata",name:"Lata",gender:"female",age:"adult",birth:"1971",occupation:"Teacher",place:"Raipur",generation:1},
{id:"rajesh",name:"Rajesh",gender:"male",age:"adult",birth:"1970",occupation:"Entrepreneur",place:"Delhi",generation:1},
{id:"neha",name:"Neha",gender:"female",age:"adult",birth:"1974",occupation:"Designer",place:"Delhi",generation:1},
{id:"amit",name:"Amit",gender:"male",age:"adult",birth:"1992",occupation:"Product Manager",place:"Pune",generation:2},
{id:"pooja",name:"Pooja",gender:"female",age:"adult",birth:"1994",occupation:"Architect",place:"Pune",generation:2},
{id:"karan",name:"Karan",gender:"male",age:"adult",birth:"1990",occupation:"Developer",place:"Bengaluru",generation:2},
{id:"rhea",name:"Rhea",gender:"female",age:"adult",birth:"1993",occupation:"Marketing",place:"Mumbai",generation:2},
{id:"arjun",name:"Arjun",gender:"teen",birth:"2009",gender:"male",age:"teen",occupation:"Student",place:"Pune",generation:3},
{id:"tara",name:"Tara",gender:"female",age:"child",birth:"2015",occupation:"Student",place:"Pune",generation:3},
{id:"vihaan",name:"Vihaan",gender:"male",age:"child",birth:"2017",occupation:"Student",place:"Bengaluru",generation:3}
];
const demoRelationships=[
{id:"p1",from:"ravi",to:"mohan",type:"parent"},{id:"p2",from:"sita",to:"mohan",type:"parent"},
{id:"p3",from:"ravi",to:"rajesh",type:"parent"},{id:"p4",from:"sita",to:"rajesh",type:"parent"},
{id:"s1",from:"mohan",to:"lata",type:"spouse"},{id:"s2",from:"rajesh",to:"neha",type:"spouse"},
{id:"sib1",from:"mohan",to:"rajesh",type:"sibling"},
{id:"p5",from:"mohan",to:"amit",type:"parent"},{id:"p6",from:"lata",to:"amit",type:"parent"},
{id:"p7",from:"mohan",to:"pooja",type:"parent"},{id:"p8",from:"lata",to:"pooja",type:"parent"},
{id:"p9",from:"rajesh",to:"karan",type:"parent"},{id:"p10",from:"neha",to:"karan",type:"parent"},
{id:"p11",from:"rajesh",to:"rhea",type:"parent"},{id:"p12",from:"neha",to:"rhea",type:"parent"},
{id:"s3",from:"amit",to:"pooja",type:"sibling"},{id:"s4",from:"karan",to:"rhea",type:"sibling"},
{id:"sp3",from:"amit",to:"pooja",type:"spouse"},{id:"sp4",from:"karan",to:"rhea",type:"spouse"},
{id:"p13",from:"amit",to:"arjun",type:"parent"},{id:"p14",from:"pooja",to:"arjun",type:"parent"},
{id:"p15",from:"amit",to:"tara",type:"parent"},{id:"p16",from:"pooja",to:"tara",type:"parent"},
{id:"p17",from:"karan",to:"vihaan",type:"parent"},{id:"p18",from:"rhea",to:"vihaan",type:"parent"}
];
let state={title:"Vansh Vruksh 3D",people:demoPeople,relationships:demoRelationships,selected:null,generation:[0,3],labels:true};
let scene,camera,renderer,labelRenderer,controls,loader;
const nodes=new Map(),lineGroup=new THREE.Group(),nodeGroup=new THREE.Group();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let assets={}, animFrame=0;

const $=id=>document.getElementById(id);
const toast=msg=>{const e=$("toast");e.textContent=msg;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2200)};
const save=()=>localStorage.setItem(KEY,JSON.stringify({title:state.title,people:state.people,relationships:state.relationships,labels:state.labels}));
const hydrate=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&Array.isArray(x.people)&&Array.isArray(x.relationships)){state={...state,...x,selected:null,generation:[0,Math.max(0,...x.people.map(p=>p.generation||0))]};return true}}catch(e){}return false};
const uid=p=>p+"_"+Math.random().toString(36).slice(2,9);
const person=id=>state.people.find(p=>p.id===id);
function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x070910);scene.fog=new THREE.FogExp2(0x070910,.018);
  camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,300);camera.position.set(0,5,30);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;$("scene").appendChild(renderer.domElement);
  labelRenderer=new CSS2DRenderer();labelRenderer.setSize(innerWidth,innerHeight);labelRenderer.domElement.style.position="absolute";labelRenderer.domElement.style.inset="0";labelRenderer.domElement.style.pointerEvents="none";$("scene").appendChild(labelRenderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=5;controls.maxDistance=85;controls.maxPolarAngle=Math.PI*.88;controls.target.set(0,4,0);
  scene.add(new THREE.HemisphereLight(0x9caed9,0x17131a,1.5));
  const key=new THREE.DirectionalLight(0xffe8b0,2.5);key.position.set(8,18,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
  const rim=new THREE.PointLight(0x5c77ff,25,55,2);rim.position.set(-15,7,-9);scene.add(rim);
  const gold=new THREE.PointLight(0xe2b85b,18,45,2);gold.position.set(13,3,5);scene.add(gold);
  scene.add(lineGroup,nodeGroup);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(38,96),new THREE.MeshStandardMaterial({color:0x0b0d15,roughness:.92,metalness:.08}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.3;floor.receiveShadow=true;scene.add(floor);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(11,.018,8,180),new THREE.MeshBasicMaterial({color:0x5c4e2e,transparent:true,opacity:.5}));ring.rotation.x=Math.PI/2;ring.position.y=-4.25;scene.add(ring);
  loader=new GLTFLoader();
  bindUI();
}
async function boot(){const had=hydrate();$("title").textContent=state.title;if(!had)save();updateCounts();await preload();rebuild();$("loading").classList.add("done");fit();animate()}
async function preload(){
  const list=[["male",ASSETS.male],["female",ASSETS.female],["hairLong",ASSETS.hairLong],["hairBuns",ASSETS.hairBuns],["hairBuzz",ASSETS.hairBuzz],["hairParted",ASSETS.hairParted],["beard",ASSETS.beard]];
  let done=0;for(const [k,url] of list){try{assets[k]=await loader.loadAsync(url);done++;$("loadText").textContent="Loading 3D characters · "+done+"/"+list.length}catch(e){console.warn("asset",k,e)}}
}
function ageScale(p){return p.age==="child"?.55:p.age==="teen"?.78:p.age==="elder"?.98:1}
function layout(){
  const gens=[...new Set(state.people.map(p=>p.generation||0))].sort((a,b)=>a-b), map=new Map();
  gens.forEach(g=>{const arr=state.people.filter(p=>(p.generation||0)===g);arr.forEach((p,i)=>{const x=(i-(arr.length-1)/2)*4.6;const y=5.4-g*5.2;map.set(p.id,new THREE.Vector3(x,y,0));})});
  return map;
}
function makeCharacter(p,pos){
  const source=assets[p.gender==="female"?"female":"male"];if(!source)return;
  const root=new THREE.Group();root.position.copy(pos);root.userData.id=p.id;root.scale.setScalar(ageScale(p));
  const body=source.scene.clone(true);
  body.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m=m.clone();if(m.color)m.color.set(p.gender==="female"?0xd5a8a0:0xb88f78);m.roughness=.7;m.metalness=.05;o.material=m})}});
  root.add(body);
  const hairKey=p.gender==="female"?(p.id.charCodeAt(0)%2?"hairLong":"hairBuns"):(p.age==="elder"?"hairBuzz":"hairParted");
  if(assets[hairKey]){const h=assets[hairKey].scene.clone(true);h.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=o.material.clone();if(o.material.color)o.material.color.set(p.gender==="female"?0x302019:0x241a15)}});root.add(h)}
  if(p.gender==="male"&&(p.age==="adult"||p.age==="elder")&&assets.beard){const b=assets.beard.scene.clone(true);root.add(b)}
  const halo=new THREE.Mesh(new THREE.RingGeometry(.72,.79,48),new THREE.MeshBasicMaterial({color:0x9c8350,transparent:true,opacity:.45,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;halo.position.y=-1.7;root.add(halo);
  const div=document.createElement("div");div.className="scene-label";div.textContent=p.name;const label=new CSS2DObject(div);label.position.set(0,2.05,0);root.add(label);label.visible=state.labels;
  root.userData.label=label;root.userData.halo=halo;root.userData.person=p;
  root.traverse(o=>{if(o.isMesh)o.userData.root=root});nodeGroup.add(root);nodes.set(p.id,root);
}
function makeLine(r,positions){
  const a=positions.get(r.from),b=positions.get(r.to);if(!a||!b)return;
  const mid=a.clone().lerp(b,.5);mid.z=r.type==="spouse"?1.6:(r.type==="sibling"?-.8:.7);mid.y+=(r.type==="parent"?0.4:0);
  const curve=new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(0,1,0)),mid,b.clone().add(new THREE.Vector3(0,1,0))]);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,36,REL[r.type].width,8,false),new THREE.MeshStandardMaterial({color:REL[r.type].color,emissive:REL[r.type].color,emissiveIntensity:.3,transparent:true,opacity:.88,roughness:.4,metalness:.15}));
  tube.userData={relationship:r};lineGroup.add(tube);
}
function rebuild(){
  while(nodeGroup.children.length)nodeGroup.remove(nodeGroup.children[0]);while(lineGroup.children.length)lineGroup.remove(lineGroup.children[0]);nodes.clear();
  const pos=layout();
  state.people.filter(p=>(p.generation||0)>=state.generation[0]&&(p.generation||0)<=state.generation[1]).forEach(p=>makeCharacter(p,pos.get(p.id)));
  state.relationships.forEach(r=>{if(nodes.has(r.from)&&nodes.has(r.to))makeLine(r,pos)});
  updateCounts();
}
function focus(id){const n=nodes.get(id);if(!n)return;state.selected=id;controls.target.lerp(n.position,.65);camera.position.lerp(new THREE.Vector3(n.position.x,n.position.y+3.5,n.position.z+12),.65);highlight();openPanel("person",id)}
function highlight(){
  const id=state.selected;
  nodes.forEach((n,k)=>{const on=!id||k===id||state.relationships.some(r=>(r.from===id&&r.to===k)||(r.to===id&&r.from===k));n.scale.multiplyScalar(1);n.traverse(o=>{if(o.isMesh&&o.material&&"opacity"in o.material){o.material.opacity=on?1:.25;o.material.transparent=!on}})});
  lineGroup.children.forEach(l=>{const r=l.userData.relationship;const on=!id||r.from===id||r.to===id; l.material.opacity=on?.9:.09;l.material.emissiveIntensity=on?.5:.05});
}
function fit(){controls.target.set(0,0,0);camera.position.set(0,4,Math.max(28,Math.min(65,state.people.length*2.4)));controls.update()}
function updateCounts(){$("peopleCount").textContent=state.people.length;$("bondCount").textContent=state.relationships.length}
function openPanel(type,id){
  const p=$("panel");p.classList.remove("hidden");
  if(type==="person"){const x=person(id);if(!x)return;const rels=state.relationships.filter(r=>r.from===id||r.to===id);p.innerHTML='<button class="close" data-close>×</button><h2>'+esc(x.name)+'</h2><p>'+esc(x.gender)+' · '+esc(x.age||"adult")+' · '+esc(x.birth||"year unknown")+'</p><div class="person-card"><strong>'+esc(x.occupation||"Family member")+'</strong><span>'+esc(x.place||"Location not recorded")+'</span></div><h3>Story / notes</h3><p>'+esc(x.notes||"No story added yet.")+'</p><h3>Relationships</h3>'+rels.map(r=>{const other=person(r.from===id?r.to:r.from);return '<div class="rel"><span class="dot" style="background:#'+REL[r.type].color.toString(16)+'"></span><span>'+esc(REL[r.type].label)+' · '+esc(other?other.name:"Unknown")+'</span></div>'}).join("")+'<div class="row" style="margin-top:16px"><button class="primary" data-edit="'+id+'">Edit</button><button class="danger" data-delete="'+id+'">Delete</button></div>'}
  else if(type==="legend"){p.innerHTML='<button class="close" data-close>×</button><h2>Relationship map</h2><p>Every connection is a real 3D tube between human character nodes.</p>'+Object.keys(REL).map(k=>'<div class="legend-item"><span class="legend-line" style="background:#'+REL[k].color.toString(16)+';color:#'+REL[k].color.toString(16)+'"></span><div><b>'+REL[k].label+'</b></div></div>').join("")}
  else if(type==="data"){p.innerHTML='<button class="close" data-close>×</button><h2>Family archive</h2><p>Data stays in this browser unless you export it.</p><div class="row"><button class="primary" id="export">Export JSON</button><button id="importBtn">Import JSON</button></div><input id="importFile" type="file" accept=".json,application/json" style="display:none"><h3>Current archive</h3><p>'+state.people.length+' people · '+state.relationships.length+' relationships</p><button class="danger" id="fresh">Start fresh</button><p class="hint">The 3D assets are CC0 Quaternius Universal Base Characters.</p>'}
  else if(type==="relationship"){p.innerHTML='<button class="close" data-close>×</button><h2>Connections</h2><p>Add a typed relationship between any two family members.</p><div class="field"><label>From</label><select id="rf">'+personOptions()+'</select></div><div class="field"><label>Type</label><select id="rt">'+Object.keys(REL).map(k=>'<option value="'+k+'">'+REL[k].label+'</option>').join("")+'</select></div><div class="field"><label>To</label><select id="rr">'+personOptions()+'</select></div><button class="primary" id="addRel">Add connection</button><h3>Existing</h3>'+state.relationships.map(r=>'<div class="rel"><span class="dot" style="background:#'+REL[r.type].color.toString(16)+'"></span><span style="flex:1">'+esc(person(r.from)?.name||"?")+' → '+esc(person(r.to)?.name||"?")+'</span><button data-rel-delete="'+r.id+'">×</button></div>').join("")}
  else if(type==="filters"){p.innerHTML='<button class="close" data-close>×</button><h2>View controls</h2><div class="field"><label>Visible generations</label><div class="grid2"><input id="gmin" type="number" value="'+state.generation[0]+'"><input id="gmax" type="number" value="'+state.generation[1]+'"></div></div><button class="primary" id="applyFilter">Apply</button><h3>Navigation</h3><p>Drag to orbit. Right-drag to pan. Scroll or pinch to zoom. Tap a person to inspect; double-click to focus.</p><button id="labels">Toggle labels</button><button id="fit" style="margin-left:6px">Fit tree</button>'}
  else if(type==="add"){p.innerHTML='<button class="close" data-close>×</button><h2>Add family member</h2><p>Create a real data node; the 3D miniature appears immediately.</p>'+personForm("add")}
  bindPanel();
}
function personOptions(){return state.people.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")}
function personForm(mode,id){
  const p=id?person(id):{name:"",gender:"male",age:"adult",birth:"",occupation:"",place:"",notes:"",generation:2};
  return '<div class="field"><label>Name</label><input id="pn" value="'+escAttr(p.name)+'"></div><div class="grid2"><div class="field"><label>Gender</label><select id="pg"><option '+(p.gender==="male"?"selected":"")+' value="male">Male</option><option '+(p.gender==="female"?"selected":"")+' value="female">Female</option></select></div><div class="field"><label>Age group</label><select id="pa">'+["child","teen","adult","elder"].map(v=>'<option '+(p.age===v?"selected":"")+'>'+v+'</option>').join("")+'</select></div></div><div class="grid2"><div class="field"><label>Birth year</label><input id="pb" value="'+escAttr(p.birth||"")+'"></div><div class="field"><label>Generation</label><input id="pgen" type="number" value="'+(p.generation??2)+'"></div></div><div class="field"><label>Occupation</label><input id="po" value="'+escAttr(p.occupation||"")+'"></div><div class="field"><label>Location</label><input id="pl" value="'+escAttr(p.place||"")+'"></div><div class="field"><label>Notes / story</label><textarea id="pnotes">'+esc(p.notes||"")+'</textarea></div><button class="primary" id="savePerson">'+(mode==="edit"?"Save changes":"Create person")+'</button>'}
function bindPanel(){
  $("panel").querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{$("panel").classList.add("hidden")});
  const savePersonBtn=$("savePerson");if(savePersonBtn)savePersonBtn.onclick=()=>{const id=savePersonBtn.dataset.id;const p={id:id||uid("person"),name:$("pn").value.trim()||"Unnamed",gender:$("pg").value,age:$("pa").value,birth:$("pb").value.trim(),generation:Number($("pgen").value)||0,occupation:$("po").value.trim(),place:$("pl").value.trim(),notes:$("pnotes").value.trim()};if(id){const old=person(id);Object.assign(old,p)}else state.people.push(p);save();rebuild();$("panel").classList.add("hidden");toast(id?"Person updated":"Person added")};
  const exp=$("export");if(exp)exp.onclick=()=>{const blob=new Blob([JSON.stringify({version:2,title:state.title,people:state.people,relationships:state.relationships},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="vansh-vruksh-family.json";a.click();URL.revokeObjectURL(a.href)};
  const imp=$("importBtn");if(imp)imp.onclick=()=>$("importFile").click();const file=$("importFile");if(file)file.onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x.people)||!Array.isArray(x.relationships))throw Error("Invalid archive");state.people=x.people;state.relationships=x.relationships;state.title=x.title||"Vansh Vruksh 3D";state.generation=[0,Math.max(0,...state.people.map(p=>p.generation||0))];save();rebuild();$("panel").classList.add("hidden");toast("Family archive imported")}catch(err){toast("Import failed")}};
  const fresh=$("fresh");if(fresh)fresh.onclick=()=>{if(confirm("Start a new empty family?")){state.people=[];state.relationships=[];state.selected=null;state.generation=[0,0];save();rebuild();openPanel("add")}};
  const ar=$("addRel");if(ar)ar.onclick=()=>{const from=$("rf").value,to=$("rr").value,type=$("rt").value;if(from===to)return toast("Choose two different people");state.relationships.push({id:uid("rel"),from,to,type});save();rebuild();openPanel("relationship");toast("Relationship added")};
  $("panel").querySelectorAll("[data-rel-delete]").forEach(b=>b.onclick=()=>{state.relationships=state.relationships.filter(r=>r.id!==b.dataset.relDelete);save();rebuild();openPanel("relationship")});
  $("panel").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const p=$("panel");p.innerHTML='<button class="close" data-close>×</button><h2>Edit member</h2>'+personForm("edit",b.dataset.edit);$("savePerson").dataset.id=b.dataset.edit;bindPanel()});
  $("panel").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(!confirm("Delete this person and all connections?"))return;state.people=state.people.filter(p=>p.id!==b.dataset.delete);state.relationships=state.relationships.filter(r=>r.from!==b.dataset.delete&&r.to!==b.dataset.delete);state.selected=null;save();rebuild();$("panel").classList.add("hidden")});
  const apply=$("applyFilter");if(apply)apply.onclick=()=>{state.generation=[Number($("gmin").value)||0,Number($("gmax").value)||0];rebuild();toast("Generation filter applied")};
  const labels=$("labels");if(labels)labels.onclick=()=>{state.labels=!state.labels;nodes.forEach(n=>n.userData.label.visible=state.labels);save()};
  const fitBtn=$("fit");if(fitBtn)fitBtn.onclick=fit;
}
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function escAttr(s){return esc(s).replace(/'/g,"&#39;")}
function bindUI(){
  document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==="reset")fit();if(a==="fullscreen"){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen()}if(a==="add")openPanel("add");if(a==="data")openPanel("data");if(a==="legend")openPanel("legend");if(a==="relationship")openPanel("relationship");if(a==="filters")openPanel("filters")});
  $("search").oninput=e=>{const q=e.target.value.toLowerCase().trim(),box=$("results");if(!q){box.style.display="none";return}const hits=state.people.filter(p=>(p.name+" "+(p.place||"")+" "+(p.occupation||"")).toLowerCase().includes(q)).slice(0,7);box.innerHTML=hits.map(p=>'<button data-search-id="'+p.id+'">'+esc(p.name)+'<small>'+esc(p.occupation||"Family member")+' · '+esc(p.place||"")+'</small></button>').join("");box.style.display=hits.length?"block":"none";box.querySelectorAll("[data-search-id]").forEach(x=>x.onclick=()=>{focus(x.dataset.searchId);box.style.display="none";$("search").value=""})};
  renderer.domElement.addEventListener("pointerdown",e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(nodeGroup.children,true);const hit=hits.find(h=>h.object.userData.root);if(hit){const id=hit.object.userData.root.userData.id;focus(id)}});
  window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);labelRenderer.setSize(innerWidth,innerHeight)});
}
function animate(){animFrame=requestAnimationFrame(animate);controls.update();const t=performance.now()*.001;lineGroup.rotation.y=Math.sin(t*.12)*.015;nodes.forEach((n,i)=>{const halo=n.userData.halo;if(halo)halo.material.opacity=.32+Math.sin(t*2+i.length)*.1});renderer.render(scene,camera);labelRenderer.render(scene,camera)}
function updateTitle(){const t=state.title;$("title").textContent=t}
init();boot();
