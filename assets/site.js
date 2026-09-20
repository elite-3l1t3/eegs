/* ELITE GAME$ - нэгдсэн скрипт (index болон тоглоомын хуудсууд) */
(function(){
'use strict';

/* ================= ТОХИРГОО ================= */
// Analytics (сонголттой). Нэгийг нь бөглөнө:
//   goatcounter: 'таны-код'  ->  https://таны-код.goatcounter.com
//   cloudflare:  'token'     ->  Cloudflare Web Analytics-ийн token
var ANALYTICS={goatcounter:'',cloudflare:''};
// live тоо: Cloudflare Worker хаяг (worker.js)
var LIVE={groupId:35654822,proxy:'https://eegs.e05729613.workers.dev',every:60000};
var DISCORD_CODE='s7nmDDhu8E';

/* ================= ТУСЛАХ ================= */
var ROOT=document.documentElement.getAttribute('data-root')||'';
function $(id){return document.getElementById(id);}
function $$(sel,root){return [].slice.call((root||document).querySelectorAll(sel));}
function has(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function norm(s){return s.replace(/\s+/g,' ').trim();}
function fmt(x){return Number(x).toLocaleString('en-US');}
function compact(n){
  n=Number(n)||0;
  if(n>=1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if(n>=1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if(n>=1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
}
var device=document.documentElement.getAttribute('data-device')||'pc';

/* ================= ХЭЛ (МН | EN) ================= */
var I=window.EG_I18N||{DICT:{},HTML:{}};
var LANG='mn';
try{
  var sv=localStorage.getItem('eg-lang');
  if(sv==='en'||sv==='mn') LANG=sv;
  else if(/^en/i.test(navigator.language||'')) LANG='en';
}catch(e){}
function t(mn,en){return (LANG==='en'&&en!==undefined)?en:mn;}
function pick(o,k){return (LANG==='en'&&o[k+'_en'])?o[k+'_en']:o[k];}

function translateDom(){
  var en=LANG==='en',D=I.DICT,H=I.HTML;
  document.documentElement.lang=en?'en':'mn';
  $$('title,body *').forEach(function(el){
    if(el.tagName==='SCRIPT'||el.tagName==='STYLE'||el.closest('svg')||el.closest('[data-nt]')) return;
    if(el.parentElement&&el.parentElement.closest('[data-k]')) return;
    var k=el.getAttribute('data-k');
    if(k&&has(H,k)){
      if(el.__o===undefined) el.__o=el.innerHTML;
      el.innerHTML=en?H[k]:el.__o;
    }else if(el.children.length===0){
      if(el.__o===undefined){
        var key=norm(el.textContent);
        el.__k=key;
        el.__o=(key&&has(D,key))?el.textContent:null;
      }
      if(el.__o!==null) el.textContent=en?D[el.__k]:el.__o;
    }
    if(el.tagName==='TITLE') return;
    ['aria-label','alt','title'].forEach(function(a){
      var v=el.getAttribute(a);
      if(v===null) return;
      el.__oa=el.__oa||{};
      if(!(a in el.__oa)){var kk=norm(v);el.__oa[a]={o:v,k:has(D,kk)?kk:null};}
      var r=el.__oa[a];
      if(r.k!==null) el.setAttribute(a,en?D[r.k]:r.o);
    });
  });
  var md=document.querySelector('meta[name="description"]');
  if(md){
    if(md.__o===undefined){var kd=norm(md.getAttribute('content')||'');md.__k=kd;md.__o=has(D,kd)?md.getAttribute('content'):null;}
    if(md.__o!==null) md.setAttribute('content',en?D[md.__k]:md.__o);
  }
}

/* ================= PIXEL ART ================= */
var PAL={'#':'#120a2e','W':'#ffffff','c':'#42e8ff','C':'#1b8fd6','R':'#e0245e','G':'#ffd23f','Y':'#ffd23f','K':'#000000','g':'#4dff88','S':'#c0c0c0','M':'#c4278f'};
var ART={
  diamond:['..######..','.#WWccCC#.','#WWcccCCC#','##########','.#cccCCC#.','..#ccCC#..','...#cC#...','....##....'],
  calendar:['##########','#RRRRRRRR#','##########','#W#W#W#WW#','#WWWWWWWW#','#W#W#W#WW#','#WWWWWWWW#','##########'],
  terminal:['SSSSSSSSSS','SKKKKKKKKS','SKgKKKKKKS','SKKgKKKKKS','SKgKKgggKS','SKKKKKKKKS','SKKKKKKKKS','SSSSSSSSSS'],
  gamepad:['.########.','#MMMMMMMM#','#MMWMMMYM#','#MWWWMYMY#','#MMWMMMYM#','#MMMMMMMM#','.#MMMMMM#.','..######..'],
  chat:['.########.','#cccccccc#','#cKKcKKcc#','#cccccccc#','.########.','..###.....','...##.....','....#.....'],
  news:['##########','#CCCCCCCC#','#WWWWWWWW#','#W#####WW#','#WWWWWWWW#','#W#####WW#','#WWWWWWWW#','##########'],
  shield:['..######..','.#cccccc#.','#cccWWccc#','#ccWcccCc#','#cccccccC#','.#cccccC#.','..#cccC#..','...####...'],
  phone:['######','#cccc#','#cccc#','#cccc#','#cccc#','#cccc#','#cccc#','##GG##','######']
};
function art(name,scale){
  var rows=ART[name],w=rows[0].length,h=rows.length,r='';
  rows.forEach(function(row,y){
    for(var x=0;x<row.length;x++){var c=PAL[row[x]];if(c) r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+c+'"/>';}
  });
  return '<svg viewBox="0 0 '+w+' '+h+'" width="'+(w*scale)+'" height="'+(h*scale)+'" shape-rendering="crispEdges" aria-hidden="true" focusable="false">'+r+'</svg>';
}
$$('[data-art]').forEach(function(el){el.innerHTML=art(el.getAttribute('data-art'),+el.getAttribute('data-scale')||4);});

/* ================= ЗУРАГ: local -> Roblox CDN ================= */
$$('img[data-cdn]').forEach(function(img){
  function swap(){
    if(!img.__cdn){img.__cdn=1;img.src=img.getAttribute('data-cdn');}
    else img.hidden=true;
  }
  img.addEventListener('error',swap);
  if(img.complete&&img.naturalWidth===0&&img.getAttribute('src')) swap();
});

/* ================= ЗААВАР: MOBILE | PC tabs ================= */
var tabs=$$('#devtabs [role="tab"]');
function selectTab(tb,focus){
  tabs.forEach(function(x){
    var on=x===tb;
    x.setAttribute('aria-selected',on);
    x.tabIndex=on?0:-1;
    $(x.getAttribute('aria-controls')).hidden=!on;
  });
  if(focus) tb.focus();
}
if(tabs.length){
  tabs.forEach(function(tb,i){
    tb.addEventListener('click',function(){selectTab(tb);});
    tb.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') n=(i+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp') n=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home') n=0;
      if(e.key==='End') n=tabs.length-1;
      if(n!==null){e.preventDefault();selectTab(tabs[n],true);}
    });
  });
  selectTab(device==='mobile'?tabs[0]:tabs[1]);
}
function setDevNote(){
  var n=$('devnote');
  if(n) n.textContent=t('Таны төхөөрөмж автоматаар танигдлаа: ','Your device was detected automatically: ')+(device==='mobile'?'MOBILE':'PC')+t('. Хүсвэл доорх табаар солиорой.','. You can switch with the tabs below.');
}

/* ================= ЦОНХ ХУМИХ ================= */
$$('.win').forEach(function(win){
  var btn=win.querySelector('.min'),body=win.querySelector('.wbody');
  if(!btn||!body) return;
  btn.addEventListener('click',function(){
    body.hidden=!body.hidden;
    btn.setAttribute('aria-expanded',String(!body.hidden));
    btn.setAttribute('aria-label',body.hidden?t('Цонхыг дэлгэх','Expand window'):t('Цонхыг хумих','Collapse window'));
    btn.__lbl=1;
  });
});

/* ================= START ЦЭС ================= */
var start=$('start'),sbtn=$('startbtn');
function closeStart(){if(!start)return;start.hidden=true;sbtn.setAttribute('aria-expanded','false');sbtn.classList.remove('on');}
if(start&&sbtn){
  sbtn.addEventListener('click',function(e){
    e.stopPropagation();
    var open=start.hidden;
    start.hidden=!open;
    sbtn.setAttribute('aria-expanded',String(open));
    sbtn.classList.toggle('on',open);
  });
  document.addEventListener('click',function(e){if(!start.contains(e.target)) closeStart();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!start.hidden){closeStart();sbtn.focus();}});
  start.addEventListener('click',function(e){if(e.target.closest('a')) closeStart();});
}

/* ================= ЦАГ ================= */
var clock=$('clock');
function tick(){if(clock) clock.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
tick();setInterval(tick,30000);

/* ================= ДУУ (SFX) ================= */
var SND=false,AC=null;
try{SND=localStorage.getItem('eg-sfx')==='1';}catch(e){}
function beep(freq,dur){
  if(!SND) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    var o=AC.createOscillator(),g=AC.createGain();
    o.type='square';o.frequency.value=freq;g.gain.value=0.04;
    o.connect(g);g.connect(AC.destination);
    o.start();o.stop(AC.currentTime+dur);
  }catch(e){}
}
document.addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('.btn,.tab,.icon,.start a,.min,summary')) beep(660,0.05);
},true);
var sfx=$('sfxbtn');
function updateSfx(){if(sfx) sfx.setAttribute('aria-pressed',String(SND));}
if(sfx) sfx.addEventListener('click',function(){
  SND=!SND;
  try{localStorage.setItem('eg-sfx',SND?'1':'0');}catch(e){}
  updateSfx();
  beep(880,0.08);
});

