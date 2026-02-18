const express = require("express");
const router = express.Router();
const {createGroup, getGroups, getGroupById, inviteMember, respondToInvite, removeMember, deleteGroup} = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
    createGroup(req, res);
});

router.get("/", authMiddleware, async (req, res) => {
    getGroups(req, res);
});

router.get("/:id", authMiddleware, async (req, res) => {
    getGroupById(req, res);
});

router.post("/:id/invite", authMiddleware, async (req, res) => {
    inviteMember(req, res);
});

router.post("/invite/respond", authMiddleware, async (req, res) => {
    respondToInvite(req, res);
});

router.delete("/:id/member", authMiddleware, async (req, res) => {
    removeMember(req, res);
});

router.delete("/:id", authMiddleware, async (req, res) => {
    deleteGroup(req, res);
});


module.exports = router;
