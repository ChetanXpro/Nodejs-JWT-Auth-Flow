const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

// router.use(verifyJWT);

router.get("/", verifyJWT, userController.getAllUser);
router.post("/", userController.createNewUser);
router.patch("/", verifyJWT, userController.updateUser);
router.delete("/", verifyJWT, userController.deleteUser);

module.exports = router;
