const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  bannerId: { type: String, required: true, unique: true }, // Tên mã hóa (VD: standard_01, limited_01)
  title: { type: String, required: true },                  // Tên hiển thị (VD: Hắc Ám Trỗi Dậy)
  description: { type: String },                            // Mô tả sự kiện
  image: { type: String },                                  // Link ảnh nền Banner
  isLimited: { type: Boolean, default: false },             // Đánh dấu xem đây có phải banner giới hạn không
  
  // Danh sách các nhân vật Độc Quyền / Tăng tỷ lệ (UR) của riêng banner này
  featuredCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }] 
});

module.exports = mongoose.model('Banner', bannerSchema);