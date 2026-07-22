const mongoose = require('mongoose');

// Tạo bản vẽ (Schema) cho Thẻ Bài
const cardSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Tên nhân vật (Bắt buộc)
  image: { type: String, default: '' },
  rarity: { type: String, required: true },        // Độ hiếm (R, SR, SSR, UR)
  color: { type: String, default: '#bdc3c7' },     // Mã màu hiển thị
  element: { type: String, default: 'Lửa' },       // Hệ (Lửa, Nước, Băng...)
  role: { type: String, default: 'Đấu Sĩ' },       // Vai trò (Đấu Sĩ, Xạ Thủ...)                         // Hệ/Loại (Đấu Sĩ, Hỗ Trợ...)
  stars: { type: Number, default: 1 },             // Số sao mặc định
  lore: { type: String },                          // Tiểu sử/Cốt truyện
  
  // Chỉ số cơ bản
  stats: {
    hp: { type: Number, default: 1000 },
    atk: { type: Number, default: 100 },
    spd: { type: Number, default: 50 }
  },
  
  // Bộ 3 kỹ năng
  skills: {
    normal: { 
      name: String, desc: String, 
      effectType: { type: String, default: 'damage' }, 
      effectValue: { type: Number, default: 100 }, // Tính theo % ATK
      target: { type: String, default: 'enemy_single' } 
    },
    active: { 
      name: String, desc: String, 
      effectType: { type: String, default: 'damage' }, 
      effectValue: { type: Number, default: 150 }, 
      target: { type: String, default: 'enemy_single' } 
    },
    ultimate: { 
      name: String, desc: String, 
      effectType: { type: String, default: 'damage' }, 
      effectValue: { type: Number, default: 250 }, 
      target: { type: String, default: 'enemy_all' } 
    }
  }
});

// Xuất ra thành một Model tên là 'Card' để dùng ở các file khác
module.exports = mongoose.model('Card', cardSchema);