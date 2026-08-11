
const $=id=>document.getElementById(id);
let cfg=null;

async function loadConfig(){
  try{
    const r=await fetch("/api/config",{cache:"no-store"});
    cfg=await r.json();
  }catch(e){
    cfg={
      stationName:"ALÓ PAISANO RADIO",tagline:"Regional • Grupera • Para nuestra gente",
      streamUrl:"https://stream.zeno.fm/9bff26uk2v8uv",
      metadataUrl:"https://api.zeno.fm/mounts/metadata/subscribe/9bff26uk2v8uv",
      logoUrl:"/assets/logo.svg",accent:"#f7c65a",accent2:"#d9342b",showHistory:true
    };
  }
  applyConfig();
  initPlayer();
  connectMetadata();
}

function applyConfig(){
  document.documentElement.style.setProperty("--accent",cfg.accent||"#f7c65a");
  document.documentElement.style.setProperty("--accent2",cfg.accent2||"#d9342b");
  $("stationName").textContent=cfg.stationName||"Mi Radio";
  $("tagline").textContent=cfg.tagline||"Siempre contigo";
  $("logo").src=cfg.logoUrl||"/assets/logo.svg";
  document.title=cfg.stationName||"Radio";
  if(cfg.backgroundUrl){document.body.classList.add("has-bg");document.body.style.setProperty("--bgimg",`url("${cfg.backgroundUrl}")`)}
  if(cfg.showHistory===false)$("historyCard").style.display="none";
  const socials=[["WhatsApp",cfg.whatsapp],["Facebook",cfg.facebook],["Instagram",cfg.instagram],["TikTok",cfg.tiktok],["Web",cfg.website]].filter(x=>x[1]);
  $("socials").innerHTML=socials.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join("");
}

function initPlayer(){
  const audio=$("audio");audio.src=cfg.streamUrl||"";
  const vis=$("visualizer");vis.innerHTML="";
  for(let i=0;i<44;i++){const b=document.createElement("i");b.className="bar";b.style.setProperty("--h",`${9+Math.floor(Math.random()*24)}px`);b.style.animationDelay=`${(i%9)*.05}s`;vis.appendChild(b)}
  function ui(play){$("play").textContent=play?"❚❚":"▶";vis.classList.toggle("playing",play);$("status").textContent=play?"Reproduciendo transmisión en vivo":"Toca reproducir para escuchar"}
  $("play").onclick=async()=>{if(audio.paused){try{audio.src=cfg.streamUrl;await audio.play();ui(true)}catch(e){$("status").textContent="No se pudo iniciar el streaming"}}else{audio.pause();ui(false)}};
  audio.onplaying=()=>ui(true);audio.onpause=()=>ui(false);audio.onerror=()=>{$("status").textContent="Error de conexión con la transmisión";ui(false)};
  let last=.85;audio.volume=.85;
  $("volume").oninput=e=>{audio.volume=+e.target.value;$("volNum").textContent=Math.round(audio.volume*100);if(audio.volume>0)last=audio.volume;$("mute").textContent=audio.volume===0?"🔇":audio.volume<.5?"🔉":"🔊"};
  $("mute").onclick=()=>{if(audio.volume>0){last=audio.volume;audio.volume=0;$("volume").value=0;$("volNum").textContent=0;$("mute").textContent="🔇"}else{audio.volume=last;$("volume").value=last;$("volNum").textContent=Math.round(last*100);$("mute").textContent="🔊"}};
  $("share").onclick=async()=>{const d={title:cfg.stationName,text:`Escucha ${cfg.stationName} en vivo`,url:location.href};if(navigator.share){try{await navigator.share(d)}catch(e){}}else{navigator.clipboard?.writeText(location.href);$("status").textContent="Enlace copiado"}};
}

let history=[],lastRaw="";
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function parse(raw){
  raw=(raw||"").trim();
  if(!raw)return {title:cfg.stationName||"En vivo",artist:"Transmisión en vivo"};
  const p=raw.split(/\s+-\s+/);
  if(p.length>=2)return {artist:p.shift().trim(),title:p.join(" - ").trim()};
  return {title:raw,artist:cfg.stationName||"Radio"};
}
function render(){
 $("history").innerHTML=history.map((x,i)=>`<div class="item"><div class="note">${i===0?"♪":"♫"}</div><div class="txt"><strong>${esc(x.title)}</strong><span>${esc(x.artist)}</span></div><div class="time">${x.time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div></div>`).join("");
}
function update(raw){
 if(!raw||raw===lastRaw)return;lastRaw=raw;
 const t=parse(raw);$("song").textContent=t.title;$("artist").textContent=t.artist;
 history.unshift({...t,time:new Date()});history=history.slice(0,7);render();
 try{if("mediaSession"in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:cfg.stationName,artwork:[{src:cfg.logoUrl||"/assets/logo.svg",sizes:"512x512"}]})}catch(e){}
}
function connectMetadata(){
 if(!cfg.metadataUrl){$("metaState").textContent="Sin API de metadatos";return}
 try{
   const es=new EventSource(cfg.metadataUrl);
   es.onopen=()=>$("metaState").textContent="Metadatos en vivo";
   es.onmessage=ev=>{
     try{
       const d=JSON.parse(ev.data);
       const raw=d.streamTitle||d.title||d.song||d.now_playing?.song?.text||d.metadata?.title||"";
       if(raw)update(raw);
     }catch(e){
       const raw=(ev.data||"").trim();
       if(raw&&!raw.startsWith(":"))update(raw);
     }
   };
   es.onerror=()=>$("metaState").textContent="Reconectando metadatos…";
 }catch(e){$("metaState").textContent="Metadatos no disponibles"}
}

loadConfig();
