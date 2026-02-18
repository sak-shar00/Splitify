const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  sendMessage(req, res);
});

router.get("/:groupId", authMiddleware, async (req, res) => {
  getMessages(req, res);
});

module.exports = router;
