
(function(){
'use strict';
const D=window.DATA, S=D.S, AUDIO=window.AUDIO||{};
const QS=new URLSearchParams(location.search);const DEBUG=QS.get('debug');
// ?debug=... uses its own save slot, so QA never touches the real progress
const KEY=DEBUG?'yahav-reading-debug':'yahav-reading-v1';
const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[rnd(a.length)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STICKERS=['💖','🌟','🎀','🦄','🍭','🎧','🎤','🌈','🐰','🍓','🎵','🦋','👑','💎','🍦','🐱','🎹','🌸','✨','🪩'];
const STARS_PER_STICKER=12;
const NSONG=2;
const LEVELS=[
 {id:1,name:S.lv1,size:5,songs:[{types:['first','syl2pic'],n:3},{types:['first','syl2pic','same'],n:4}]},
 {id:2,name:S.lv2,size:5,pool:'L2',songs:[{types:['w2p','p2w'],n:3},{types:['w2p','p2w','listen'],n:4,hard:true}]},
 {id:3,name:S.lv3,size:5,pool:'L3',songs:[{types:['w2p','p2w'],n:3},{types:['w2p','p2w','listen'],n:4,hard:true}]},
 {id:4,name:S.lv4,size:5,songs:[{types:['s2p','tf'],n:3},{types:['s2p','tf'],n:4,hard:true}]},
 {id:5,name:S.lv5,size:4,songs:[{types:['story'],group:0},{types:['story'],group:1}]}
];
// Official KPop Demon Hunters videos (YouTube embeds only; official Sony Pictures Animation channel, verified embeddable 2026-10-27)
// he: the film's Hebrew dub (Netflix Hebrew version) as uploaded by the YouTube channel "TN Network" (not an official channel; no official Hebrew upload exists). Verified embeddable 2026-10-27.
const MV=[
 {id:'yebNIHKAC4A',he:'xCWqjYp-iCw',t:'Golden',a:'HUNTR/X'},
 {id:'QGsevnbItdU',he:'JzRknPy2p_U',t:"How It's Done",a:'HUNTR/X'},
 {id:'983bBbJx0Mk',he:'VZucedb45Lg',t:'Soda Pop',a:'Saja Boys'},
 {id:'l8Dr7vzMSVE',he:'GnvgDPZqgbM',t:'Takedown',a:'TWICE'},
 {id:'cWppAbqm9I8',he:'mkgBYDF8KyU',t:'Your Idol',a:'Saja Boys'},
 {id:'fjOeJssZX_Q',he:'UboscjcOZeU',t:'Free',a:'Rumi & Jinu'},
 {id:'TbMEMCvFbZk',he:'mgzVuMCUBNg',t:'What It Sounds Like',a:'HUNTR/X'}
];
// which level unlocks each song (index 0: first passed round; last two: finishing the game)
const MVLV=[1,1,2,3,4,5,5];
const MVCH='Sony Pictures Animation';
// v3 UI strings (vowelized; checked against Dicta Nakdan, see notes)
const T={
 songs:'הַשִּׁירִים מֵהַסֶּרֶט',
 songs_sub:'כָּל שָׁלָב שֶׁעוֹבְרִים פּוֹתֵחַ שִׁיר חָדָשׁ!',
 real_song:'הַשִּׁיר הָאֲמִתִּי',
 new_song:'שִׁיר אֲמִתִּי מֵהַסֶּרֶט נִפְתַּח!',
 next_concert:'🔓 בַּהוֹפָעָה הַבָּאָה 🎤',
 after_first:'🔓 אַחֲרֵי הַסִּבּוּב הָרִאשׁוֹן 🎤',
 soon:'עוֹד מְעַט…',
 official:'הַסִּרְטוֹן הָרִשְׁמִי',
 open_yt:'לֹא נִפְתַּח? צְפוּ בְּיוּטְיוּבּ',
 jump:'קַל לָךְ? קִפְצִי קָדִימָה',
 where:'לְאָן קוֹפְצִים?',
 jump_sub:'אֶפְשָׁר לִקְפֹּץ יָשָׁר לְשָׁלָב קָשֶׁה יוֹתֵר.',
 jump_to:'לִקְפֹּץ לְשָׁלָב',
 kept:'הַכּוֹכָבִים וְהָאוֹסֶף נִשְׁמָרִים.',
 yes_jump:'כֵּן, קוֹפְצִים!',
 not_now:'לֹא עַכְשָׁו',
 skip_msg:'קוֹפְצִים יָשָׁר לַשָּׁלָב הַבָּא!',
 songs_tab:'שִׁירִים',
 he:'בְּעִבְרִית',
 orig:'הַמְּקוֹרִי',
 he_ver:'הַגִּרְסָה בְּעִבְרִית',
 orig_ver:'הַגִּרְסָה הַמְּקוֹרִית בְּאַנְגְּלִית',
 unlock_end:'בְּסוֹף שָׁלָב',
 new_game:'מִשְׂחָק חָדָשׁ',
 new_game_sub:'מַתְחִילִים מֵהַהַתְחָלָה עִם מִלִּים חֲדָשׁוֹת!',
 new_game_q:'לְהַתְחִיל מִשְׂחָק חָדָשׁ?',
 yes_new:'כֵּן, מַתְחִילִים!',
 pick_any:'עַכְשָׁו אֶפְשָׁר לִבְחֹר כָּל שָׁלָב',
 champ:'אַתְּ אַלּוּפַת הַקְּרִיאָה!',
 game_n:'מִשְׂחָק',
 all_songs:'כָּל הַשִּׁירִים נִפְתְּחוּ!',
 tap_level:'לַחֲצִי עַל שָׁלָב',
 free:'כָּל הַשְּׁלַבִּים פְּתוּחִים'
};

// ---------- state ----------
function fresh(){return {v:1,game:1,finished:false,seen:[],prev:[],music:true,stars:0,level:1,song:1,cleared:{},cards:[],stickers:[],history:[],stats:{},struggle:{},answered:0,firstTry:0,sound:true,intro:false,created:Date.now()}}
let st;
try{st=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){st=fresh()}
(function migrate(){
 // v3: 2 rounds per level. An old save sitting on round 3 already cleared rounds 1-2, so it moves up.
 if(st.song>NSONG){const lv=st.level;if(st.cleared[lv+'-1']&&st.cleared[lv+'-2']){if(lv<5){st.level=lv+1;st.song=1}else{st.done=true;st.song=NSONG}}else st.song=NSONG}
 if(st.level===5&&[1,2,3].filter(s=>st.cleared['5-'+s]).length>=2)st.done=true;
 if(!Array.isArray(st.mv)){const anyPass=st.history.some(h=>h.n&&h.ok/h.n>=0.8)||Object.keys(st.cleared).length>0;const n=(anyPass?1:0)+(st.level-1)+(st.done?1:0);st.mv=Array.from({length:Math.min(MV.length,n)},(_,i)=>i)}
 // v4: finishing the game opens free level select + new game; finishing unlocks every song (v3 left the 7th locked)
 if(!st.game)st.game=1;if(!Array.isArray(st.seen))st.seen=[];if(!Array.isArray(st.prev))st.prev=[];
 if(st.done)st.finished=true;
 if(st.finished)st.mv=MV.map((_,i)=>i);
 try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}
})();
// ?debug=complete: a finished game in its own save slot (for testing the ending without playing it all)
if(DEBUG==='complete'){const keepI=true;st=fresh();st.intro=keepI;st.level=5;st.song=NSONG;st.done=true;st.finished=true;
 [1,2,3,4,5].forEach(l=>{st.cleared[l+'-1']=true;st.cleared[l+'-2']=true});st.stars=130;st.cards=Array.from({length:15},(_,i)=>i);
 st.stickers=STICKERS.slice(0,10);st.mv=MV.map((_,i)=>i);
 st.seen=['first:בָּנָנָה','w2p:דָּג'].map(baseOf);try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
if(DEBUG==='fresh'){st=fresh();try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function baseOf(id){const p=String(id).split(':');return p[0]==='story'?'story:'+p[1]:p.slice(1).join(':')}
function unlockNextMV(){const i=MV.findIndex((_,k)=>!st.mv.includes(k));if(i<0)return null;st.mv.push(i);return i}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
// ---------- sound (generated, WebAudio) ----------
let ac=null;
function actx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();return ac}
function tone(f,d,type,vol,when){const c=actx();if(!c||!st.sound)return;const t=c.currentTime+(when||0);const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.18,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+0.05)}
const sfx={
 good(){[784,988,1319].forEach((f,i)=>tone(f,.22,'triangle',.16,i*.08))},
 soft(){tone(330,.18,'sine',.12);tone(262,.25,'sine',.1,.12)},
 tap(){tone(660,.06,'sine',.06)},
 sparkle(){[1568,2093,2637,3136].forEach((f,i)=>tone(f,.16,'sine',.08,i*.06))},
 fanfare(){const n=[523,659,784,1047,784,1047,1319];n.forEach((f,i)=>{tone(f,.3,'square',.07,i*.14);tone(f/2,.3,'triangle',.08,i*.14)});[1047,1319,1568].forEach(f=>tone(f,1.1,'triangle',.07,n.length*.14))}
};
// ---------- music (generated original instrumentals) ----------
const TRACKS={menu:'audio/menu.mp3',game:'audio/game.mp3',concert:'audio/concert.mp3'};
const TVOL={menu:.5,game:.38,concert:.75};
let mus={el:null,gain:null,key:null,playing:null,unlocked:false,fade:0};
function musicOn(){return st.music!==false}
function musEnsure(){
 if(mus.el)return mus.el;
 const el=new Audio();el.loop=true;el.preload='auto';mus.el=el;
 try{const c=actx();if(c&&c.createMediaElementSource){const src=c.createMediaElementSource(el);const g=c.createGain();g.gain.value=0;src.connect(g);g.connect(c.destination);mus.gain=g}}catch(e){mus.gain=null}
 return el;
}
function musSetVol(v,ms){
 if(mus.gain){const c=actx();const t=c.currentTime;try{mus.gain.gain.cancelScheduledValues(t);mus.gain.gain.setValueAtTime(mus.gain.gain.value,t);mus.gain.gain.linearRampToValueAtTime(v,t+(ms||0)/1000)}catch(e){mus.gain.gain.value=v}}
 else if(mus.el){mus.el.volume=Math.max(0,Math.min(1,v))}
}
function musStart(){
 const k=mus.key;if(!k||!musicOn()||!mus.unlocked||mus.hold)return;
 const el=musEnsure();
 if(mus.playing===k&&!el.paused)return;
 const swap=()=>{el.src=TRACKS[k];mus.playing=k;musSetVol(0,0);const p=el.play();if(p&&p.catch)p.catch(()=>{});musSetVol(TVOL[k],700)};
 clearTimeout(mus.fade);
 if(mus.playing&&!el.paused){musSetVol(0,350);mus.fade=setTimeout(swap,380)}else swap();
}
function music(k){mus.key=k;musStart()}
function musStop(){clearTimeout(mus.fade);if(mus.el){musSetVol(0,250);const el=mus.el;setTimeout(()=>{el.pause()},280)}mus.playing=null}
function musToggle(){if(mus.hold)return;if(musicOn()&&!mus.playing){mus.unlocked=true;actx();musStart();return}st.music=!musicOn();save();if(musicOn()){mus.unlocked=true;actx();musStart()}else musStop();document.querySelectorAll('#mus').forEach(b=>{b.classList.toggle('off',!musicOn());b.setAttribute('aria-pressed',musicOn())})}
function musBtn(){return `<button class="iconbtn mus ${musicOn()?'':'off'}" id="mus" aria-label="music" aria-pressed="${musicOn()}">🎵</button>`}
function bindMus(){const b=$('#mus');if(b)b.onclick=e=>{e.stopPropagation();musToggle()}}
['pointerdown','touchend','click'].forEach(ev=>document.addEventListener(ev,function(e){if(e.target&&e.target.closest&&e.target.closest('#mus'))return;mus.unlocked=true;actx();musStart()},true));
document.addEventListener('visibilitychange',()=>{if(!mus.el)return;if(document.hidden)mus.el.pause();else if(musicOn()&&mus.playing&&!mus.hold){const p=mus.el.play();if(p&&p.catch)p.catch(()=>{})}});
// ---------- audio clips (only verified files) ----------
let curAudio=null;
function hasAudio(k){return !!AUDIO[k]}
function playAudio(k){if(!AUDIO[k])return;try{if(curAudio)curAudio.pause();curAudio=new Audio(AUDIO[k]);curAudio.play().catch(()=>{})}catch(e){}}
// ---------- toast & confetti ----------
let toastT;
function toast(t,soft){const el=$('#toast');el.textContent=t;el.className='show'+(soft?' soft':'');clearTimeout(toastT);toastT=setTimeout(()=>el.className=soft?'soft':'',soft?1100:900)}
const cv=$('#confetti'),cx=cv.getContext('2d');let parts=[],raf=0;
function confetti(n){cv.width=innerWidth;cv.height=innerHeight;const cols=['#ff4fa3','#ffd84d','#4fe3ff','#b58cff','#7dffb0','#ffffff'];for(let i=0;i<(n||120);i++)parts.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,w:6+Math.random()*6,h:8+Math.random()*8,c:pick(cols),s:Math.random()<.25});if(!raf)loop()}
function loop(){cx.clearRect(0,0,cv.width,cv.height);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;if(p.s){cx.font='18px sans-serif';cx.fillText('⭐',0,0)}else cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()});parts=parts.filter(p=>p.y<cv.height+30);if(parts.length)raf=requestAnimationFrame(loop);else{raf=0;cx.clearRect(0,0,cv.width,cv.height)}}
// ---------- sound classes for syllables ----------
function consOf(s){let c=s[0];let i=1;while(i<s.length&&/[\u05BC\u05C1\u05C2]/.test(s[i])){c+=s[i];i++}return c}
function soundCls(c){const base=c.replace(/[\u05BC]/g,'');const m={'ת':'t','ט':'t','כּ':'k','ק':'k','ס':'s','שׂ':'s','ח':'x','כ':'x','א':'0','ע':'0'};if(c==='כּ')return 'k';if(c==='בּ')return 'b';return m[base]||m[c]||base}
function sylKey(it){return soundCls(consOf(it.s))+'/'+it.v}
// ---------- weighting ----------
function weight(id){const s=st.stats[id];if(!s)return 3;let w=1+Math.min(4,(s.w||0)*1.5);if(s.last&&Date.now()-s.last<5*60*1000)w*=.3;return w}
function wpick(arr,idf,taken){let c=arr.filter(x=>!taken.has(idf(x)));if(!c.length)return pick(arr);
 if(st.prev&&st.prev.length){const pv=new Set(st.prev);const c2=c.filter(x=>!pv.has(baseOf(idf(x))));if(c2.length)c=c2}let tot=0;const ws=c.map(x=>{const w=weight(idf(x));tot+=w;return w});let r=Math.random()*tot;for(let i=0;i<c.length;i++){r-=ws[i];if(r<=0)return c[i]}return c[c.length-1]}
