
const {getConfig, saveConfig, isAdminPassword} = require("./_common");
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido"});
  const {password, config} = req.body || {};
  if (!isAdminPassword(password)) return res.status(401).json({ok:false,error:"Contraseña incorrecta"});
  if (!config || typeof config !== "object") return res.status(400).json({ok:false,error:"Configuración inválida"});

  const current = await getConfig();
  const allowed = ["stationName","tagline","streamUrl","metadataUrl","logoUrl","backgroundUrl","accent","accent2",
                   "whatsapp","facebook","instagram","tiktok","website","showHistory"];
  const next = {...current};
  for (const k of allowed) if (k in config) next[k] = config[k];

  try {
    await saveConfig(next);
    return res.status(200).json({ok:true, config: next});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ok:false,error:"No se pudo guardar en Supabase"});
  }
};
