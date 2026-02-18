const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/dbConfig.js");
const authRoutes = require("./routes/authRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const expenseRoutes = require("./routes/expenseRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const settlementRoutes = require("./routes/settlementRoutes.js");
const authMiddleware = require("./middlewares/authMiddleware.js");
const cors = require('cors')
const cookieParser = require("cookie-parser");

dotenv.config();

//connect to db
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
);

app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/notifications', notificationRoutes);
app.use('/expenses', expenseRoutes);
app.use('/chat', chatRoutes);
app.use('/settlements', settlementRoutes);

app.get('/home', (req, res) => {
  res.json({ message: "Welcome to the Home Route! Server is running successfully." });
});

// Protected route example
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: "This is a protected route!", 
    user: req.user.name 
  });
});

app.get('/', (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});