<script setup>
const selectMode = (modeName) => {
  alert(`Đang khởi tạo ${modeName}... Chuẩn bị vào chiến! 🚀`)
}
</script>

<template>
  <div class="modes-container">
    <div class="header-section">
      <h1 class="title">Chế Độ Chơi</h1>
      <p class="subtitle">Rèn luyện kỹ năng & thử nghiệm chiến thuật</p>
    </div>

    <!-- Đổi thành dạng List xếp dọc -->
    <div class="modes-list">
      
      <!-- 1. Chế độ Test DPS -->
      <div class="mode-card dps-mode" @click="selectMode('Phòng Tập DPS')">
        <div class="mode-icon">🎯</div>
        <div class="mode-info">
          <h2>Test DPS</h2>
          <p>Đo lường lượng sát thương tối đa trên cọc gỗ.</p>
        </div>
        <button class="enter-btn">Tập Luyện</button>
      </div>

      <!-- 2. Chế độ Đấu Giải -->
      <div class="mode-card tournament-mode" @click="selectMode('Đấu Giải Công Bằng')">
        <div class="mode-icon">🏆</div>
        <div class="mode-info">
          <h2>Đấu Giải</h2>
          <p>Tranh tài công bằng bằng đội hình hệ thống cung cấp.</p>
        </div>
        <button class="enter-btn">Tham Gia</button>
      </div>

      <!-- 3. Chế độ Solo Đội -->
      <div class="mode-card solo-mode" @click="selectMode('Mô Phỏng Giao Tranh')">
        <div class="mode-icon">⚖️</div>
        <div class="mode-info">
          <h2>Mô Phỏng</h2>
          <p>Chọn 2 đội hình tự động chiến đấu để phân tích.</p>
        </div>
        <button class="enter-btn">Bắt Đầu</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 20px;
  overflow-y: auto; /* Cho phép cuộn mượt mà nếu màn hình quá nhỏ */
}

.header-section {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  color: #fff;
  font-size: 28px;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subtitle {
  color: #aaa;
  font-size: 14px;
  margin: 0;
}

/* Xếp các thẻ theo chiều dọc */
.modes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Thiết kế lại Thẻ thành dạng ngang (Row) */
.mode-card {
  display: flex;
  align-items: center;
  background: #1e1e24;
  border-radius: 12px;
  padding: 15px 20px;
  cursor: pointer;
  border-left: 6px solid; /* Chuyển màu viền sang mép trái */
  transition: transform 0.2s, background 0.2s;
}

.mode-card:hover {
  transform: translateX(8px); /* Hiệu ứng trượt sang phải */
  background: #25252d;
}

.mode-icon {
  font-size: 36px;
  margin-right: 20px;
  min-width: 45px;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.mode-info {
  flex: 1; /* Chiếm toàn bộ không gian ở giữa */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mode-info h2 {
  color: #fff;
  font-size: 18px;
  margin: 0 0 6px 0;
}

.mode-info p {
  color: #95a5a6;
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}

/* Nút bấm thu gọn nằm bên phải */
.enter-btn {
  margin-left: 15px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  color: white;
  white-space: nowrap; /* Tránh rớt dòng chữ trong nút */
  transition: 0.2s;
}

/* --- TÙY CHỈNH MÀU SẮC CHO TỪNG CHẾ ĐỘ --- */
.dps-mode { border-left-color: #e74c3c; }
.dps-mode .enter-btn { background-color: #c0392b; }
.dps-mode:hover .enter-btn { background-color: #e74c3c; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); }

.tournament-mode { border-left-color: #f1c40f; }
.tournament-mode .enter-btn { background-color: #f39c12; color: #fff; }
.tournament-mode:hover .enter-btn { background-color: #f1c40f; color: #000; box-shadow: 0 4px 10px rgba(241, 196, 15, 0.3); }

.solo-mode { border-left-color: #9b59b6; }
.solo-mode .enter-btn { background-color: #8e44ad; }
.solo-mode:hover .enter-btn { background-color: #9b59b6; box-shadow: 0 4px 10px rgba(155, 89, 182, 0.3); }
</style>