/* ================= ХЭЛ СОЛИХ ТОВЧ ================= */
var lb=$('langbtn');
function updateLangBtn(){
  if(!lb) return;
  lb.textContent=LANG==='en'?'МН':'EN';
  lb.setAttribute('aria-label',LANG==='en'?'Монгол хэл рүү солих':'Switch to English');
}
if(lb) lb.addEventListener('click',function(){
  LANG=LANG==='en'?'mn':'en';
  try{localStorage.setItem('eg-lang',LANG);}catch(e){}
  translateDom();
  renderDynamic();
});

/* ================= GROUP ID ХУУЛАХ / ХУВААЛЦАХ ================= */
var note=$('copynote');
var cp=$('copyid');
if(cp&&note) cp.addEventListener('click',function(){
  var ok=function(){note.textContent=t('Group ID 35654822 хууллаа.','Copied group ID 35654822.');};
  var fail=function(){note.textContent=t('Хуулж чадсангүй. Group ID: 35654822','Could not copy. Group ID: 35654822');};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText('35654822').then(ok,fail); else fail();
});
var share=$('sharebtn'),snote=$('sharenote');
if(share) share.addEventListener('click',function(){
  var data={title:document.title,url:location.href};
  if(navigator.share){navigator.share(data).catch(function(){});return;}
  var ok=function(){if(snote) snote.textContent=t('Холбоос хууллаа.','Link copied.');};
  var fail=function(){if(snote) snote.textContent=location.href;};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(ok,fail); else fail();
});

