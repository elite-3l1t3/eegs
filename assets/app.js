(()=>{
const d=document,$=s=>d.querySelector(s),$$=s=>[...d.querySelectorAll(s)],
W='https://eegs.e05729613.workers.dev',G=35654822,R=d.documentElement.dataset.root||'',
rm=matchMedia('(prefers-reduced-motion:reduce)').matches,
J=(u,o)=>fetch(u,o).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}),
F=n=>Number(n).toLocaleString('en-US'),
K=n=>n>=1e6?(n/1e6).toFixed(1).replace('.0','')+'M':n>=1e3?(n/1e3).toFixed(1).replace('.0','')+'K':''+n,
E=(t,c,x)=>{const e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e},
EN=window.EN||{};
let L='mn';try{if(localStorage.getItem('eg-lang')==='en')L='en'}catch(e){}
const t=(m,e)=>L==='en'?e:m;

/* ---- хэл: MN үндсэн, EN сонголт ---- */
const orig=new WeakMap(),oattr=new WeakMap();let t0=d.title,m0=($('meta[name=description]')||{}).content;
function tr(){const en=L==='en',w=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT);let n;
d.documentElement.lang=en?'en':'mn';
while(n=w.nextNode()){if(n.parentNode.closest('script,style,[data-nt]'))continue;let o=orig.get(n);
if(o===undefined){const k=n.nodeValue.trim();o=k&&EN[k]?{k,raw:n.nodeValue}:null;orig.set(n,o)}
if(o)n.nodeValue=en?o.raw.replace(o.k,EN[o.k]):o.raw}
$$('[aria-label],[alt],[placeholder]').forEach(e=>['aria-label','alt','placeholder'].forEach(a=>{const v=e.getAttribute(a);if(v==null)return;const m=oattr.get(e)||{};if(!(a in m)){m[a]=v;oattr.set(e,m)}if(EN[m[a]])e.setAttribute(a,en?EN[m[a]]:m[a])}));
if(EN[t0])d.title=en?EN[t0]:t0;const md=$('meta[name=description]');if(md&&EN[m0])md.content=en?EN[m0]:m0;
const lb=$('#lang');if(lb){lb.textContent=en?'MN':'EN';lb.setAttribute('aria-label',en?'Монгол хэл рүү шилжих':'Switch to English')}}
const lb=$('#lang');if(lb)lb.onclick=()=>{L=L==='en'?'mn':'en';try{localStorage.setItem('eg-lang',L)}catch(e){}tr();news();upd();const s=$('#ids');if(s)s.textContent=''};

/* ---- хуулбар, зураг хадгалалтаас хамгаалах ---- */
d.addEventListener('contextmenu',e=>{if(!e.target.closest('a,.sel,input'))e.preventDefault()});
d.addEventListener('dragstart',e=>e.preventDefault());
$$('img').forEach(i=>i.draggable=false);

/* ---- scroll animation ---- */
$$('.rv').forEach(e=>e.style.setProperty('--i',Math.min([...e.parentElement.children].indexOf(e),6)));
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'}):null;
$$('.rv').forEach(e=>io?io.observe(e):e.classList.add('in'));
$$('img[data-c]').forEach(i=>i.addEventListener('error',()=>{if(i.src!==i.dataset.c)i.src=i.dataset.c},{once:true}));

