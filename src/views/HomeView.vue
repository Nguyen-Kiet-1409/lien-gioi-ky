<script setup>
import { ref } from 'vue'

// 1. Dữ liệu thẻ bài giả lập (Mock data)
const mockCards = [
  { id: 1, name: 'Chiến Binh Lửa', rarity: 'R', color: '#bdc3c7' },       // Xám
  { id: 2, name: 'Hiệp Sĩ Rừng', rarity: 'SR', color: '#9b59b6' },        // Tím
  { id: 3, name: 'Thánh Nữ Ánh Sáng', rarity: 'SSR', color: '#f1c40f' },  // Vàng Gold
  { id: 4, name: 'Ma Tôn Bóng Tối', rarity: 'UR', color: '#e74c3c' }      // Đỏ rực
]

// 2. Các biến trạng thái
const isShowingResult = ref(false) // Quản lý việc bật/tắt popup
const pulledCards = ref([])        // Chứa các lá bài vừa quay ra

// 3. Hàm xử lý Gacha
const rollGacha = (times) => {
  pulledCards.value = [] // Reset lại mảng bài mỗi lần quay
  
  for (let i = 0; i < times; i++) {
    // Thuật toán bốc bài ngẫu nhiên (tạm thời tỷ lệ bằng nhau)
    const randomIndex = Math.floor(Math.random() * mockCards.length)
    pulledCards.value.push(mockCards[randomIndex])
  }
  
  isShowingResult.value = true // Mở màn hình kết quả lên
}

// 4. Hàm đóng popup
const closeResult = () => {
  isShowingResult.value = false
}
</script>

<template>
  <div class="home-container">
    <h1 class="page-title">Trang Chủ</h1>

    <!-- KHU VỰC BANNER CHIÊU MỘ -->
    <div class="gacha-banner">
      <div class="banner-content">
        <h2>🔥 Chiêu Mộ Anh Hùng 🔥</h2>
        <p>Tỷ lệ xuất hiện Thẻ Bài SSR tăng 300% trong hôm nay!</p>
      </div>

      <div class="summon-actions">
        <button class="summon-btn single" @click="rollGacha(1)">
          <span class="btn-text">Chiêu Mộ x1</span>
          <span class="cost">💎 100</span>
        </button>

        <button class="summon-btn multi" @click="rollGacha(10)">
          <span class="btn-text">Chiêu Mộ x10</span>
          <span class="cost">💎 900</span>
        </button>
      </div>
    </div>

    <!-- MÀN HÌNH KẾT QUẢ GACHA (Chỉ hiện khi isShowingResult = true) -->
    <div class="gacha-overlay" v-if="isShowingResult" @click.self="closeResult">
      <div class="result-container">
        <h2 class="result-title">Kết Quả Chiêu Mộ</h2>
        
        <div class="cards-grid">
          <!-- Render từng lá bài ra, truyền màu sắc và độ trễ animation vào -->
          <div 
            v-for="(card, index) in pulledCards" 
            :key="index"
            class="pulled-card"
            :style="{ 
              borderColor: card.color, 
              boxShadow: `0 0 15px ${card.color}`,
              animationDelay: `${index * 0.15}s` 
            }"
          >
            <div class="card-rarity" :style="{ color: card.color }">{{ card.rarity }}</div>
            <div class="card-name">{{ card.name }}</div>
          </div>
        </div>

        <button class="close-btn" @click="closeResult">Xác Nhận</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tổng thể trang chủ (giữ nguyên) */
.home-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-title { margin: 0; color: #fff; font-size: 24px; }
.gacha-banner {
  background: linear-gradient(135deg, #2c3e50, #8e44ad);
  border-radius: 16px; padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5); border: 2px solid #573b8a;
}
.banner-content { text-align: center; margin-bottom: 35px; }
.banner-content h2 { color: #f1c40f; font-size: 36px; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
.banner-content p { color: #ecf0f1; font-size: 18px; }
.summon-actions { display: flex; gap: 30px; }
.summon-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 15px 35px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.1s ease;
}
.summon-btn:active { transform: translateY(4px); box-shadow: 0 0px 0 transparent !important; }
.btn-text { font-size: 18px; font-weight: bold; }
.summon-btn.single { background-color: #3498db; color: white; box-shadow: 0 6px 0 #2980b9; }
.summon-btn.multi { background-color: #f39c12; color: white; box-shadow: 0 6px 0 #d35400; }
.cost { margin-top: 8px; font-size: 15px; background: rgba(0, 0, 0, 0.4); padding: 4px 12px; border-radius: 20px; }


/* =========================================
   STYLE CHO MÀN HÌNH KẾT QUẢ GACHA 
   ========================================= */

/* Lớp phủ nền đen trong suốt */
.gacha-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Luôn nổi lên trên cùng */
  backdrop-filter: blur(5px); /* Làm mờ cảnh đằng sau */
}

/* Khung chứa kết quả */
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 90%;
  max-width: 800px;
}

.result-title {
  color: #fff;
  font-size: 32px;
  text-shadow: 0 0 10px #f1c40f;
  margin: 0;
}

/* Lưới hiển thị bài quay ra (Hỗ trợ quay x10 rất đẹp) */
.cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

/* Thiết kế từng lá bài */
.pulled-card {
  width: 120px;
  height: 180px;
  background-color: #2c3e50;
  border: 3px solid;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  text-align: center;
  
  /* Cài đặt animation nảy lên */
  opacity: 0; /* Ẩn đi lúc đầu */
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Hiệu ứng nảy (Pop In) */
@keyframes popIn {
  0% { transform: scale(0.1); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.card-rarity {
  font-size: 32px;
  font-weight: 900;
  text-shadow: 0 0 5px currentColor;
  margin-bottom: 10px;
}

.card-name {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* Nút tắt popup */
.close-btn {
  padding: 12px 40px;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover {
  background-color: #fff;
  transform: scale(1.05);
  box-shadow: 0 0 15px white;
}
</style>