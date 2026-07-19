<script setup>
import { ref, computed, onMounted } from 'vue'

const maxCapacity = ref(50)
const selectedCard = ref(null)
const myCards = ref([]) // Mảng trống, sẽ tự động hút dữ liệu từ Backend
const isLoading = ref(true)

// Hàm ép màu chuẩn theo độ hiếm (Tái sử dụng từ Gacha)
const getCardColor = (rarity) => {
  switch(rarity) {
    case 'UR': return '#e74c3c';  
    case 'SSR': return '#f1c40f'; 
    case 'SR': return '#9b59b6';  
    default: return '#bdc3c7';    
  }
}

// Gọi Backend lấy túi đồ ngay khi vào trang
onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem('currentUser'))
  if (!userData || !userData.id) {
    alert('Vui lòng đăng nhập để xem túi đồ!')
    isLoading.value = false
    return
  }

  try {
    const res = await fetch(`http://localhost:5000/api/user/${userData.id}/inventory`)
    const data = await res.json()
    if (res.ok) {
      myCards.value = data
    }
  } catch (error) {
    console.error('Lỗi tải túi đồ:', error)
  } finally {
    isLoading.value = false
  }
})

// Thuật toán trải lưới: Lấp đầy các ô trống cho đủ maxCapacity
const displayGrid = computed(() => {
  const grid = [...myCards.value]
  while (grid.length < maxCapacity.value) {
    grid.push({ isEmpty: true })
  }
  return grid
})

const expandStorage = () => {
  if (confirm(`Dùng 500 💎 để mở rộng thêm 10 ô?`)) maxCapacity.value += 10
}

const viewCharacter = (card) => {
  if (!card.isEmpty) {
    selectedCard.value = card
  }
}

const closeCharacter = () => {
  selectedCard.value = null
}
</script>

