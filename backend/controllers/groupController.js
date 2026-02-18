const Group = require("../models/Group");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendGroupInviteEmail } = require("../services/emailService");

const createGroup = async (req, res) => {
  try {
    const { name, type, currency } = req.body;
    const ownerId = req.user.id;

    const group = await Group.create({
      name,
      type: type || "general",
      currency: currency || "INR",
      ownerId,
      memberIds: [ownerId]
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ memberIds: req.user.id })
      .populate("ownerId", "name username email")
      .populate("memberIds", "name username email avatarUrl");
    
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("ownerId", "name username email")
      .populate("memberIds", "name username email avatarUrl");

    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.memberIds.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { username } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const invitedUser = await User.findOne({ username });

    if (!invitedUser) {
      await sendGroupInviteEmail(username, req.user.name, group.name);
      return res.json({ message: "Invitation email sent to register" });
    }

    if (group.memberIds.includes(invitedUser._id)) {
      return res.status(400).json({ error: "User already in group" });
    }

    if (invitedUser.allowAutoAdd) {
      group.memberIds.push(invitedUser._id);
      await group.save();

      await Notification.create({
        userId: invitedUser._id,
        type: "invite",
        message: `You were added to group "${group.name}" by ${req.user.name}`,
        groupId: group._id,
        invitedBy: req.user.id,
        status: "accepted"
      });

      return res.json({ message: "User added to group directly" });
    }

    const existingNotif = await Notification.findOne({
      userId: invitedUser._id,
      groupId: group._id,
      type: "invite",
      status: "pending"
    });

    if (existingNotif) {
      return res.status(400).json({ error: "Invitation already sent" });
    }

    await Notification.create({
      userId: invitedUser._id,
      type: "invite",
      message: `${req.user.name} invited you to join "${group.name}"`,
      groupId: group._id,
      invitedBy: req.user.id
    });

    await sendGroupInviteEmail(invitedUser.email, req.user.name, group.name);

    res.json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToInvite = async (req, res) => {
  try {
    const { notificationId, action } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" });
    }

    notification.status = action === "accept" ? "accepted" : "rejected";
    await notification.save();

    if (action === "accept") {
      const group = await Group.findById(notification.groupId);
      if (group && !group.memberIds.includes(req.user.id)) {
        group.memberIds.push(req.user.id);
        await group.save();
      }
      return res.json({ message: "Invitation accepted" });
    }

    res.json({ message: "Invitation rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }
    if (memberId === req.user.id) {
      return res.status(400).json({ error: "Admin cannot remove themselves" });
    }

    group.memberIds = group.memberIds.filter(id => id.toString() !== memberId);
    await group.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only admin can delete group" });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  inviteMember,
  respondToInvite,
  removeMember,
  deleteGroup
};