/* ================= ЗОЧЛОЛТЫН ТОО (энэ хөтөч дээр) ================= */
var odo=$('odo');
if(odo){
  var n=1;
  try{n=(parseInt(localStorage.getItem('eg-visits'),10)||0)+1;localStorage.setItem('eg-visits',n);}catch(e){}
  odo.__n=n;
  odo.innerHTML=String(n).padStart(5,'0').split('').map(function(d){return '<b>'+d+'</b>';}).join('');
}
function setOdoLabel(){if(odo) odo.setAttribute('aria-label',t('Та '+odo.__n+' удаа орсон','You have visited '+odo.__n+' times'));}

/* ================= LIVE ТОО (Roblox, Worker-ээр) ================= */
function apiUrl(svc,path){
  var base=LIVE.proxy?LIVE.proxy.replace(/\/$/,'')+'/'+svc:'https://'+svc+'.roproxy.com';
  return base+path;
}
function getJSON(url){
  var ctl=('AbortController' in window)?new AbortController():null;
  var to=setTimeout(function(){if(ctl)ctl.abort();},8000);
  return fetch(url,{signal:ctl?ctl.signal:undefined}).then(function(r){
    clearTimeout(to);
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  });
}
var LIVE_DATA=null;
function loadLive(){
  return getJSON(apiUrl('games','/v2/groups/'+LIVE.groupId+'/games?accessFilter=Public&limit=100&sortOrder=Asc')).then(function(g){
    var list=(g&&g.data)||[];
    if(!list.length) throw new Error('no games');
    var ids=list.map(function(x){return x.id;}).join(',');
    return Promise.all([
      getJSON(apiUrl('games','/v1/games?universeIds='+ids)),
      getJSON(apiUrl('groups','/v1/groups/'+LIVE.groupId)).catch(function(){return null;})
    ]);
  }).then(function(res){
    var games=(res[0]&&res[0].data)||[],total=0,visits=0,info={},updates=[];
    games.forEach(function(x){
      var p=Number(x.playing)||0,v=Number(x.visits)||0;
      total+=p;visits+=v;
      var u=x.updated&&!isNaN(new Date(x.updated))?new Date(x.updated):null;
      info[String(x.rootPlaceId)]={playing:p,visits:v,fav:Number(x.favoritedCount)||0,updated:u};
      if(u) updates.push({name:x.name,place:x.rootPlaceId,updated:u});
    });
    updates.sort(function(a,b){return b.updated-a.updated;});
    return {total:total,totalVisits:visits,info:info,updates:updates,members:res[1]&&res[1].memberCount};
  });
}
function agoText(d){
  var days=Math.max(0,Math.floor((Date.now()-d)/864e5));
  return days===0?t('өнөөдөр','today'):t(days+' өдрийн өмнө',days+' days ago');
}
function renderLive(d){
  if(!d) return;
  $$('[data-live-place]').forEach(function(el){
    var g=d.info[el.getAttribute('data-live-place')];
    if(!g) return;
    el.querySelector('.n').textContent=fmt(g.playing);
    el.hidden=false;
  });
  $$('[data-visits-place]').forEach(function(el){
    var g=d.info[el.getAttribute('data-visits-place')];
    if(!g) return;
    el.querySelector('.n').textContent=compact(g.visits);
    el.hidden=false;
  });
  var pg=document.querySelector('[data-page-place]');
  if(pg){
    var gi=d.info[pg.getAttribute('data-page-place')];
    if(gi){
      var set=function(k,v){$$('[data-g="'+k+'"]').forEach(function(el){el.textContent=v;});};
      set('playing',fmt(gi.playing));set('visits',fmt(gi.visits));set('fav',fmt(gi.fav));
      if(gi.updated) set('updated',gi.updated.toLocaleDateString('en-CA')+' ('+agoText(gi.updated)+')');
    }
  }
  var up=$('uplist');
  if(up){
    up.textContent='';
    d.updates.forEach(function(u){
      var li=document.createElement('li'),a=document.createElement('a'),w=document.createElement('span');
      a.href='https://www.roblox.com/games/'+encodeURIComponent(u.place);a.target='_blank';a.rel='noopener';
      a.textContent=u.name;
      w.textContent=u.updated.toLocaleDateString('en-CA')+' ('+agoText(u.updated)+')';
      li.appendChild(a);li.appendChild(w);up.appendChild(li);
    });
  }
  $$('[data-live-total]').forEach(function(el){el.textContent=fmt(d.total);});
  $$('[data-total-visits]').forEach(function(el){el.textContent=compact(d.totalVisits);});
  $$('[data-live-wrap]').forEach(function(el){el.hidden=false;});
  if(d.members) $$('[data-live-members]').forEach(function(el){el.textContent=fmt(d.members);});
}
var lastLive=0;
function refreshLive(){
  lastLive=Date.now();
  loadLive().then(function(d){LIVE_DATA=d;renderLive(d);}).catch(function(e){
    if(window.console) console.info('Live тоо авч чадсангүй:',e&&e.message);
  });
}
refreshLive();
setInterval(function(){if(document.visibilityState==='visible') refreshLive();},LIVE.every);
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&Date.now()-lastLive>LIVE.every) refreshLive();
});

