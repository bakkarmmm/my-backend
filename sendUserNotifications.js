import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const sendNotificationUsers = async (text) => {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_LOGIN_NOTIFICATIONS;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text,
    });
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
};

export default sendNotificationUsers;