function segs(p){if(window.Intl&&Intl.Segmenter){return Array.from(new Intl.Segmenter('en',{granularity:'grapheme'}).segment(p),x=>x.segment)}return Array.from(p)}
// ---------- item builders ----------
const B={
 first(n,taken){const it=wpick(D.FS,x=>'first:'+x.w,taken);const others=shuffle(Object.keys(it.opts).filter(v=>v!==it.v)).slice(0,n-1).map(v=>it.opts[v]);
  return {id:'first:'+it.w,kind:'first',instr:S.q_first,target:it.e,tcls:'pic',opts:shuffle([{t:it.s,ok:1},...others.map(t=>({t}))]),ocls:'syl'}},
 syl2pic(n,taken){const it=wpick(D.FS,x=>'syl2pic:'+x.w,taken);const k=sylKey(it);const ds=[];const used=new Set([k]);const usedE=new Set([it.e]);
  for(const x of shuffle(D.FS)){if(ds.length>=n-1)break;const kk=sylKey(x);if(used.has(kk)||usedE.has(x.e))continue;used.add(kk);usedE.add(x.e);ds.push(x)}
  return {id:'syl2pic:'+it.w,kind:'syl2pic',instr:S.q_syl2pic,target:it.s,tcls:'syl',opts:shuffle([{t:it.e,ok:1},...ds.map(x=>({t:x.e}))]),ocls:'emoji'}},
 same(n,taken){const it=wpick(D.SAME,x=>'same:'+x.t,taken);const flip=Math.random()<.5;const tgt=flip?it.a:it.t,ans=flip?it.t:it.a;const others=shuffle(Object.values(it.others)).slice(0,n-1);
  return {id:'same:'+it.t,kind:'same',instr:S.q_same,target:tgt,tcls:'syl',opts:shuffle([{t:ans,ok:1},...others.map(t=>({t}))]),ocls:'syl'}},
 w2p(n,taken,pool){const it=wpick(pool,x=>'w2p:'+x.w,taken);const ds=shuffle(pool.filter(x=>x.e!==it.e&&x.w!==it.w)).slice(0,n-1);
  return {id:'w2p:'+it.w,kind:'w2p',instr:S.q_w2p,target:it.w,tcls:'word',audio:it.w,opts:shuffle([{t:it.e,ok:1},...ds.map(x=>({t:x.e}))]),ocls:'emoji'}},
 p2w(n,taken,pool,hard){const it=wpick(pool,x=>'p2w:'+x.w,taken);let cand=pool.filter(x=>x.e!==it.e&&x.w!==it.w);
  if(hard){const strip=s=>s.replace(/[\u0591-\u05C7]/g,'');const a=strip(it.w);const sim=cand.filter(x=>{const b=strip(x.w);return b[0]===a[0]||b[b.length-1]===a[a.length-1]||Math.abs(b.length-a.length)<=0&&b[1]===a[1]});cand=shuffle(sim).concat(shuffle(cand.filter(x=>!sim.includes(x))))}else cand=shuffle(cand);
  const ds=cand.slice(0,n-1);const long=pool===D.L3;
  return {id:'p2w:'+it.w,kind:'p2w',instr:S.q_p2w,target:it.e,tcls:'pic',audio:null,opts:shuffle([{t:it.w,ok:1,a:it.w},...ds.map(x=>({t:x.w}))]),ocls:long?'long':''}},
 listen(n,taken,pool,hard){const withA=pool.filter(x=>hasAudio(x.w));if(withA.length<n)return null;const it=wpick(withA,x=>'listen:'+x.w,taken);const ds=shuffle(pool.filter(x=>x.w!==it.w)).slice(0,n-1);
  return {id:'listen:'+it.w,kind:'listen',instr:S.q_listen,target:null,tcls:'',audio:it.w,listen:1,opts:shuffle([{t:it.w,ok:1},...ds.map(x=>({t:x.w}))]),ocls:pool===D.L3?'long':''}},
 s2p(n,taken,pool,hard){const it=wpick(D.SP,x=>'s2p:'+x.s,taken);const tg=segs(it.p);let cand=D.SP.filter(x=>x.p!==it.p);
  const share=cand.filter(x=>segs(x.p).some(g=>tg.includes(g)));const rest=cand.filter(x=>!share.includes(x));
  cand=hard?shuffle(share).concat(shuffle(rest)):shuffle(share).slice(0,1).concat(shuffle(rest));
  const ds=[];const seen=new Set([it.p]);for(const x of cand){if(ds.length>=n-1)break;if(seen.has(x.p))continue;seen.add(x.p);ds.push(x)}
  return {id:'s2p:'+it.s,kind:'s2p',instr:S.q_s2p,target:it.s,tcls:'sent',audio:it.s,opts:shuffle([{t:it.p,ok:1},...ds.map(x=>({t:x.p}))]),ocls:'emoji'}},
 tf(n,taken){const it=wpick(D.TF,x=>'tf:'+x.s,taken);
  return {id:'tf:'+it.s,kind:'tf',instr:S.q_tf,target:it.s,tcls:'sent',audio:it.s,opts:[{t:'✅ '+S.true,ok:it.t?1:0},{t:'❌ '+S.false,ok:it.t?0:1}],ocls:'tf',cols:2}},
 story(n,taken,pool,hard,group){const per=Math.ceil(D.ST.length/2);let idxs=D.ST.map((_,i)=>i).filter(i=>Math.floor(i/per)===group);if(group==null)idxs=D.ST.map((_,i)=>i);
  const choices=[];idxs.forEach(i=>D.ST[i].qs.forEach((q,qi)=>choices.push({i,qi})));const c=wpick(choices,x=>'story:'+x.i+':'+x.qi,taken);const s=D.ST[c.i],q=s.qs[c.qi];
  return {id:'story:'+c.i+':'+c.qi,story:c.i,kind:'story',instr:S.q_story,target:s.text,tcls:'story',pic:s.pic,question:q[0],audio:s.text,opts:shuffle([{t:q[1],ok:1},{t:q[2]},{t:q[3]}]),ocls:'long',cols:1}}
};
function poolFor(lv){return lv===2?D.L2:lv===3?D.L3:null}
function buildRound(lv,song){
 song=Math.min(song,NSONG);const L=LEVELS[lv-1],cfg=L.songs[song-1],key=lv+'-'+song,struggle=!!st.struggle[key];
 const items=[],taken=new Set(),usedStory=new Set();
 let size=L.size;let reviewN=0;
 if(lv>1)reviewN=struggle?2:1;
 if(lv===5&&!struggle)reviewN=0;
 const mk=(lvl,cfg2,i)=>{const types=cfg2.types.filter(t=>t!=='listen'||poolFor(lvl)&&poolFor(lvl).filter(x=>hasAudio(x.w)).length>=6);
  const t=types[i%types.length];let n=cfg2.n||3;if(struggle&&t!=='tf'&&t!=='story')n=Math.max(2,n-1);
  for(let tries=0;tries<12;tries++){const it=B[t](n,taken,poolFor(lvl),cfg2.hard,cfg2.group);if(!it)continue;if(taken.has(it.id))continue;if(it.story!=null&&usedStory.has(it.story))continue;taken.add(it.id);if(it.story!=null)usedStory.add(it.story);return it}return null};
 for(let i=0;i<size-reviewN;i++){const it=mk(lv,cfg,i);if(it)items.push(it)}
 if(reviewN){const pl=LEVELS[lv-2];const pcfg=pl.songs[1];for(let i=0;i<reviewN;i++){const it=mk(lv-1,{types:pcfg.types,n:3,group:pcfg.group},i);if(it){it.review=1;items.splice(1+rnd(items.length),0,it)}}}
 const sn=new Set(st.seen);items.forEach(it=>sn.add(baseOf(it.id)));st.seen=Array.from(sn);save();
 return {lv,song,key,items,idx:0,res:[],tries:0,start:Date.now(),struggle};
}
// ---------- screens ----------
let round=null;
function topbar(extra){
 return `<div class="topbar"><button class="iconbtn" id="gear" aria-label="parents">⚙️<span class="ring"></span></button>
 <span class="pill">⭐ <b id="starc">${st.stars}</b></span>${musBtn()}${extra||`<button class="iconbtn" id="coll" aria-label="collection">🎴</button>`}</div>`;
}
function levelDone(lv){return st.level>lv||(lv===5&&!!st.done)||[1,2].every(s=>st.cleared[lv+'-'+s])}
function home(){
 round=null;
 const spots=LEVELS.map(L=>`<span class="spot ${levelDone(L.id)?'on':''}"></span>`).join('');
 const allDone=!!st.done||!!st.finished;
 app.innerHTML=`${topbar()}
 <div class="hello">${S.hello} ⭐</div>
 <div class="title">${S.app_title}</div>
 <div class="stage hero-stage"><div class="spots">${spots}</div>${IDOLS.heroHTML()}</div>
 ${st.done?`<div class="freebanner">🏆 ${T.free}<small>${T.tap_level} 👇</small></div>`:`<button class="bigbtn" id="play">🎤 ${S.play}<small>${st.game>1?T.game_n+' '+st.game+' · ':''}${S.level} ${st.level} · ${S.song} ${st.song} ${S.of} ${NSONG}</small></button>`}
 <button class="bigbtn mvbtn" id="songs">🎵 ${T.songs} <span class="cnt">${st.mv.length}/${MV.length}</span></button>
 <div class="levels">${LEVELS.map(L=>{const open=L.id<=st.level||allDone;return `<button class="lvl ${L.id===st.level&&!allDone?'cur':''} ${open?'':'ahead'}" data-lv="${L.id}">
  <div class="n">${open?L.id:'🚀'}</div><div class="nm">${L.name}</div><div class="dots">${[1,2].map(s=>`<i class="${st.cleared[L.id+'-'+s]||st.level>L.id||(L.id===5&&allDone)?'on':''}"></i>`).join('')}</div></button>`}).join('')}</div>
 ${!allDone&&st.level<5?`<button class="jumpbtn" id="jump">⏩ ${T.jump}</button>`:''}
 ${allDone?`<button class="bigbtn newgame" id="newg">🔄 ${T.new_game}<small>${T.new_game_sub}</small></button>`:''}
 <div class="hold-hint">${S.parent_hint}</div>`;
 const pb=$('#play');if(pb)pb.onclick=()=>{sfx.tap();startRound(st.level,st.song)};
 $('#songs').onclick=()=>{sfx.tap();songsPage()};
 const ng=$('#newg');if(ng)ng.onclick=()=>{sfx.tap();newGameAsk()};
 const jb=$('#jump');if(jb)jb.onclick=()=>{sfx.tap();jumpPicker()};
 app.querySelectorAll('.lvl[data-lv]').forEach(b=>b.onclick=()=>{sfx.tap();const lv=+b.dataset.lv;if(lv===st.level&&!allDone){startRound(st.level,st.song);return}
  if(lv>st.level&&!allDone){jumpPicker(lv);return}
  freePlay(lv)});
 bindCommon();
 music('menu');
 if(!st.intro)intro();
}
// v4: after finishing everything, any level can be played; picking one moves her there
function freePlay(lv){const s=[1,2].find(s=>!st.cleared[lv+'-'+s])||1;
 if(st.finished&&!st.done&&lv>st.level){st.level=lv;st.song=s;save()}
 startRound(lv,s)}
