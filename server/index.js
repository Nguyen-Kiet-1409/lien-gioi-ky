const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối với MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối thành công với căn cứ MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ Khởi động thất bại. Lỗi kết nối Database:', err);
  });

// API thử nghiệm
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend của Liên Giới Kỳ! 🃏');
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Máy chủ Backend đang chạy tưng bừng tại cổng ${PORT}`);
});