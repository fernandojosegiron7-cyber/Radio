
const DEFAULT_CONFIG = {
  stationName: "ALÓ PAISANO RADIO",
  tagline: "Regional • Grupera • Para nuestra gente",
  streamUrl: "https://stream.zeno.fm/9bff26uk2v8uv",
  metadataUrl: "https://api.zeno.fm/mounts/metadata/subscribe/9bff26uk2v8uv",
  logoUrl: "/assets/logo.svg",
  backgroundUrl: "",
  accent: "#f7c65a",
  accent2: "#d9342b",
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  website: "",
  showHistory: true
};

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Claves nuevas sb_secret_*: usar solo apikey.
  // Claves legacy service_role (JWT): también pueden usar Authorization Bearer.
  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${key}`;
  }
  const res = await fetch(`${url}/rest/v1/${path}`, {...options, headers});
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase ${res.status}: ${txt}`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function getConfig() {
  try {
    const rows = await supabaseRequest("radio_config?id=eq.1&select=config", {method:"GET"});
    if (Array.isArray(rows) && rows[0] && rows[0].config) {
      return {...DEFAULT_CONFIG, ...rows[0].config};
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CONFIG;
}

async function saveConfig(config) {
  const body = JSON.stringify([{id:1, config}]);
  return supabaseRequest("radio_config?on_conflict=id", {
    method:"POST",
    headers: {"Prefer":"resolution=merge-duplicates,return=representation"},
    body
  });
}

function isAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "";
  return expected.length >= 6 && password === expected;
}

module.exports = {DEFAULT_CONFIG, getConfig, saveConfig, isAdminPassword};
