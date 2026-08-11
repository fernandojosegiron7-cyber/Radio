
const {getConfig} = require("./_common");
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({error:"Método no permitido"});
  res.setHeader("Cache-Control","no-store");
  try {
    const config = await getConfig();
    return res.status(200).json(config);
  } catch (e) {
    return res.status(500).json({error:"No se pudo cargar la configuración"});
  }
};