/* ================= DISCORD ГИШҮҮДИЙН ТОО (боломжтой бол) ================= */
if($$('[data-discord-members]').length){
  fetch('https://discord.com/api/v9/invites/'+DISCORD_CODE+'?with_counts=true').then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }).then(function(d){
    var m=Number(d.approximate_member_count);
    if(!m) return;
    $$('[data-discord-members]').forEach(function(el){el.textContent=fmt(m);});
  }).catch(function(){});
}

/* ================= news.json: МЭДЭЭ, COUNTDOWN, МЕДИА ================= */
var DEFAULT_SITE={
  countdown:{},
  links:{form:''},
  news:[{date:'',tag:'Удахгүй',tag_en:'Coming soon',game:'Mongolia Troll Tower',
    title:'Шинэ том шинэчлэл замдаа явна',title_en:'A big new update is on the way',
    text:'Маш том нууц шинэчлэлт тун удахгүй ирнэ. Бэлэн байгаарай... тоолол эхэллээ.',
    text_en:'A huge secret update is coming very soon. Get ready... the countdown has begun.',
    link:'https://www.roblox.com/events/4327327796935393861',linkText:'Эвентийг харах',linkText_en:'See the event'}],
  media:[]
};
var SITE=null,cdTimer=null;
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function renderNews(){
  var ul=$('newslist');
  if(!ul||!SITE) return;
  ul.textContent='';
  (SITE.news||[]).forEach(function(nw){
    var li=el('li','news'),top=el('div');
    if(nw.tag) top.appendChild(el('span','tag',pick(nw,'tag')));
    var meta=[nw.game,nw.date].filter(Boolean).join(', ');
    if(meta) top.appendChild(el('span','meta',(nw.tag?' ':'')+meta));
    li.appendChild(top);
    li.appendChild(el('h3','',pick(nw,'title')));
    li.appendChild(el('p','',pick(nw,'text')));
    if(nw.link){
      var a=el('a','btn',pick(nw,'linkText')||t('Дэлгэрэнгүй','Read more'));
      a.href=nw.link;a.target='_blank';a.rel='noopener';li.appendChild(a);
    }
    ul.appendChild(li);
  });
}
function renderCountdown(){
  var box=$('countdown');
  if(!box) return;
  clearInterval(cdTimer);
  var c=SITE&&SITE.countdown,target=c&&c.target?Date.parse(c.target):NaN;
  if(!isFinite(target)||target<=Date.now()){box.hidden=true;return;}
  box.hidden=false;
  $('cdlabel').textContent=pick(c,'label')||t('Шинэчлэл хүртэл','Until the update');
  var link=$('cdlink');
  if(c.link){link.href=c.link;link.textContent=pick(c,'linkText')||t('Дэлгэрэнгүй','Read more');link.hidden=false;}else link.hidden=true;
  function two(x){return (x<10?'0':'')+x;}
  function step(){
    var ms=target-Date.now();
    if(ms<=0){box.hidden=true;clearInterval(cdTimer);return;}
    var s=Math.floor(ms/1000);
    $('cd-d').textContent=two(Math.floor(s/86400));
    $('cd-h').textContent=two(Math.floor(s%86400/3600));
    $('cd-m').textContent=two(Math.floor(s%3600/60));
    $('cd-s').textContent=two(s%60);
  }
  step();cdTimer=setInterval(step,1000);
}
function renderMedia(){
  var sec=$('media'),ul=$('medialist');
  if(!sec||!ul||!SITE) return;
  var items=SITE.media||[];
  sec.hidden=!items.length;
  ul.textContent='';
  var kinds={tiktok:'TikTok',youtube:'YouTube',image:t('Зураг','Image')};
  items.forEach(function(m){
    var li=el('li','mcard'),th=el('div','mt');
    if(m.thumb){var im=el('img');im.src=m.thumb;im.alt=pick(m,'title')||'';im.loading='lazy';im.referrerPolicy='no-referrer';im.addEventListener('error',function(){im.hidden=true;});th.appendChild(im);}
    li.appendChild(th);
    var b=el('div','cbody');
    b.appendChild(el('span','tag cy',kinds[m.kind]||'Media'));
    b.appendChild(el('h3','',pick(m,'title')||''));
    var a=el('a','btn',t('Үзэх','Watch'));a.href=m.url;a.target='_blank';a.rel='noopener';
    b.appendChild(a);li.appendChild(b);ul.appendChild(li);
  });
}
function renderForm(){
  var f=$('formlink');
  if(!f||!SITE) return;
  var u=SITE.links&&SITE.links.form;
  if(u){f.href=u;f.hidden=false;}else f.hidden=true;
}
function renderSite(){renderNews();renderCountdown();renderMedia();renderForm();}
if($('newslist')||$('countdown')){
  fetch(ROOT+'news.json',{cache:'no-cache'}).then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }).catch(function(){return DEFAULT_SITE;}).then(function(d){
    SITE=d;renderSite();translateDom();
  });
}