function newGame(){
 const all=new Set([...(st.prev||[]),...(st.seen||[])]);
 st.prev=Array.from(all);st.seen=[];st.game=(st.game||1)+1;
 st.level=1;st.song=1;st.done=false;st.finished=true;st.cleared={};st.struggle={};
 save();sfx.sparkle();confetti(120);startRound(1,1)}
function newGameAsk(){
 const ov=document.createElement('div');ov.className='sheet';const close=()=>ov.remove();
 ov.innerHTML=`<div class="sheetbox"><div class="msg sm">🔄 ${T.new_game_q}</div><div class="sub" style="font-size:20px;font-weight:800">${T.new_game_sub}</div><div class="sub">${T.kept}</div>
  <button class="jumpto" id="ngy">${T.yes_new} 🎤</button><button class="linkbtn" id="ngn">${T.not_now}</button></div>`;
 document.body.appendChild(ov);
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ov.querySelector('#ngn').onclick=close;
 ov.querySelector('#ngy').onclick=()=>{close();newGame()};
}
function finale(){
 round=null;
 app.innerHTML=`${topbar()}<div class="panel finale">
  <div class="msg">🏆 ${S.all_done}</div>
  <div class="sub" style="font-size:24px;font-weight:800">${T.champ} 👑</div>
  <div class="stage hero-stage fin">${IDOLS.heroHTML()}</div>
  <div class="sub" style="font-weight:800">🎵 ${T.all_songs}</div>
 </div>
 <div class="h2 sm">${T.pick_any} 👇</div>
 <div class="levels">${LEVELS.map(L=>`<button class="lvl free" data-lv="${L.id}"><div class="n">${L.id}</div><div class="nm">${L.name}</div><div class="dots"><i class="on"></i><i class="on"></i></div></button>`).join('')}</div>
 <button class="bigbtn newgame" id="newg">🔄 ${T.new_game}<small>${T.new_game_sub}</small></button>
 <button class="bigbtn mvbtn" id="songs">🎵 ${T.songs_tab} <span class="cnt">${st.mv.length}/${MV.length}</span></button>
 <button class="bigbtn alt" id="hm">🏠 ${S.home}</button>`;
 bindCommon();music('menu');
 app.querySelectorAll('.lvl[data-lv]').forEach(b=>b.onclick=()=>{sfx.tap();freePlay(+b.dataset.lv)});
 $('#newg').onclick=()=>{sfx.tap();newGameAsk()};
 $('#songs').onclick=()=>{sfx.tap();collection('songs')};
 $('#hm').onclick=()=>{sfx.tap();home()};
}
function jumpPicker(only){
 const ov=document.createElement('div');ov.className='sheet';
 const close=()=>ov.remove();
 const list=()=>{const lvls=LEVELS.filter(L=>L.id>st.level&&(!only||L.id===only));
  if(only&&lvls.length===1){ask(lvls[0]);return}
  ov.innerHTML=`<div class="sheetbox"><div class="msg sm">${T.where} 🚀</div><div class="sub">${T.jump_sub}</div>
  ${lvls.map(L=>`<button class="jumpto" data-j="${L.id}"><b>${S.level} ${L.id}</b> · ${L.name}</button>`).join('')}
  <button class="linkbtn" id="jx">${T.not_now}</button></div>`;
  ov.querySelector('#jx').onclick=close;
  ov.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{sfx.tap();ask(LEVELS[+b.dataset.j-1])})};
 const ask=L=>{ov.innerHTML=`<div class="sheetbox"><div class="msg sm">${T.jump_to} ${L.id}?</div><div class="sub" style="font-size:22px;font-weight:800">${L.name}</div><div class="sub">${T.kept}</div>
  <button class="jumpto" id="jy">${T.yes_jump} 🚀</button><button class="linkbtn" id="jn">${T.not_now}</button></div>`;
  ov.querySelector('#jn').onclick=close;
  ov.querySelector('#jy').onclick=()=>{sfx.sparkle();st.level=L.id;st.song=1;save();close();startRound(L.id,1)}};
 document.body.appendChild(ov);
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
 list();
}
// ---------- real songs (official YouTube embeds, no audio hosted here) ----------
let playerOpen=false;
function ytThumb(m){return 'https://i.ytimg.com/vi/'+m.id+'/mqdefault.jpg'}
function ytWatch(m){return 'https://www.youtube.com/watch?v='+m.id}
function openPlayer(i,lang){
 const m=MV[i];if(!m)return;
 if(!lang)lang=m.he?'he':'en';if(lang==='he'&&!m.he)lang='en';
 if(curAudio)try{curAudio.pause()}catch(e){}
 playerOpen=true;mus.hold=true;musStop();
 const old=$('#ytov');if(old)old.remove();
 const vid=lang==='he'?m.he:m.id;
 const ov=document.createElement('div');ov.className='ytov';ov.id='ytov';ov.dataset.lang=lang;
 const src='https://www.youtube-nocookie.com/embed/'+vid+'?autoplay=1&rel=0&playsinline=1&modestbranding=1';
 ov.innerHTML=`<div class="ytbox">
  <div class="ythead"><div><div class="ytt" dir="ltr" lang="en">${esc(m.t)}</div><div class="yta">${lang==='he'?'🇮🇱 '+T.he_ver:'🎤 '+T.orig_ver}</div></div><button class="iconbtn" id="ytx" aria-label="close">✖</button></div>
  <div class="ytframe"><iframe src="${src}" title="${esc(m.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
  ${m.he?`<div class="langsw"><button class="lng ${lang==='he'?'on':''}" data-l="he">🇮🇱 ${T.he}</button><button class="lng ${lang==='en'?'on':''}" data-l="en">🎤 ${T.orig}</button></div>`:''}
  <div class="ytcred">${lang==='he'?'<bdi dir="ltr">KPop Demon Hunters · Hebrew</bdi>':T.official+' · <bdi>'+MVCH+'</bdi>'}</div>
  <a class="ytopen" href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">${T.open_yt} ↗</a>
 </div>`;
 document.body.appendChild(ov);
 const close=()=>{ov.remove();playerOpen=false;mus.hold=false;musStart()};
 ov.querySelector('#ytx').onclick=close;
 ov.querySelectorAll('.lng').forEach(b=>b.onclick=()=>{if(b.dataset.l!==lang){sfx.tap();openPlayer(i,b.dataset.l)}});
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
}
function songsPage(){collection('songs')}
function songRows(){
 return MV.map((m,i)=>st.mv.includes(i)?`<div class="mvrow song" data-row="${i}"><img src="${ytThumb(m)}" alt="" loading="lazy"><div class="mvtx"><div class="mvt" dir="ltr" lang="en">${esc(m.t)}</div><div class="mva" dir="ltr" lang="en">${esc(m.a)}</div>
   <div class="mvbtns">${m.he?`<button class="mvb he" data-mv="${i}" data-l="he">🇮🇱 ${T.he}</button>`:''}<button class="mvb en" data-mv="${i}" data-l="en">🎤 ${T.orig}</button></div></div></div>`
  :`<div class="mvrow lock"><div class="mvlock">🔒</div><div class="mvtx"><div class="mvt" dir="ltr" lang="en">${esc(m.t)}</div><div class="mva">${i===0?T.after_first:'🔓 '+T.unlock_end+' '+MVLV[i]}</div></div></div>`).join('');
}
function intro(){
 const ov=document.createElement('div');ov.className='concert';ov.style.background='radial-gradient(circle at 50% 30%,#8a2fd0,#1a0533 75%)';
 ov.innerHTML=`<div class="lights"><i style="left:5%"></i><i style="left:38%;animation-delay:-.7s"></i><i style="right:5%;animation-delay:-1.4s"></i></div>
 <div class="msg">${S.welcome_stage}</div>
 <div class="trio">${[0,1,2].map(i=>IDOLS.idolSVG(i)).join('')}</div>
 <div class="msg" style="font-size:32px">${S.we_are} 💖</div>
 <button class="bigbtn" id="go">${S.start} ⭐</button>`;
 document.body.appendChild(ov);
 ov.querySelector('#go').onclick=()=>{sfx.sparkle();st.intro=true;save();ov.remove()};
}
function bindCommon(){
 bindMus();
 const c=$('#coll');if(c)c.onclick=()=>{sfx.tap();collection('cards')};
 const g=$('#gear');if(!g)return;let t0=0,timer=0,af=0;
 const ring=g.querySelector('.ring');
 const stop=()=>{clearTimeout(timer);cancelAnimationFrame(af);ring.style.setProperty('--p',0)};
 const tick=()=>{const p=Math.min(100,(Date.now()-t0)/30);ring.style.setProperty('--p',p);if(p<100)af=requestAnimationFrame(tick)};
 g.addEventListener('pointerdown',e=>{e.preventDefault();t0=Date.now();tick();timer=setTimeout(()=>{stop();parent()},3000)});
 ['pointerup','pointerleave','pointercancel'].forEach(ev=>g.addEventListener(ev,stop));
 g.addEventListener('contextmenu',e=>e.preventDefault());
}
function startRound(lv,song){round=buildRound(lv,song);music('game');showItem()}
function showItem(){
 const r=round,it=r.items[r.idx];r.tries=0;r.wrongs=0;
 const prog=r.items.map((_,i)=>`<i class="${i<r.res.length?(r.res[i]===1?'ok':'meh'):''} ${i===r.idx?'now':''}"></i>`).join('');
 const n=it.opts.length;const cols=it.cols||(it.ocls==='emoji'?(n===3?3:2):(n===3?3:2));
 let tgt='';
 if(it.listen) tgt=`<button class="speak big" id="spk" aria-label="listen">🔊</button>`;
 else if(it.kind==='story') tgt=`<div style="font-size:44px">${it.pic}</div><div class="target story">${esc(it.target)}</div><div class="storyq">${esc(it.question)}</div>`;
 else tgt=`<div class="target ${it.tcls}">${esc(it.target)}</div>`;
 app.innerHTML=`<div class="topbar"><button class="iconbtn" id="homeb" aria-label="home">🏠</button><div class="progress">${prog}</div><span class="pill">⭐ <b id="starc">${st.stars}</b></span>${musBtn()}</div>
 <div class="qcard"><div class="instr">${it.instr}</div>${tgt}${(!it.listen&&it.audio&&hasAudio(it.audio))?`<button class="speak" id="spk" style="display:none" aria-label="listen">🔊</button>`:''}</div>
 <div class="opts c${cols===1?1:cols}">${it.opts.map((o,i)=>`<button class="opt ${it.ocls||''}" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
 <div class="mini">${IDOLS.idolSVG(r.idx%3,{noname:true,cls:'round'})}</div>`;
 $('#homeb').onclick=()=>{sfx.tap();home()};bindMus();
 const spk=$('#spk');if(spk){spk.onclick=()=>playAudio(it.audio);if(it.listen)setTimeout(()=>playAudio(it.audio),350)}
 app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>answer(b,it));
}
function answer(btn,it){
 const r=round;if(r.lock)return;const o=it.opts[+btn.dataset.i];
 if(btn.classList.contains('wrong'))return;
 const stat=st.stats[it.id]||(st.stats[it.id]={n:0,w:0});
 if(o.ok){
  r.lock=true;btn.classList.add('right');sfx.good();
  const first=r.tries===0;const score=first?1:(r.revealed?0:0.5);
  if(first){st.stars++;st.firstTry++;toast(pick(S.good));const m=$('.mini');m&&m.classList.add('jump');}else if(!r.revealed)toast(pick(S.good));
  if(r.tries===0||!r.counted){st.answered++;}
  stat.n++;stat.last=Date.now();if(!first)stat.w++;
  r.res.push(score);r.revealed=false;save();
  const sc=$('#starc');if(sc)sc.textContent=st.stars;
  setTimeout(()=>{r.lock=false;r.idx++;if(r.idx>=r.items.length)endRound();else showItem()},first?1000:1300);
 }else{
  r.tries++;btn.classList.add('wrong');sfx.soft();
  const left=[...app.querySelectorAll('.opt')].filter(b=>!b.classList.contains('wrong'));
  const spk=$('#spk');if(spk)spk.style.display='';
  if(left.length<=1||r.tries>=2){r.revealed=true;left.forEach(b=>{if(it.opts[+b.dataset.i].ok)b.classList.add('hint')});toast(S.reveal+' ✨',true)}
  else toast((r.tries===1?S.try:S.almost)+' 💜',true);
 }
}
function endRound(){
 const r=round;const total=r.items.length;const firsts=r.res.filter(x=>x===1).length;const pct=firsts/total;const pass=pct>=0.8;
 st.history.unshift({t:Date.now(),lv:r.lv,song:r.song,ok:firsts,n:total,sec:Math.round((Date.now()-r.start)/1000),st:r.struggle?1:0});st.history=st.history.slice(0,60);
 st.struggle[r.key]=pct<0.5;
 let newCard=null,levelUp=false,allDone=false,newMV=null,skipped=false;
 if(pass){st.stars+=3;const ci=Array.from({length:15},(_,i)=>i).find(i=>!st.cards.includes(i));if(ci!=null){st.cards.push(ci);newCard=ci}
  st.cleared[r.key]=true;
  const perfect=firsts===total;
  if(r.lv===st.level&&r.song===st.song&&!st.done){
   if(st.song<NSONG&&!perfect)st.song++;
   else{levelUp=true;skipped=st.song<NSONG;if(st.level<5){st.level++;st.song=1}else{allDone=true;st.done=true}}
  }
  if(levelUp||!st.mv.length)newMV=unlockNextMV();
  if(allDone){st.finished=true;MV.forEach((_,k)=>{if(!st.mv.includes(k))st.mv.push(k)})}
 }
 let newSticker=null;const shouldHave=Math.min(STICKERS.length,Math.floor(st.stars/STARS_PER_STICKER));
 while(st.stickers.length<shouldHave){const c=STICKERS.find(s=>!st.stickers.includes(s));st.stickers.push(c);newSticker=c}
 save();
 const starsRow='⭐'.repeat(Math.max(1,Math.round(pct*5)));
 const msg=pass?S.round_done:(pct>=0.5?S.great_effort:S.practice_more);
 app.innerHTML=`${topbar()}<div class="panel">
  ${skipped?`<div class="msg skipmsg">${total} ${S.of} ${total}! 🚀</div><div class="sub" style="font-weight:800">${T.skip_msg}</div>`:`<div class="msg">${msg} ${pass?'🎉':'💜'}</div>`}
  <div class="big-stars">${starsRow}</div>
  ${pct>=0.5&&!skipped?`<div class="sub">${firsts} / ${total} ⭐</div>`:''}
  ${newCard!=null?`<div class="sub" style="font-weight:800;margin-top:8px">${S.new_card} 🎴</div><div class="pcard flipin">${IDOLS.cardSVG(newCard)}<div class="nm">${S.idols[newCard%3]}</div></div>`:''}
  ${newSticker?`<div class="sub" style="font-weight:800">${S.new_sticker}</div><div style="font-size:64px" class="flipin">${newSticker}</div>`:''}
  ${newMV!=null&&!levelUp?`<div class="mvnew"><div class="sub" style="font-weight:800">🎬 ${T.new_song}</div><button class="bigbtn mvbtn" id="mvgo">▶ <span dir="ltr" lang="en">${esc(MV[newMV].t)}</span></button></div>`:''}
 </div>
 <button class="bigbtn" id="next">${pass?S.next_song:S.again} 🎤</button>
 <button class="bigbtn alt" id="hm">🏠 ${S.home}</button>`;
 bindCommon();
 if(!levelUp)music('menu');
 if(pass){confetti(skipped?220:140);sfx.sparkle()}
 $('#next').onclick=()=>{sfx.tap();if(!pass){startRound(r.lv,r.song);return}
  if(st.done&&!allDone){if(r.song<NSONG)startRound(r.lv,r.song+1);else if(r.lv<5)startRound(r.lv+1,1);else finale();return}
  startRound(st.level,st.song)};
 $('#hm').onclick=()=>{sfx.tap();home()};
 const mg=$('#mvgo');if(mg)mg.onclick=()=>{sfx.tap();openPlayer(newMV)};
 if(levelUp)setTimeout(()=>concert(r.lv,allDone,newMV),skipped?1700:900);
}
function concert(lv,allDone,mvi){
 const ov=document.createElement('div');ov.className='concert';
 ov.innerHTML=`<div class="curtain l"></div><div class="curtain r"></div>
 <div class="lights"><i style="left:2%"></i><i style="left:36%;animation-delay:-.6s"></i><i style="right:2%;animation-delay:-1.2s"></i></div>
 <div class="msg">${S.concert} 🎤</div>
 <div class="trio">${[0,1,2].map(i=>IDOLS.idolSVG(i)).join('')}</div>
 <div class="sticks"><span>🪄</span><span>💖</span><span>🪄</span><span>💜</span><span>🪄</span></div>
 <div class="msg">${allDone?S.all_done:S.level_up} 🎉</div>
 <div class="sub" style="z-index:2;font-size:24px">${S.stage_lights} ✨</div>
 ${mvi!=null?`<button class="bigbtn mvbtn" id="cmv">🎬 ${T.real_song}<small dir="ltr" lang="en">${esc(MV[mvi].t)}</small></button>`:''}
 <button class="bigbtn ${mvi!=null?'alt':''}" id="cgo">${S.continue} ⭐</button>`;
 document.body.appendChild(ov);music('concert');sfx.fanfare();setTimeout(()=>confetti(220),1200);setTimeout(()=>confetti(160),2600);
 ov.querySelector('#cgo').onclick=()=>{ov.remove();if(allDone)finale();else home()};
 const cm=ov.querySelector('#cmv');if(cm)cm.onclick=()=>{sfx.tap();openPlayer(mvi)};
}
function collection(tab){
 round=null;
 const cards=Array.from({length:15},(_,i)=>st.cards.includes(i)?`<div class="pcard">${IDOLS.cardSVG(i)}<div class="nm">${S.idols[i%3]}</div></div>`:`<div class="slot">🔒</div>`).join('');
 const stk=STICKERS.map(s=>st.stickers.includes(s)?`<div>${s}</div>`:`<div class="lock">🔒</div>`).join('');
 const toNext=STARS_PER_STICKER-(st.stars%STARS_PER_STICKER);
 let body;
 if(tab==='songs')body=`<div class="sub" style="text-align:center">${st.mv.length>=MV.length?T.all_songs+' 🎉':T.songs_sub}</div><div class="mvlist">${songRows()}</div>`;
 else if(tab==='cards')body=`<div class="grid-cards">${cards}</div><div class="sub" style="text-align:center;margin-top:12px">${S.collect_all} ✨</div>`;
 else body=`<div class="stk">${stk}</div><div class="sub" style="text-align:center;margin-top:12px">⭐ ${toNext} ${S.more_stars}</div><div class="sub" style="text-align:center;margin-top:12px">${S.collect_all} ✨</div>`;
 app.innerHTML=`${topbar(`<button class="iconbtn" id="homeb" aria-label="home">🏠</button>`)}
 <div class="h2">${S.collection} 🎴</div>
 <div class="tabs t3"><button class="${tab==='cards'?'on':''}" id="tc">🎴 ${S.photocards}<b>${st.cards.length}/15</b></button><button class="${tab==='stk'?'on':''}" id="ts">💖 ${S.stickers}<b>${st.stickers.length}/${STICKERS.length}</b></button><button class="${tab==='songs'?'on':''}" id="tm">🎵 ${T.songs_tab}<b>${st.mv.length}/${MV.length}</b></button></div>
 ${body}`;
 bindCommon();
 $('#homeb').onclick=()=>{sfx.tap();home()};$('#tc').onclick=()=>{sfx.tap();collection('cards')};$('#ts').onclick=()=>{sfx.tap();collection('stk')};$('#tm').onclick=()=>{sfx.tap();collection('songs')};
 app.querySelectorAll('.mvb[data-mv]').forEach(b=>b.onclick=e=>{e.stopPropagation();sfx.tap();openPlayer(+b.dataset.mv,b.dataset.l)});
 music('menu');
}
function parent(){
 const h=st.history;const totN=h.reduce((a,x)=>a+x.n,0),totOk=h.reduce((a,x)=>a+x.ok,0);
 const acc=totN?Math.round(totOk/totN*100):0;const mins=Math.round(h.reduce((a,x)=>a+x.sec,0)/60);
 const byLv=LEVELS.map(L=>{const hh=h.filter(x=>x.lv===L.id);const n=hh.reduce((a,x)=>a+x.n,0),ok=hh.reduce((a,x)=>a+x.ok,0);return `<tr><td>${L.id}</td><td>${['הברות','מילים קצרות','מילים ארוכות','משפטים','סיפורים קצרים'][L.id-1]}</td><td>${levelDone(L.id)?NSONG:[1,2].filter(s=>st.cleared[L.id+'-'+s]).length}/${NSONG}</td><td>${n?Math.round(ok/n*100)+'%':'—'}</td><td>${hh.length}</td></tr>`}).join('');
 const fmt=t=>{const d=new Date(t);return d.toLocaleDateString('he-IL',{day:'numeric',month:'numeric'})+' '+d.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})};
 const recent=h.slice(0,12).map(x=>`<tr><td>${fmt(x.t)}</td><td>שלב ${x.lv} · שיר ${x.song}</td><td>${x.ok}/${x.n}${x.ok/x.n>=.8?' ✅':''}${x.st?' (תרגול מוקל)':''}</td><td>${Math.max(1,Math.round(x.sec/60))} דק׳</td></tr>`).join('')||'<tr><td colspan="4">עוד לא שוחקו סבבים</td></tr>';
 const hard=Object.entries(st.stats).filter(([k,v])=>v.w>=2).sort((a,b)=>b[1].w-a[1].w).slice(0,8).map(([k])=>k.split(':')[1]).filter(Boolean);
 app.innerHTML=`<div class="parent" dir="rtl">
 <h2>פינת הורים 👩‍👧</h2>
 <div class="kpi"><div><b>${st.level}</b>${st.done?'סיימה את כל השלבים':'שלב נוכחי (שיר '+st.song+'/'+NSONG+')'}${st.game>1?' · משחק '+st.game:''}</div><div><b>${acc}%</b>דיוק בניסיון ראשון</div><div><b>${h.length}</b>סבבים · ${mins} דק׳</div></div>
 <div>⭐ ${st.stars} כוכבים · 🎴 ${st.cards.length}/15 פוטוקארדים · מדבקות ${st.stickers.length}/${STICKERS.length}</div>
 <h3>לפי שלב</h3><table><tr><th>#</th><th>שלב</th><th>שירים שעברה</th><th>דיוק</th><th>סבבים</th></tr>${byLv}</table>
 <h3>תרגול אחרון</h3><table><tr><th>מתי</th><th>מה</th><th>תוצאה</th><th>זמן</th></tr>${recent}</table>
 ${hard.length?`<h3>מילים/פריטים שדורשים חיזוק</h3><div>${hard.map(esc).join(' · ')}</div>`:''}
 <p style="font-size:14px;color:#666">איך זה עובד: כל סבב הוא "שיר" של 5 שאלות (4 בשלב הסיפורים, כ־1–2 דקות). 4 מתוך 5 בניסיון ראשון = עוברים לשיר הבא; 5 מתוך 5 = קופצים ישר לשלב הבא; 2 שירים = עולים שלב ("הופעה"). כל עלייה בשלב פותחת שיר אמיתי מהסרט (הקליפ הרשמי מיוטיוב, בתוך המשחק; הראשון נפתח אחרי הסבב הראשון שעוברים). הכפתור "קל לך? קפצי קדימה" במסך הבית מאפשר לקפוץ לשלב קשה יותר, עם אישור. אם הסבב קשה (פחות מחצי), הסבב הבא קל יותר: פחות אפשרויות ושאלות חזרה מהשלב הקודם. טעות אף פעם לא מורידה כוכבים. אחרי שמסיימים את כל 5 השלבים: כל השירים נפתחים (כל שיר בגרסה העברית מהדיבוב ובמקור), אפשר לבחור כל שלב במפה, ו"משחק חדש" מתחיל משלב 1 עם מילים שעוד לא הופיעו (הכוכבים, הקלפים, המדבקות והשירים נשמרים).</p>
 <div class="row"><span>להתחיל משלב:</span>${LEVELS.map(L=>`<button data-set="${L.id}">${L.id}</button>`).join('')}</div>
 <div class="row"><button id="snd">צלילים: ${st.sound?'פועלים 🔊':'כבויים 🔇'}</button><button class="danger" id="rst">איפוס כל ההתקדמות</button><button id="cls">סגירה ✖</button></div>
 </div>`;
 app.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const lv=+b.dataset.set;if(confirm('להעביר את יהב לשלב '+lv+'?')){st.level=lv;st.song=1;st.done=false;save();parent()}});
 $('#snd').onclick=()=>{st.sound=!st.sound;save();parent()};
 $('#rst').onclick=()=>{if(confirm('למחוק את כל ההתקדמות, הכוכבים והאוסף?')){const keep=st.intro;st=fresh();st.intro=keep;save();home()}};
 $('#cls').onclick=()=>home();
}
window.__cur=()=>{const it=round&&round.items[round.idx];return it?it.opts.findIndex(o=>o.ok):-1};
window.__app={songsPage,openPlayer,finale,newGame,freePlay,baseOf,jumpPicker,MV,mus:()=>({key:mus.key,playing:mus.playing,paused:mus.el?mus.el.paused:null,t:mus.el?mus.el.currentTime:0,unlocked:mus.unlocked,on:musicOn(),gain:mus.gain?mus.gain.gain.value:null}),st:()=>st,home,startRound,buildRound,LEVELS,concert,collection,parent};
home();
})();