/* ---- яг одооны тоо ---- */
const cur=new WeakMap(),bump=e=>{e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')};
function num(el,to){if(!el)return;const from=cur.get(el);cur.set(el,to);if(from===to)return;
if(rm){el.textContent=F(to);return}
const a=from===undefined?0:from,s0=performance.now(),s=n=>{const p=Math.min(1,(n-s0)/700);el.textContent=F(Math.round(a+(to-a)*(1-(1-p)**3)));if(p<1)requestAnimationFrame(s)};
requestAnimationFrame(s);if(from!==undefined)bump(el)}
let GD=null,ids=null;
function upd(){const ul=$('#ul');if(!ul||!GD)return;ul.textContent='';
[...GD].sort((a,b)=>new Date(b.updated)-new Date(a.updated)).forEach(x=>{const dd=Math.max(0,Math.floor((Date.now()-new Date(x.updated))/864e5)),li=E('li'),a=E('a','',x.name);
a.href='https://www.roblox.com/games/'+x.rootPlaceId;a.target='_blank';a.rel='noopener';
li.append(a,E('span','',dd?t(dd+' өдрийн өмнө',dd+' days ago'):t('өнөөдөр','today')));ul.append(li)});$('#uw').hidden=false}
function paint(){if(!GD)return;let p=0,v=0;
GD.forEach(x=>{p+=x.playing;v+=x.visits;
$$(`[data-p="${x.rootPlaceId}"]`).forEach(c=>{num(c.querySelector('.pl'),x.playing);c.querySelector('.vs').textContent=K(x.visits);c.querySelector('.lv').hidden=false});
if($(`[data-page="${x.rootPlaceId}"]`)){num($('[data-g=playing]'),x.playing);$('[data-g=visits]').textContent=F(x.visits);$('[data-g=fav]').textContent=F(x.favoritedCount);$('[data-g=updated]').textContent=new Date(x.updated).toLocaleDateString('en-CA')}});
num($('#sp'),p);const sv=$('#sv');if(sv)sv.textContent=K(v);upd()}
const games=()=>(ids||(ids=J(`${W}/games/v2/groups/${G}/games?accessFilter=Public&limit=100&sortOrder=Asc`).then(g=>g.data.map(x=>x.id))))
.then(i=>J(`${W}/games/v1/games?universeIds=${i}`)).then(r=>{GD=r.data;paint()}).catch(()=>{ids=null});
const mem=()=>J(`${W}/groups/v1/groups/${G}`).then(r=>num($('#sm'),r.memberCount)).catch(()=>{});
const poll=(f,ms)=>{f();setInterval(()=>{if(!d.hidden)f()},ms);d.addEventListener('visibilitychange',()=>{if(!d.hidden)f()})};
if($('#sm'))poll(mem,8000);
if($('#sp')||$('[data-page]'))poll(games,15000);

/* ---- багийн avatar ---- */
$$('[data-u]').forEach(a=>{const u=a.dataset.u,k='av2:'+u;let c=null;try{c=JSON.parse(localStorage.getItem(k))}catch(e){}
const put=s=>{const i=new Image();i.alt='';i.width=i.height=150;i.draggable=false;i.onload=()=>a.append(i);i.src=s};
if(c&&c.t>Date.now()-864e5)return put(c.s);
J(`${W}/users/v1/usernames/users`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({usernames:[u],excludeBannedUsers:true})})
.then(r=>J(`${W}/thumbnails/v1/users/avatar-headshot?userIds=${r.data[0].id}`)).then(r=>{const s=r.data[0].imageUrl;if(!s)return;try{localStorage.setItem(k,JSON.stringify({s,t:Date.now()}))}catch(e){}put(s)}).catch(()=>{})});

