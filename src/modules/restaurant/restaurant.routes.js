const express = require("express");
const controller = require("./restaurant.controller");
const authenticate = require("../auth/auth.middleware");
const { uploadSingle } = require("../shared/upload.middleware");

const router = express.Router();

router.get("/", controller.list);
router.get("/:restaurantId", controller.getById);
router.post("/", authenticate, controller.create);
router.post(
  "/:restaurantId/image",
  authenticate,
  uploadSingle,
  controller.uploadImage
); 

module.exports = router;