/* ================= ДИНАМИК ТЕКСТИЙГ ХЭЛЭЭР ДАХИН ЗУРАХ ================= */
function renderDynamic(){
  setDevNote();updateLangBtn();updateSfx();setOdoLabel();
  renderSite();
  if(LIVE_DATA) renderLive(LIVE_DATA);
  if(note) note.textContent='';
  if(snote) snote.textContent='';
  $$('.win .min').forEach(function(b){
    var body=b.closest('.win').querySelector('.wbody');
    b.setAttribute('aria-label',body&&body.hidden?t('Цонхыг дэлгэх','Expand window'):t('Цонхыг хумих','Collapse window'));
  });
}

/* ================= ANALYTICS (сонголттой) ================= */
if(ANALYTICS.goatcounter){
  var g1=document.createElement('script');
  g1.async=true;g1.src='https://gc.zgo.at/count.js';
  g1.setAttribute('data-goatcounter','https://'+ANALYTICS.goatcounter+'.goatcounter.com/count');
  document.head.appendChild(g1);
}
if(ANALYTICS.cloudflare){
  var c1=document.createElement('script');
  c1.defer=true;c1.src='https://static.cloudflareinsights.com/beacon.min.js';
  c1.setAttribute('data-cf-beacon',JSON.stringify({token:ANALYTICS.cloudflare}));
  document.head.appendChild(c1);
}