/* ---- мэдээ (news.json) ---- */
let NW=[];const pick=(o,k)=>(L==='en'&&o[k+'_en'])||o[k]||'';
function news(){const ul=$('#nl'),ne=$('#ne');if(!ul)return;ul.textContent='';
NW.slice(0,4).forEach(x=>{const li=E('li','n');if(x.tag)li.append(E('span','tag',pick(x,'tag')));
const m=[x.game,x.date].filter(Boolean).join(', ');if(m)li.append(E('span','d',m));
li.append(E('h3','',pick(x,'title')),E('p','',pick(x,'text')));
if(/^https:\/\//.test(x.link||'')){const a=E('a','btn',pick(x,'linkText')||t('Дэлгэрэнгүй','Details'));a.href=x.link;a.target='_blank';a.rel='noopener';li.append(a)}ul.append(li)});
if(ne)ne.hidden=NW.length>0}
if($('#nl'))J(R+'news.json',{cache:'no-cache'}).then(n=>{NW=n.news||[];news()}).catch(()=>{});

/* ---- холбоос хуваалцах (тоглоомын хуудас) ---- */
const sh=$('#sh');if(sh)sh.onclick=()=>{const u=location.href;
if(navigator.share)navigator.share({title:d.title,url:u}).catch(()=>{});
else if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>{$('#shn').textContent=t('Холбоос хууллаа.','Link copied.')},()=>{})};

/* ---- гишүүний карт ---- */
const f=$('#idf');if(f){
const inp=$('#idn'),st=$('#ids'),out=$('#ido'),cv=$('#idc'),c=cv.getContext('2d'),FF='"Exo 2",system-ui,sans-serif',shb=$('#idshare');
let cd=null,busy=false;const say=(m,e)=>st.textContent=t(m,e);
const img=(u,cors)=>new Promise(r=>{const i=new Image();if(cors)i.crossOrigin='anonymous';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=u});
const fit=(s,w,z,wt)=>{do{c.font=`${wt} ${z}px ${FF}`;z-=2}while(c.measureText(s).width>w&&z>14)};
async function build(n){
const r=await J(`${W}/users/v1/usernames/users`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({usernames:[n],excludeBannedUsers:true})}),u=r.data&&r.data[0];
if(!u)throw new Error('nf');
const[a,b,g]=await Promise.all([J(`${W}/users/v1/users/${u.id}`),J(`${W}/thumbnails/v1/users/avatar-headshot?userIds=${u.id}`).catch(()=>null),J(`${W}/groups/v1/users/${u.id}/groups/roles`).catch(()=>null)]);
let role=null;((g&&g.data)||[]).forEach(x=>{if(x.group&&x.group.id===G&&x.role)role=x.role});
const th=b&&b.data&&b.data[0];
return{id:u.id,name:a.name||u.name,disp:a.displayName||'',year:a.created?new Date(a.created).getUTCFullYear():'-',rank:g?(role?role.name:'GUEST'):'-',top:!!(role&&role.rank>=255),url:th&&th.state==='Completed'?th.imageUrl:null}}
async function draw(x,av0=true){
try{if(d.fonts)await Promise.all([d.fonts.load('800 60px "Exo 2"'),d.fonts.load('700 30px "Exo 2"')])}catch(e){}
const[av,logo]=await Promise.all([av0&&x.url?img(`${W}/img?u=${encodeURIComponent(x.url)}`,1):null,img(R+'assets/img/logo-mark.webp')]);
const g=c.createLinearGradient(0,0,1000,560);g.addColorStop(0,'#0a1730');g.addColorStop(1,'#050b16');c.fillStyle=g;c.fillRect(0,0,1000,560);
const rg=c.createRadialGradient(800,140,10,800,140,420);rg.addColorStop(0,'rgba(79,195,247,.3)');rg.addColorStop(1,'rgba(79,195,247,0)');c.fillStyle=rg;c.fillRect(0,0,1000,560);
c.strokeStyle='rgba(120,190,255,.25)';c.lineWidth=2;c.strokeRect(24,24,952,512);
[[430,'#4fc3f7'],[330,'#2f7fd0'],[230,'#1c4f9c']].forEach(([w,col],i)=>{const y=450+i*26;c.fillStyle=col;c.beginPath();c.moveTo(74,y);c.lineTo(74+w,y);c.lineTo(60+w,y+14);c.lineTo(60,y+14);c.closePath();c.fill()});
c.save();c.beginPath();c.moveTo(100,70);c.lineTo(370,70);c.lineTo(340,350);c.lineTo(70,350);c.closePath();c.clip();
c.fillStyle='#12305e';c.fillRect(60,60,320,300);
if(av)c.drawImage(av,75,75,280,270);else if(logo)c.drawImage(logo,125,100,190,198);
c.restore();c.strokeStyle='#4fc3f7';c.lineWidth=4;c.beginPath();c.moveTo(100,70);c.lineTo(370,70);c.lineTo(340,350);c.lineTo(70,350);c.closePath();c.stroke();
if(logo)c.drawImage(logo,850,52,100,104);
const acc=x.top?'#bdeeff':x.rank==='GUEST'||x.rank==='-'?'#9db4cc':'#4fc3f7';
c.textBaseline='alphabetic';c.fillStyle='#9db4cc';c.font=`700 20px ${FF}`;
c.fillText('NAME',420,98);c.fillText('RANK',420,258);c.fillText('ROBLOX SINCE',420,350);c.fillText('ROBLOX ID',640,350);
c.fillStyle='#eaf6ff';fit(x.name,400,58,800);c.fillText(x.name,420,160);
if(x.disp&&x.disp!==x.name){c.fillStyle='#9db4cc';fit('@ '+x.disp,400,24,700);c.fillText(x.disp,420,196)}
c.fillStyle=acc;fit(x.rank,520,46,800);c.fillText(x.rank,420,310);
c.fillStyle='#eaf6ff';c.font=`800 34px ${FF}`;c.fillText(String(x.year),420,392);fit(String(x.id),300,34,800);c.fillText(String(x.id),640,392);
c.fillStyle='#bdeeff';c.font=`800 30px ${FF}`;c.fillText('ELITE GAME$',420,508);
c.fillStyle='#9db4cc';c.font=`700 20px ${FF}`;c.textAlign='right';c.fillText('eegs.blog',940,508);c.textAlign='left';
cv.setAttribute('aria-label','ELITE GAME$ card: '+x.name+', '+x.rank)}
const blob=()=>new Promise((r,j)=>cv.toBlob(b=>b?r(b):j(new Error('blob')),'image/png'));
const getBlob=async()=>{try{return await blob()}catch(e){await draw(cd,false);return await blob()}};
$('#idsave').onclick=async()=>{if(!cd)return;try{const b=await getBlob(),a=E('a');a.href=URL.createObjectURL(b);a.download='elite-games-'+cd.name+'.png';d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);say('Карт татагдлаа.','Card downloaded.')}catch(e){say('Татаж чадсангүй. Дахин оролдоно уу.','Could not download. Please try again.')}};
if(navigator.canShare&&window.File)shb.hidden=false;
shb.onclick=async()=>{if(!cd)return;try{const fl=new File([await getBlob()],'elite-games-'+cd.name+'.png',{type:'image/png'});if(navigator.canShare({files:[fl]}))await navigator.share({files:[fl],title:'ELITE GAME$',text:'eegs.blog'});else say('Хуваалцах боломжгүй байна. "PNG татах" товчийг ашиглана уу.','Sharing is not available. Use the "Download PNG" button.')}catch(e){if(e.name!=='AbortError')say('Хуваалцаж чадсангүй.','Could not share.')}};
f.onsubmit=async e=>{e.preventDefault();if(busy)return;const n=inp.value.trim().replace(/^@/,'');
if(!/^[A-Za-z0-9_]{3,20}$/.test(n)){say('Roblox нэр 3-20 тэмдэгт (латин үсэг, тоо, _) байх ёстой.','A Roblox username has 3-20 characters (letters, numbers, _).');return}
busy=true;out.hidden=true;cd=null;say('Хайж байна...','Looking you up...');
try{cd=await build(n);await draw(cd);out.hidden=false;say('Карт бэлэн боллоо. Доорх товчоор татаж аваарай.','Your card is ready. Download it with the button below.')}
catch(er){const m=er.message;if(m==='nf')say('Ийм Roblox хэрэглэгч олдсонгүй. Нэрээ шалгана уу.','No Roblox user with that name. Check the spelling.');else if(m==='429')say('Roblox түр хязгаарласан байна. Хэсэг хүлээгээд дахин оролдоно уу.','Roblox is rate-limiting requests. Please wait a moment and try again.');else say('Мэдээлэл авч чадсангүй. Дараа дахин оролдоно уу.','Could not fetch the data. Please try again later.')}
setTimeout(()=>busy=false,1200)}}

if(L==='en')tr();
})();
