const Chat = require("../models/Chat");
const Group = require("../models/Group");

const sendMessage = async (req, res) => {
  try {
    const { groupId, message } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const chat = await Chat.create({
      groupId,
      senderId: req.user.id,
      message
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate("senderId", "name username avatarUrl");

    res.status(201).json({ message: "Message sent", chat: populatedChat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const total = await Chat.countDocuments({ groupId });
    const messages = await Chat.find({ groupId })
      .populate("senderId", "name username avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, getMessages };
