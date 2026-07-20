const mongoose = require('mongoose');

// Tạo bản vẽ (Schema) cho Tài khoản Người chơi
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Tên đăng nhập (Không được trùng)
  password: { type: String, required: true },               // Mật khẩu (Sau này sẽ mã hóa)
  
  // Tài nguyên
  level: { type: Number, default: 1 },
  stamina: { type: Number, default: 50 },
  gold: { type: Number, default: 1500 },
  diamonds: { type: Number, default: 1000 }, // Tặng 1000 KC làm vốn khởi nghiệp!
  maxCapacity: { type: Number, default: 50 },

  //Kỷ lục ải cao nhất đã vượt qua
  highestStageCleared: { type: Number, default: 0 },
  
  // Kho nhân vật (Lưu danh sách thẻ bài user đang sở hữu)
  inventory: [
    {
      // Liên kết tới ID của thẻ bài gốc trong bảng Card
      cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }, 
      level: { type: Number, default: 1 }, // Cấp độ hiện tại của thẻ này
      
      // Trang bị hiện tại
      equip: {
        weapon: { level: { type: Number, default: 0 } },
        armor: { level: { type: Number, default: 0 } },
        pants: { level: { type: Number, default: 0 } },
        shoes: { level: { type: Number, default: 0 } }
      }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);