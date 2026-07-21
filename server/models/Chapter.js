const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true, unique: true }, // Chương 1, 2, 3...
  title: { type: String, required: true }, // Tên chương (VD: Khu Rừng Khởi Nguyên)
  stages: [
    {
      stageId: Number, // Từ 1 đến 10
      name: String,    // Tên của ải đó
      cost: Number,    // Thể lực tiêu hao
      monsters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Monster' }]
    }
  ],
  bossId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' }, // Boss của ải 10
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chapter', chapterSchema);