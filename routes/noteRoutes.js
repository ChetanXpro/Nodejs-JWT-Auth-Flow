const express = require("express");

const router = express.Router();
const noteController = require("../controllers/noteController");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);

router.get("/", noteController.getAllNotes);
router.post("/", noteController.createNewNote);
router.patch("/", noteController.updateNote);
router.delete("/", noteController.deleteNote);

module.exports = router;
