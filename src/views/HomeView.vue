<script setup>
import { ref } from 'vue'

// 1. Phân loại kho dữ liệu thẻ bài
const standardPool = [
  { id: 1, name: 'Chiến Binh Lửa', rarity: 'R', color: '#bdc3c7' },
  { id: 2, name: 'Hiệp Sĩ Rừng', rarity: 'SR', color: '#9b59b6' },
  { id: 3, name: 'Thánh Nữ Ánh Sáng', rarity: 'SSR', color: '#f1c40f' }
]

const limitedPool = [
  ...standardPool,
  { id: 4, name: 'Ma Tôn Bóng Tối', rarity: 'UR', color: '#e74c3c' },
  { id: 5, name: 'Long Thần Băng Giá', rarity: 'UR', color: '#00d2ff' }
]

// 2. Cấu hình danh sách Banner
const banners = ref([
  {
    id: 'limited_01',
    title: '🔥 Hắc Ám Trỗi Dậy 🔥',
    description: 'Sự kiện giới hạn: Tăng mạnh tỷ lệ xuất hiện Ma Tôn Bóng Tối (UR)!',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', 
    pool: limitedPool
  },
  {
    id: 'standard_01',
    title: '🌟 Chiêu Mộ Thường 🌟',
    description: 'Chiêu mộ các anh hùng cơ bản để xây dựng đội hình của bạn.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2068&auto=format&fit=crop',
    pool: standardPool
  }
])

const isShowingResult = ref(false)
const pulledCards = ref([])

// THÊM: Biến đếm Bảo Hiểm (Pity)
const pityCounter = ref(0) 

// HÀM BỐC 1 LÁ BÀI DỰA TRÊN TỶ LỆ
const pullSingleCard = (pool) => {
  // Tăng bộ đếm bảo hiểm lên 1
  pityCounter.value++

  let targetRarity = ''

  // KÍCH HOẠT BẢO HIỂM: Đủ 80 roll thì ép ra UR
  if (pityCounter.value >= 80) {
    targetRarity = 'UR'
  } else {
    // THUẬT TOÁN NHÂN PHẨM: Quay số từ 1 đến 100
    const rand = Math.floor(Math.random() * 100) + 1 

    if (rand <= 1) {
      targetRarity = 'UR'         // 1% (Từ 1)
    } else if (rand <= 11) {
      targetRarity = 'SSR'        // 10% (Từ 2 đến 11)
    } else if (rand <= 46) {
      targetRarity = 'SR'         // 35% (Từ 12 đến 46)
    } else {
      targetRarity = 'R'          // 54% (Từ 47 đến 100)
    }
  }

  // Lọc ra các lá bài khớp với độ hiếm vừa quay được trong Banner hiện tại
  let availableCards = pool.filter(card => card.rarity === targetRarity)

  // LOGIC PHỤ: Nếu quay ra UR nhưng Banner Thường không có UR, thì rớt xuống SSR
  if (availableCards.length === 0) {
    availableCards = pool.filter(card => card.rarity === 'SSR')
  }

  // Chọn ngẫu nhiên 1 lá trong danh sách độ hiếm đó
  const finalCard = availableCards[Math.floor(Math.random() * availableCards.length)]

  // Nếu ra UR (Bất kể là nhờ nhân phẩm hay nhờ bảo hiểm), thì reset bộ đếm về 0
  if (finalCard.rarity === 'UR') {
    pityCounter.value = 0
  }

  return finalCard
}

// 3. Hàm xử lý Gacha chính
const rollGacha = (times, currentPool) => {
  pulledCards.value = [] 
  
  for (let i = 0; i < times; i++) {
    const card = pullSingleCard(currentPool)
    pulledCards.value.push(card)
  }
  
  isShowingResult.value = true
}

const closeResult = () => {
  isShowingResult.value = false
}
</script>

