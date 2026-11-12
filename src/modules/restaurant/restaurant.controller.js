const restaurantService = require("./restaurant.service");

async function list(req, res) {
  try {
    const restaurantes = await restaurantService.listRestaurants();
    res.json(restaurantes);
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getById(req, res) {
  try {
    const restaurant = await restaurantService.getRestaurant(req.params.restaurantId);
    res.json(restaurant);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: status === 500 ? "Erro interno do servidor" : error.message
    });
  }
}

async function create(req, res) {
  const { name, category, rating } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
  }

  try {
    const restaurant = await restaurantService.createRestaurant(
      { name, category, rating: rating || 0 },
      req.user
    );
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Envie uma imagem no campo image" });
    }
    const restaurant = await restaurantService.setRestaurantImage(
      req.params.restaurantId,
      req.file,
      req.user.id
    );
    res.json(restaurant);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error("Erro ao enviar imagem do restaurante:", error.message);
    res.status(status).json({
      error: status === 500 ? "Erro interno do servidor" : error.message
    });
  }
}

module.exports = { list, getById, create, uploadImage };