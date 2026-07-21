const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: '👺' }, // Icon đại diện (👺, 👹, 🐺, 🐉...)
  hp: { type: Number, default: 2000 },
  atk: { type: Number, default: 150 },
  spd: { type: Number, default: 40 },
  isBoss: { type: Boolean, default: false }, // Đánh dấu đây là Boss hay Quái thường
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Monster', monsterSchema);