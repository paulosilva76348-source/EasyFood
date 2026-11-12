const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Espera o formato: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifica a assinatura e a validade do token
    const payload = jwt.verify(token, JWT_SECRET);
    const id = Number(payload.sub);

    // O id do token precisa ser número: o banco compara ownerId como inteiro.
    req.user = {
      id: Number.isSafeInteger(id) ? id : payload.sub,
      name: payload.name,
      email: payload.email
    };

    next(); // token válido → segue para a rota
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

module.exports = authenticate;