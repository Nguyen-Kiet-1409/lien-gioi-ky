const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Card = require('./models/Card');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());

// Mở rộng giới hạn nhận dữ liệu lên 10 Megabyte (10mb)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Thêm dòng này để hỗ trợ các form dữ liệu khác

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

// API THÊM THẺ BÀI MỚI (Từ Frontend gửi lên)
app.post('/api/cards', async (req, res) => {
  try {
    // Lấy gói hàng (dữ liệu) từ Frontend gửi qua
    const cardData = req.body;
    
    // Đổ dữ liệu vào khuôn
    const newCard = new Card(cardData);
    
    // Lưu vào MongoDB (hành động này mất một chút thời gian nên dùng await)
    await newCard.save();
    
    // Báo về cho Frontend là đã nhận và lưu thành công
    res.status(201).json({ message: 'Tạo thẻ bài thành công rực rỡ!', card: newCard });
  } catch (error) {
    console.error('Lỗi khi lưu thẻ bài:', error);
    res.status(500).json({ message: 'Lỗi server không thể lưu!' });
  }
});

// ==========================================
// API ĐĂNG KÝ TÀI KHOẢN
// ==========================================
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Kiểm tra xem tên tài khoản có ai lấy chưa?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên tài khoản này đã có người sử dụng!' });
    }

    // 2. Băm nát mật khẩu (Mã hóa)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo tài khoản mới với mật khẩu đã mã hóa (Tặng kèm 1000 Kim cương theo Schema)
    const newUser = new User({ 
      username: username, 
      password: hashedPassword 
    });
    
    await newUser.save();
    res.status(201).json({ message: 'Tạo tài khoản thành công! Khởi nghiệp với 1000 Kim Cương nhé!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký!' });
  }
});

// ==========================================
// API ĐĂNG NHẬP
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm xem có tài khoản này trong kho không?
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại!' });
    }

    // 2. So sánh mật khẩu người dùng gõ vào với mật khẩu đã mã hóa trong kho
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác!' });
    }

    // 3. Đăng nhập thành công -> Trả thông tin người chơi về cho Frontend (Nhưng giấu mật khẩu đi)
    const userData = {
      id: user._id,
      username: user.username,
      level: user.level,
      diamonds: user.diamonds,
      gold: user.gold
    };

    res.status(200).json({ message: 'Đăng nhập thành công!', user: userData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập!' });
  }
});