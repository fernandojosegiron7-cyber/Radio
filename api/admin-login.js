
const {isAdminPassword} = require("./_common");
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido"});
  const {password} = req.body || {};
  if (!isAdminPassword(password)) return res.status(401).json({ok:false,error:"Contraseña incorrecta"});
  return res.status(200).json({ok:true});
};