/* ================= ЭХЛЭХ ================= */
translateDom();
renderDynamic();

/* ================= BOOT ДЭЛГЭЦ (зөвхөн нүүр хуудас) ================= */
var boot=$('boot'),logo=$('logo');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var seen=false;
try{seen=sessionStorage.getItem('eg-boot')==='1';}catch(e){}
if(boot&&!reduce&&!seen){
  var log=$('bootlog'),skip=$('bootskip');
  var lines=[
    'ELITE BIOS v2.6   (C) ELITE GAME$','',
    t('Санах ой шалгаж байна: 245205K ..... OK','Memory test: 245205K ..... OK'),
    t('Эзэн олж байна ........ eliteBX [CEO]','Detecting owner ........ eliteBX [CEO]'),
    t('Тоглоомууд ачаалж байна ..... OK','Loading games ..... OK'),
    t('Төхөөрөмж: ','Device: ')+(device==='mobile'?'MOBILE':'PC')+' ..... OK','',
    t('ELITE GAME$ эхэлж байна...','Starting ELITE GAME$...')
  ];
  var i=0,timer=null,done=false;
  document.documentElement.classList.add('booting');
  boot.hidden=false;skip.focus();
  var finish=function(){
    if(done) return;done=true;clearInterval(timer);
    try{sessionStorage.setItem('eg-boot','1');}catch(e){}
    boot.hidden=true;
    document.documentElement.classList.remove('booting');
    if(logo) logo.classList.add('on');
  };
  timer=setInterval(function(){
    if(i<lines.length) log.textContent+=lines[i++]+'\n';
    else{clearInterval(timer);setTimeout(finish,600);}
  },330);
  skip.addEventListener('click',finish);
  boot.addEventListener('click',finish);
}
})();
