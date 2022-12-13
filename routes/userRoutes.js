const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.get("/", userController.getAllUser);
router.post("/", userController.createNewUser);
router.patch("/", userController.updateUser);
router.delete("/", userController.deleteUser);

module.exports = router;