<template>
  <div class="characters-container">
    <div class="inventory-header">
      <div class="inventory-info">
        <h1 class="title">Kho Nhân Vật</h1>
        <div class="capacity-badge" :class="{ 'full': myCards.length >= maxCapacity }">
          Sức chứa: <span>{{ myCards.length }} / {{ maxCapacity }}</span>
        </div>
      </div>
      <button class="expand-btn" @click="expandStorage">➕ Mở Rộng</button>
    </div>

    <!-- Hàng chữ báo đang tải -->
    <div v-if="isLoading" style="color: white; text-align: center; margin-top: 50px;">
      Đang lục tìm túi đồ...
    </div>

    <div v-else class="inventory-grid">
      <!-- Vòng lặp in các thẻ bài -->
      <div v-for="(slot, index) in displayGrid" :key="index" class="slot-wrapper" @click="viewCharacter(slot)">
        
        <!-- Ô CÓ BÀI (Đọc dữ liệu từ slot.cardId) -->
        <div v-if="!slot.isEmpty" class="character-card" :style="{ borderColor: getCardColor(slot.cardId?.rarity), boxShadow: `inset 0 0 10px ${getCardColor(slot.cardId?.rarity)}33` }">
          <div class="card-rarity" :style="{ color: getCardColor(slot.cardId?.rarity) }">{{ slot.cardId?.rarity }}</div>
          
          <div class="card-avatar">
            <img v-if="slot.cardId?.image" :src="slot.cardId?.image" class="mini-avatar" />
            <span v-else>🧙‍♂️</span>
          </div>
          
          <div class="card-name">{{ slot.cardId?.name }}</div>
          <div class="card-level">Lv.{{ slot.level }}</div>
        </div>
        
        <!-- Ô TRỐNG -->
        <div v-else class="empty-slot"></div>
      </div>
    </div>

    <!-- MÀN HÌNH CHI TIẾT NHÂN VẬT -->
    <div class="char-overlay" v-if="selectedCard" @click.self="closeCharacter">
      <div class="char-modal" :style="{ borderTopColor: getCardColor(selectedCard.cardId?.rarity) }">
        <button class="close-btn" @click="closeCharacter">✖</button>
        
        <div class="char-header-info">
          <div class="avatar-box" :style="{ borderColor: getCardColor(selectedCard.cardId?.rarity) }">
            <img v-if="selectedCard.cardId?.image" :src="selectedCard.cardId?.image" class="full-avatar" />
            <span v-else class="avatar-emoji">🧙‍♂️</span>
          </div>
          <div class="basic-info">
            <h2 :style="{ color: getCardColor(selectedCard.cardId?.rarity) }">{{ selectedCard.cardId?.name }}</h2>
            <div class="tags">
              <span class="tag type">{{ selectedCard.cardId?.type || 'Đấu Sĩ' }}</span>
              <span class="tag level">Lv.{{ selectedCard.level }}</span>
            </div>
            <p class="lore">{{ selectedCard.cardId?.lore || 'Nhân vật bí ẩn chưa rõ lai lịch...' }}</p>
          </div>
        </div>

        <!-- CHỈ SỐ CƠ BẢN -->
        <div class="stats-section">
          <div class="stat-box">
            <div class="stat-icon">❤️</div>
            <div class="stat-value">{{ selectedCard.cardId?.stats?.hp || 0 }}</div>
            <div class="stat-label">Máu (HP)</div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">⚔️</div>
            <div class="stat-value">{{ selectedCard.cardId?.stats?.atk || 0 }}</div>
            <div class="stat-label">Tấn Công</div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">{{ selectedCard.cardId?.stats?.spd || 0 }}</div>
            <div class="stat-label">Tốc Độ</div>
          </div>
        </div>

        <!-- Trang Bị (Đọc từ User inventory) -->
        <div class="equip-section">
          <h3>Trang Bị</h3>
          <div class="equip-grid">
            <div class="equip-slot">
              <div class="e-icon">🗡️</div>
              <div class="e-detail">
                <div class="e-type">Vũ Khí</div>
                <div class="e-name">+{{ selectedCard.equip?.weapon?.level || 0 }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">🦺</div>
              <div class="e-detail">
                <div class="e-type">Áo</div>
                <div class="e-name">+{{ selectedCard.equip?.armor?.level || 0 }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">🩳</div>
              <div class="e-detail">
                <div class="e-type">Quần</div>
                <div class="e-name">+{{ selectedCard.equip?.pants?.level || 0 }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">👢</div>
              <div class="e-detail">
                <div class="e-type">Giày</div>
                <div class="e-name">+{{ selectedCard.equip?.shoes?.level || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kỹ Năng (Đọc từ Data thẻ gốc) -->
        <div class="skills-section">
          <h3>Kỹ Năng</h3>
          
          <!-- Đánh Thường -->
          <div class="skill-item normal">
            <div class="s-icon">⚔️</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.cardId?.skills?.normal?.name || 'Đánh thường' }}</span>
                <span class="s-type">Đánh thường</span>
              </div>
              <p>{{ selectedCard.cardId?.skills?.normal?.desc || 'Gây sát thương cơ bản' }}</p>
            </div>
          </div>

          <!-- Kỹ năng kích hoạt -->
          <div class="skill-item active">
            <div class="s-icon">✨</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.cardId?.skills?.active?.name || 'Kỹ năng 1' }}</span>
                <span class="s-type">Kỹ năng</span>
              </div>
              <p>{{ selectedCard.cardId?.skills?.active?.desc || 'Gây hiệu ứng đặc biệt' }}</p>
            </div>
          </div>

          <!-- Tuyệt kỹ -->
          <div class="skill-item ultimate">
            <div class="s-icon">🔥</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.cardId?.skills?.ultimate?.name || 'Tuyệt kỹ' }}</span>
                <span class="s-type">Tuyệt kỹ</span>
              </div>
              <p>{{ selectedCard.cardId?.skills?.ultimate?.desc || 'Sức mạnh tối thượng' }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Toàn bộ CSS cực xịn của bạn được giữ nguyên hoàn toàn */
.characters-container { display: flex; flex-direction: column; height: 100%; gap: 20px; overflow: hidden; }
.inventory-header { background: #1a1a1f; padding: 15px 20px; border-radius: 12px; border: 1px solid #3a3a45; display: flex; justify-content: space-between; align-items: center; }
.inventory-info { display: flex; flex-direction: column; gap: 5px; }
.title { margin: 0; color: #fff; font-size: 22px; }
.capacity-badge { font-size: 14px; color: #ccc; background: rgba(0, 0, 0, 0.4); padding: 4px 10px; border-radius: 20px; display: inline-block; width: fit-content; }
.capacity-badge span { color: #f1c40f; font-weight: bold; }
.capacity-badge.full span { color: #e74c3c; }
.expand-btn { background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.expand-btn:active { transform: translateY(4px); }
.inventory-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 12px; padding: 10px; overflow-y: auto; align-content: start; }
.slot-wrapper { aspect-ratio: 3 / 4; cursor: pointer; }
.empty-slot { width: 100%; height: 100%; background: rgba(255, 255, 255, 0.03); border: 2px dashed #444; border-radius: 8px; }
.character-card { width: 100%; height: 100%; background: #25252d; border: 2px solid; border-radius: 8px; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; }
.card-rarity { position: absolute; top: 4px; left: 6px; font-size: 12px; font-weight: 900; z-index: 10; text-shadow: 1px 1px 2px #000; }
.card-avatar { font-size: 32px; flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; margin-bottom: -15px; }
.mini-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0; } /* Class thêm để ảnh hiển thị chuẩn */
.card-name { color: white; font-size: 11px; font-weight: bold; text-align: center; width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; z-index: 10; }
.card-level { width: 100%; background: rgba(0, 0, 0, 0.6); color: #ccc; font-size: 11px; text-align: center; padding: 3px 0; border-radius: 0 0 6px 6px; z-index: 10; }

/* Modal & Overlay */
.char-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 20px; backdrop-filter: blur(5px); }
.char-modal { background: #1e1e24; width: 100%; max-width: 450px; border-radius: 12px; border-top: 6px solid; max-height: 90vh; overflow-y: auto; position: relative; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
.close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #aaa; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }
.char-header-info { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; }
.avatar-box { width: 90px; height: 90px; background: #2c3e50; border: 3px solid; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 45px; flex-shrink: 0; overflow: hidden; }
.full-avatar { width: 100%; height: 100%; object-fit: cover; } /* Hiển thị ảnh đầy đủ không bị méo */
.basic-info h2 { margin: 0 0 8px 0; font-size: 22px; text-shadow: 1px 1px 2px #000; }
.tags { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tag { font-size: 12px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.tag.type { background: #34495e; color: #fff; }
.tag.stars { color: #f1c40f; letter-spacing: 2px; }
.tag.level { background: #e74c3c; color: #fff; }
.lore { margin: 0; font-size: 13px; color: #bdc3c7; line-height: 1.4; font-style: italic; }
h3 { margin: 0 0 10px 0; font-size: 16px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 5px; }

/* PHẦN CHỈ SỐ */
.stats-section { display: flex; justify-content: space-around; background: #1a1a1f; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; }
.stat-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-icon { font-size: 20px; }
.stat-value { color: #fff; font-size: 16px; font-weight: bold; }
.stat-label { color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }

/* Trang bị & Kỹ năng */
.equip-section { margin-bottom: 20px; background: #1a1a1f; padding: 15px; border-radius: 8px; }
.equip-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.equip-slot { display: flex; flex-direction: column; align-items: center; background: #25252d; padding: 8px 5px; border-radius: 8px; border: 1px solid #333; cursor: pointer; }
.e-icon { font-size: 24px; margin-bottom: 5px; }
.e-type { font-size: 10px; color: #95a5a6; }
.e-name { font-size: 12px; font-weight: bold; color: #f1c40f; }
.skills-section { background: #1a1a1f; padding: 15px; border-radius: 8px; }
.skill-item { display: flex; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333; }
.skill-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.s-icon { width: 45px; height: 45px; background: #2c3e50; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 22px; flex-shrink: 0; border: 1px solid #444; }
.s-info { flex: 1; }
.s-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.s-name { font-weight: bold; color: #fff; font-size: 15px; }
.s-type { font-size: 10px; padding: 2px 6px; border-radius: 4px; color: white; background: #555; }
.active .s-type { background: #2980b9; }
.ultimate .s-type { background: #c0392b; }
.s-info p { margin: 0; font-size: 13px; color: #aaa; line-height: 1.4; }
</style>