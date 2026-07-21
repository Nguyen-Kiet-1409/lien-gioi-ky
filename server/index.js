const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Card = require('./models/Card');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Banner = require('./models/Banner');
const Monster = require('./models/Monster');
const Chapter = require('./models/Chapter');

const app = express();

// Middleware
app.use(cors());

// Mở rộng giới hạn nhận dữ liệu lên 10 Megabyte (10mb)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Thêm dòng này để hỗ trợ các form dữ liệu khác

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

// ==========================================
// API LẤY DANH SÁCH BANNER (Cho Game)
// ==========================================
app.get('/api/banners', async (req, res) => {
  try {
    // Lấy Banner và nạp toàn bộ thông tin thẻ bài mà Admin đã nhặt vào
    const banners = await Banner.find().populate('featuredCards');
    
    const formattedBanners = banners.map(banner => {
      return {
        id: banner.bannerId,
        title: banner.title,
        description: banner.description,
        image: banner.image,
        pool: banner.featuredCards // Kho bài là những gì Admin tự tay chọn
      };
    });

    res.status(200).json(formattedBanners);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải Banner!' });
  }
});

// ==========================================
// API LẤY DANH SÁCH THẺ BÀI (Cho Admin chọn vào Banner)
// ==========================================
app.get('/api/cards/all', async (req, res) => {
  try {
    const allCards = await Card.find(); 
    res.status(200).json(allCards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách thẻ!' });
  }
});

// ==========================================
// API THÊM BANNER MỚI (DÀNH CHO ADMIN)
// ==========================================
app.post('/api/banners', async (req, res) => {
  try {
    const { bannerId, title, description, image, isLimited, featuredCards } = req.body;
    
    // 1. Kiểm tra xem mã Banner có bị trùng không
    const existingBanner = await Banner.findOne({ bannerId });
    if (existingBanner) {
      return res.status(400).json({ message: 'Mã Banner này đã tồn tại!' });
    }

    // 2. Lưu Banner mới vào Database
    const newBanner = new Banner({
      bannerId,
      title,
      description,
      image,
      isLimited,
      featuredCards
    });

    await newBanner.save();
    res.status(201).json({ message: '🎉 Đã xuất bản Banner thành công!' });
  } catch (error) {
    console.error('Lỗi khi tạo Banner:', error);
    res.status(500).json({ message: 'Lỗi server không thể lưu Banner!' });
  }
});

// ==========================================
// API CẬP NHẬT THẺ BÀI (SỬA NHÂN VẬT)
// ==========================================
app.put('/api/cards/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    const updateData = req.body;

    // Tìm thẻ bài theo ID và cập nhật dữ liệu mới (thông số {new: true} để trả về data sau khi sửa)
    const updatedCard = await Card.findByIdAndUpdate(cardId, updateData, { new: true });

    if (!updatedCard) {
      return res.status(404).json({ message: 'Không tìm thấy thẻ bài để sửa!' });
    }

    res.status(200).json({ message: 'Cập nhật thẻ bài thành công!', card: updatedCard });
  } catch (error) {
    console.error('Lỗi khi cập nhật thẻ:', error);
    res.status(500).json({ message: 'Lỗi server không thể cập nhật!' });
  }
});

// ==========================================
// API CẤT BÀI VÀO TÚI ĐỒ (Sau khi Gacha xong)
// ==========================================
app.post('/api/user/save-gacha', async (req, res) => {
  try {
    const { userId, newCardIds } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });

    // Đổi chữ "card" thành "cardId" cho khớp với Schema của bạn
    const itemsToAdd = newCardIds.map(id => ({
      cardId: id, 
      level: 1,
      // (Không cần gửi equip vì trong Schema bạn đã set default là 0 rồi)
    }));

    user.inventory.push(...itemsToAdd);
    await user.save();

    res.status(200).json({ message: 'Đã cất bài vào túi đồ an toàn!' });
  } catch (error) {
    console.error('Lỗi khi cất bài:', error);
    res.status(500).json({ message: 'Lỗi server khi lưu bài!' });
  }
});

// ==========================================
// API LẤY TÚI ĐỒ ĐỂ XEM (Vào Kho Nhân Vật)
// ==========================================
app.get('/api/user/:id/inventory', async (req, res) => {
  try {
    // Sửa '.populate("inventory.card")' thành '.populate("inventory.cardId")'
    const user = await User.findById(req.params.id).populate('inventory.cardId');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user!' });

    res.status(200).json(user.inventory);
  } catch (error) {
    console.error('Lỗi khi tải túi đồ:', error);
    res.status(500).json({ message: 'Lỗi server khi tải túi đồ!' });
  }
});

