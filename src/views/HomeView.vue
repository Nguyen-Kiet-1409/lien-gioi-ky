<script setup>
import { ref, onMounted } from 'vue'

// 1. Biến chứa danh sách Banner lấy từ Database
const banners = ref([])

// 2. Tự động chạy ra Backend lấy Banner khi vừa vào trang
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/banners')
    const data = await response.json()
    
    // Nếu lấy thành công, gán dữ liệu thật vào biến banners để giao diện tự động vẽ ra
    if (response.ok) {
      banners.value = data
    }
  } catch (error) {
    console.error('Lỗi khi tải Banner thật:', error)
  }
})

// ==========================================
// LOGIC GACHA & BẢO HIỂM (Giữ nguyên như cũ)
// ==========================================
const isShowingResult = ref(false)
const pulledCards = ref([])
const pityCounter = ref(0) 

const pullSingleCard = (pool) => {
  pityCounter.value++
  let targetRarity = ''

  if (pityCounter.value >= 80) {
    targetRarity = 'UR'
  } else {
    const rand = Math.floor(Math.random() * 100) + 1 
    if (rand <= 1) {
      targetRarity = 'UR'         // 1%
    } else if (rand <= 11) {
      targetRarity = 'SSR'        // 10%
    } else if (rand <= 46) {
      targetRarity = 'SR'         // 35%
    } else {
      targetRarity = 'R'          // 54%
    }
  }

  // Lọc thẻ trong cái Pool (Kho bài) thật mà Admin đã nhét vào Banner
  let availableCards = pool.filter(card => card.rarity === targetRarity)

  // Nếu rớt rate UR nhưng Banner lại không có tướng UR nào (Banner thường), thì trả về SSR
  if (availableCards.length === 0) {
    availableCards = pool.filter(card => card.rarity === 'SSR')
  }
  
  // Nếu vẫn không có SSR, rớt xuống SR (Tránh lỗi do Admin set thiếu bài)
  if (availableCards.length === 0) {
    availableCards = pool.filter(card => card.rarity === 'SR')
  }

  const finalCard = availableCards[Math.floor(Math.random() * availableCards.length)]

  if (finalCard.rarity === 'UR') {
    pityCounter.value = 0
  }

  return finalCard
}

const rollGacha = async (times, currentPool) => {
  if (!currentPool || currentPool.length === 0) {
    alert('Banner này hiện chưa có thẻ bài nào trong kho!')
    return
  }

  pulledCards.value = [] 
  const pulledIds = [] // Tạo mảng rỗng để gom ID các thẻ trúng thưởng
  
  for (let i = 0; i < times; i++) {
    const card = pullSingleCard(currentPool)
    if(card) {
      pulledCards.value.push(card)
      pulledIds.push(card._id) // Bỏ ID vào mảng gửi đi
    }
  }
  
  isShowingResult.value = true // Vẫn hiện popup khoe bài rực rỡ

  // ==========================================
  // GỬI BÀI VỀ BACKEND ĐỂ LƯU VÀO TÚI ĐỒ
  // ==========================================
  // Giả sử lúc đăng nhập bạn đã lưu thông tin người chơi vào localStorage
  const userData = JSON.parse(localStorage.getItem('user')) 
  
  if (userData && userData.id) {
    try {
      await fetch('http://localhost:5000/api/user/save-gacha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          newCardIds: pulledIds // Gửi 1 lúc 10 ID lên cho lẹ
        })
      })
      console.log('✅ Đã cất bài vào túi!')
    } catch (error) {
      console.error('❌ Lỗi không cất được bài:', error)
    }
  } else {
    console.warn('⚠️ Bạn đang test Gacha khi chưa đăng nhập. Bài sẽ không được lưu!')
  }
}

const closeResult = () => {
  isShowingResult.value = false
}

// Hàm ép màu chuẩn theo độ hiếm (Bỏ qua màu Admin chọn)
const getCardColor = (rarity) => {
  switch(rarity) {
    case 'UR': return '#e74c3c';  // Đỏ rực
    case 'SSR': return '#f1c40f'; // Vàng Gold
    case 'SR': return '#9b59b6';  // Tím
    default: return '#bdc3c7';    // Xám (R)
  }
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

    <!-- MÀN HÌNH KẾT QUẢ GACHA -->
    <div class="gacha-overlay" v-if="isShowingResult" @click.self="closeResult">
      <div class="result-container">
        <h2 class="result-title">Kết Quả Chiêu Mộ</h2>
        
        <div class="cards-grid">
          <div 
            v-for="(card, index) in pulledCards" 
            :key="index"
            class="pulled-card"
            :style="{ 
              borderColor: getCardColor(card.rarity), 
              boxShadow: `0 0 15px ${getCardColor(card.rarity)}`,
              animationDelay: `${index * 0.1}s` 
            }"
          >
            <!-- Lớp hiển thị ảnh nhân vật -->
            <div class="card-image-container">
              <img v-if="card.image" :src="card.image" class="card-img" alt="Card Image">
              <div v-else class="no-image">?</div>
            </div>

            <!-- Lớp hiển thị thông tin đè lên trên ảnh -->
            <div class="card-info">
              <div class="card-rarity" :style="{ color: getCardColor(card.rarity) }">{{ card.rarity }}</div>
              <div class="card-name">{{ card.name }}</div>
            </div>
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
/* Thiết kế từng lá bài khi quay ra */
.pulled-card {
  width: 130px;
  height: 200px;
  background-color: #1a1a1a;
  border: 3px solid;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Đẩy chữ xuống đáy */
  position: relative;
  overflow: hidden; /* Cắt gọn ảnh nếu tràn viền */
  
  opacity: 0; 
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Khu vực chứa ảnh nền thẻ */
.card-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Nằm lớp dưới */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2c3e50;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Phóng to ảnh phủ kín khung, không bị méo */
}

.no-image {
  font-size: 40px;
  color: #555;
  font-weight: bold;
}

/* Khu vực hiển thị tên và độ hiếm đè lên ảnh */
.card-info {
  position: relative;
  z-index: 2; /* Nằm đè lên lớp ảnh */
  width: 100%;
  padding: 15px 5px 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%);
  text-align: center;
  box-sizing: border-box;
}

.card-rarity {
  font-size: 28px;
  font-weight: 900;
  text-shadow: 0 0 8px currentColor, 0 0 2px #000;
  line-height: 1;
  margin-bottom: 5px;
}

.card-name {
  color: white;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 1px 1px 2px black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Nếu tên dài quá thì hiện dấu ... */
}
@keyframes popIn { 0% { transform: scale(0.1); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
.card-rarity { font-size: 32px; font-weight: 900; text-shadow: 0 0 5px currentColor; margin-bottom: 10px; }
.card-name { color: white; font-size: 14px; font-weight: bold; }
.close-btn { padding: 12px 40px; background-color: #ecf0f1; color: #2c3e50; border: none; border-radius: 25px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.close-btn:hover { background-color: #fff; transform: scale(1.05); box-shadow: 0 0 15px white; }
</style>