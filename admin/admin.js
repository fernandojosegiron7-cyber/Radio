
const $=id=>document.getElementById(id);
const form=$("form");
let adminPassword=sessionStorage.getItem("radioAdminPassword")||"";

async function loadConfig(){
  const r=await fetch("/api/config",{cache:"no-store"});
  const cfg=await r.json();
  Object.entries(cfg).forEach(([k,v])=>{
    const el=form.elements[k]; if(!el)return;
    if(el.type==="checkbox")el.checked=!!v; else el.value=v??"";
  });
}

async function login(){
  const password=$("password").value;
  $("loginMsg").textContent="Verificando…";
  try{
    const r=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"No autorizado");
    adminPassword=password;
    sessionStorage.setItem("radioAdminPassword",password);
    $("loginCard").classList.add("hidden");
    $("panel").classList.remove("hidden");
    $("loginMsg").textContent="";
    await loadConfig();
  }catch(e){$("loginMsg").textContent=e.message}
}

$("loginBtn").onclick=login;
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")login()});

async function fileToDataURL(file){
  if(!file)return "";
  if(file.size>1.2*1024*1024) throw new Error("La imagen supera 1.2 MB");
  return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const msg=$("saveMsg"); msg.classList.remove("ok"); msg.textContent="Guardando…";
  try{
    const cfg={};
    [...form.elements].forEach(el=>{
      if(!el.name)return;
      cfg[el.name]=el.type==="checkbox"?el.checked:el.value.trim();
    });
    const lf=$("logoFile").files[0]; if(lf) cfg.logoUrl=await fileToDataURL(lf);
    const bf=$("bgFile").files[0]; if(bf) cfg.backgroundUrl=await fileToDataURL(bf);

    const r=await fetch("/api/admin-save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:adminPassword,config:cfg})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"No se pudo guardar");
    msg.classList.add("ok"); msg.textContent="✓ Cambios guardados para todos.";
    $("logoFile").value="";$("bgFile").value="";
    setTimeout(()=>msg.textContent="",3500);
  }catch(e){msg.textContent=e.message}
});

$("logout").onclick=()=>{sessionStorage.removeItem("radioAdminPassword");location.reload()};

(async()=>{
  if(adminPassword){
    $("password").value=adminPassword;
    await login();
  }
})();