// ==========================================
// API NÂNG CẤP THẺ BÀI (LEVEL UP)
// ==========================================
app.post('/api/user/upgrade-card', async (req, res) => {
  try {
    const { userId, inventoryId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });

    // Lấy thẻ bài cụ thể trong túi đồ dựa trên ID của túi
    const item = user.inventory.id(inventoryId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy thẻ này!' });

    // Kiểm tra giới hạn cấp độ
    if (item.level >= 50) {
      return res.status(400).json({ message: 'Thẻ đã đạt cấp độ tối đa (Lv.50)!' });
    }

    // Công thức tính tiền: Cấp hiện tại x 100 Vàng
    const cost = item.level * 100;
    
    // Kiểm tra túi tiền
    if (user.gold < cost) {
      return res.status(400).json({ message: `Không đủ Vàng! Cần ${cost} Vàng.` });
    }

    // Trừ Vàng và thăng cấp
    user.gold -= cost;
    item.level += 1;

    await user.save();

    res.status(200).json({ 
      message: 'Nâng cấp thành công!', 
      newLevel: item.level, 
      newGold: user.gold 
    });
  } catch (error) {
    console.error('Lỗi khi nâng cấp:', error);
    res.status(500).json({ message: 'Lỗi server khi nâng cấp!' });
  }
});

// ==========================================
// API LƯU KẾT QUẢ CHIẾN THẮNG
// ==========================================
app.post('/api/user/win-battle', async (req, res) => {
  try {
    const { userId, stageId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    let message = 'Chiến thắng!';
    let rewardGold = 150; // Thắng ải nào cũng được 150 Vàng

    // Nếu đây là ải mới nhất người chơi vừa vượt qua -> Cập nhật kỷ lục và thưởng đậm hơn
    if (stageId > user.highestStageCleared) {
      user.highestStageCleared = stageId;
      rewardGold = 500; // Thưởng lần đầu qua ải
      message = 'Vượt ải mới thành công!';
    }

    user.gold += rewardGold;
    await user.save();

    res.status(200).json({ 
      message, 
      highestStageCleared: user.highestStageCleared,
      newGold: user.gold,
      rewardGold
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lưu kết quả' });
  }
});

// ==========================================
// API QUẢN LÝ QUÁI VẬT (ADMIN)
// ==========================================

// 1. Lấy danh sách toàn bộ quái vật
app.get('/api/monsters', async (req, res) => {
  try {
    const monsters = await Monster.find().sort({ isBoss: 1, createdAt: -1 });
    res.status(200).json(monsters);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách quái vật' });
  }
});

// 2. Thêm quái vật mới
app.post('/api/monsters', async (req, res) => {
  try {
    const newMonster = new Monster(req.body);
    await newMonster.save();
    res.status(201).json({ message: 'Đã tạo quái vật thành công!', monster: newMonster });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo quái vật', error });
  }
});

// 3. Cập nhật thông tin quái vật
app.put('/api/monsters/:id', async (req, res) => {
  try {
    const updatedMonster = await Monster.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Trả về data mới sau khi update
    );
    if (!updatedMonster) return res.status(404).json({ message: 'Không tìm thấy quái vật!' });
    res.status(200).json({ message: 'Cập nhật thành công!', monster: updatedMonster });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật quái vật' });
  }
});

// 4. Xóa quái vật
app.delete('/api/monsters/:id', async (req, res) => {
  try {
    const deletedMonster = await Monster.findByIdAndDelete(req.params.id);
    if (!deletedMonster) return res.status(404).json({ message: 'Không tìm thấy quái vật!' });
    res.status(200).json({ message: 'Đã xóa quái vật khỏi hệ thống!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa quái vật' });
  }
});

// ==========================================
// API QUẢN LÝ CHƯƠNG & ẢI (ADMIN)
// ==========================================

// 1. Lấy danh sách toàn bộ Chương (Có populate thông tin Boss)
app.get('/api/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find()
    .populate('bossId')
    .populate('stages.monsters') // Tự động móc nối data quái cho từng ải
    .sort({ chapterNumber: 1 });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách chương' });
  }
});

// 2. Thêm Chương mới
app.post('/api/chapters', async (req, res) => {
  try {
    const newChapter = new Chapter(req.body);
    await newChapter.save();
    res.status(201).json({ message: 'Đã tạo Chương mới thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo Chương (Có thể trùng Số Chương)' });
  }
});

// 3. Sửa Chương
app.put('/api/chapters/:id', async (req, res) => {
  try {
    await Chapter.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật Chương thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật Chương' });
  }
});

// 4. Xóa Chương
app.delete('/api/chapters/:id', async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa Chương khỏi hệ thống!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa Chương' });
  }
});