<template>
  <div class="home-container">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <h1 class="page-title" style="border: none; padding: 0;">Sảnh Chiêu Mộ</h1>
      
      <!-- Giao diện báo số lần bảo hiểm -->
      <div style="background: #2c3e50; padding: 5px 15px; border-radius: 20px; color: #f1c40f; font-weight: bold;">
        Bảo hiểm UR: {{ pityCounter }}/80
      </div>
    </div>

    <div class="banners-list">
      <!-- Dùng v-for để render ra tất cả các Banner đang có -->
      <div class="gacha-banner" v-for="banner in banners" :key="banner.id">
        
        <!-- Ảnh nền Banner (Có fallback ảnh mặc định nếu quên nhập link) -->
        <img 
          :src="banner.image || 'https://via.placeholder.com/800x300/2c3e50/ffffff?text=Banner+Chua+Co+Anh'" 
          class="banner-bg" 
          alt="Banner Cover"
        >

        <!-- Nội dung Banner đè lên trên ảnh -->
        <div class="banner-content">
          <h2>{{ banner.title }}</h2>
          <p>{{ banner.description }}</p>
        </div>

        <div class="summon-actions">
          <!-- Khi bấm, truyền kho bài (banner.pool) của chính Banner đó vào hàm -->
          <button class="summon-btn single" @click="rollGacha(1, banner.pool)">
            <span class="btn-text">Chiêu Mộ x1</span>
            <span class="cost">💎 100</span>
          </button>

          <button class="summon-btn multi" @click="rollGacha(10, banner.pool)">
            <span class="btn-text">Chiêu Mộ x10</span>
            <span class="cost">💎 900</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MÀN HÌNH KẾT QUẢ GACHA (Giữ nguyên như cũ) -->
    <div class="gacha-overlay" v-if="isShowingResult" @click.self="closeResult">
      <div class="result-container">
        <h2 class="result-title">Kết Quả Chiêu Mộ</h2>
        
        <div class="cards-grid">
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
.home-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-title { margin: 0; color: #fff; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }

/* Khu vực cuộn chứa các Banner */
.banners-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* KHUNG BANNER MỚI */
.gacha-banner {
  position: relative; /* Để ảnh nền được định vị tuyệt đối bên trong khung này */
  border-radius: 16px; 
  padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5); 
  border: 2px solid #573b8a;
  overflow: hidden; /* Cắt phần ảnh thừa bo góc */
}

/* Ảnh nền Banner */
.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ảnh tự động scale cho vừa khung */
  z-index: 1; /* Nằm dưới cùng */
  opacity: 0.4; /* Làm mờ ảnh để chữ nổi bật lên */
  transition: transform 0.5s ease;
}

.gacha-banner:hover .banner-bg {
  transform: scale(1.05); /* Hiệu ứng zoom nhẹ ảnh khi rê chuột vào */
  opacity: 0.5;
}

/* Đưa chữ và nút lên lớp trên cùng (z-index: 2) */
.banner-content, .summon-actions {
  position: relative;
  z-index: 2;
}

.banner-content { text-align: center; margin-bottom: 35px; }
.banner-content h2 { color: #f1c40f; font-size: 36px; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,1); }
.banner-content p { color: #fff; font-size: 18px; text-shadow: 1px 1px 3px rgba(0,0,0,1); font-weight: bold; }
.summon-actions { display: flex; gap: 30px; }
.summon-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 15px 35px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.1s ease;
}
.summon-btn:active { transform: translateY(4px); box-shadow: 0 0px 0 transparent !important; }
.btn-text { font-size: 18px; font-weight: bold; }
.summon-btn.single { background-color: #3498db; color: white; box-shadow: 0 6px 0 #2980b9; }
.summon-btn.multi { background-color: #f39c12; color: white; box-shadow: 0 6px 0 #d35400; }
.cost { margin-top: 8px; font-size: 15px; background: rgba(0, 0, 0, 0.6); padding: 4px 12px; border-radius: 20px; }

/* STYLE CHO MÀN HÌNH KẾT QUẢ GACHA (Giữ nguyên) */
.gacha-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.85); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
.result-container { display: flex; flex-direction: column; align-items: center; gap: 30px; width: 90%; max-width: 800px; }
.result-title { color: #fff; font-size: 32px; text-shadow: 0 0 10px #f1c40f; margin: 0; }
.cards-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; }
.pulled-card { width: 120px; height: 180px; background-color: #2c3e50; border: 3px solid; border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; text-align: center; opacity: 0; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes popIn { 0% { transform: scale(0.1); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
.card-rarity { font-size: 32px; font-weight: 900; text-shadow: 0 0 5px currentColor; margin-bottom: 10px; }
.card-name { color: white; font-size: 14px; font-weight: bold; }
.close-btn { padding: 12px 40px; background-color: #ecf0f1; color: #2c3e50; border: none; border-radius: 25px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.close-btn:hover { background-color: #fff; transform: scale(1.05); box-shadow: 0 0 15px white; }
</style>