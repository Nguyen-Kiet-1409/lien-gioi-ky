<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'    

const router = useRouter()

// Dữ liệu động tải từ Server
const chapterName = ref("Đang tải dữ liệu...")
const stages = ref([])
const currentChapterData = ref(null)

// Tọa độ cố định của 10 chòm sao trên bản đồ (Giữ nguyên form dáng thiên vân)
const mapCoordinates = [
  { x: 15, y: 20 }, { x: 35, y: 15 }, { x: 55, y: 25 }, { x: 75, y: 15 }, { x: 85, y: 40 },
  { x: 70, y: 60 }, { x: 85, y: 80 }, { x: 55, y: 75 }, { x: 35, y: 85 }, { x: 15, y: 70 }
]

const totalStars = computed(() => {
  return stages.value.reduce((sum, stage) => sum + stage.stars, 0)
})

const linePoints = computed(() => {
  return stages.value.map(s => `${s.x},${s.y}`).join(' ')
})

const selectedStage = ref(null)

// --- BIẾN CHO TÍNH NĂNG CHỌN ĐỘI HÌNH ---
const inventory = ref([])
const isSelectingTeam = ref(false)
const selectedTeam = ref([]) 
const targetStageForBattle = ref(null) 

const getCardColor = (rarity) => {
  switch(rarity) {
    case 'UR': return '#e74c3c';
    case 'SSR': return '#f1c40f';
    case 'SR': return '#9b59b6';
    default: return '#bdc3c7';
  }
}

// Tải dữ liệu khi vào trang Phiêu Lưu
onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem('currentUser')) || {}
  const highestCleared = userData.highestStageCleared || 0

  // 👉 1. TẢI DỮ LIỆU CHƯƠNG & ẢI TỪ DATABASE
  try {
    const chapterRes = await fetch('http://localhost:5000/api/chapters')
    if (chapterRes.ok) {
      const chapters = await chapterRes.json()
      
      if (chapters.length > 0) {
        // Tạm thời lấy Chương đầu tiên (Sau này có thể làm nút Next Chương)
        currentChapterData.value = chapters[0]
        chapterName.value = `Chương ${currentChapterData.value.chapterNumber}: ${currentChapterData.value.title}`
        
        // Trộn dữ liệu Ải từ DB vào Tọa độ Map
        stages.value = currentChapterData.value.stages.map((stage, index) => {
          let status = 'locked'
          let stars = 0

          // Xử lý mở khóa dựa trên kỷ lục của người chơi
          if (stage.stageId <= highestCleared) {
            status = 'cleared'
            stars = 3 
          } else if (stage.stageId === highestCleared + 1) {
            status = 'current'
          }

          return {
            id: stage.stageId,
            name: stage.name,
            cost: stage.cost,
            status: status,
            stars: stars,
            missions: ['Hoàn thành ải', 'Không thẻ bài chết', 'Thắng trong 5 hiệp'],
            x: mapCoordinates[index].x,
            y: mapCoordinates[index].y,
            // Lưu kèm danh sách quái & boss từ DB để truyền sang trận đánh
            monsters: stage.monsters, 
            boss: index === 9 ? currentChapterData.value.bossId : null 
          }
        })
      }
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu Chương:', error)
    chapterName.value = "Lỗi tải dữ liệu!"
  }

  // 👉 2. TẢI TÚI ĐỒ NHÂN VẬT CỦA NGƯỜI CHƠI
  if (userData && userData.id) {
    try {
      const res = await fetch(`http://localhost:5000/api/user/${userData.id}/inventory`)
      if (res.ok) inventory.value = await res.json()
    } catch (error) {
      console.error('Lỗi tải túi đồ:', error)
    }
  }
})

// Mở popup thông tin ải
const openStage = (stage) => {
  if (stage.status !== 'locked') {
    selectedStage.value = stage
  }
}

const closeStage = () => {
  selectedStage.value = null
}

// Khi bấm "Vào Chiến Lập Tức" -> Chuyển sang màn hình chọn tướng
const enterBattle = () => {
  targetStageForBattle.value = selectedStage.value
  selectedStage.value = null 
  isSelectingTeam.value = true 
}

const toggleCardSelection = (item) => {
  const index = selectedTeam.value.findIndex(card => card._id === item._id)
  if (index > -1) {
    selectedTeam.value.splice(index, 1)
  } else {
    if (selectedTeam.value.length < 3) {
      selectedTeam.value.push(item)
    } else {
      alert('Đội hình đã đầy! Tối đa chỉ được mang 3 Tướng.')
    }
  }
}

// Xác nhận xuất chiến
const confirmStartBattle = () => {
  if (selectedTeam.value.length === 0) {
    alert('Vui lòng chọn ít nhất 1 Tướng để xuất chiến!')
    return
  }
  
  // 👉 Nâng cấp: Đóng gói toàn bộ thông tin Quái & Boss gửi sang BattleView
  localStorage.setItem('battleData', JSON.stringify({
    team: selectedTeam.value,
    stage: targetStageForBattle.value
  }))

  router.push('/battle')
}

const cancelTeamSelection = () => {
  isSelectingTeam.value = false
  selectedTeam.value = []
  targetStageForBattle.value = null
}
</script>

<template>
  <div class="adventure-container">
    <!-- Header gọn gàng -->
    <div class="chapter-header">
      <h2 class="chapter-title">{{ chapterName }}</h2>
      
      <div class="rewards-compact">
        <div class="star-count">Đã thu thập: <span>{{ totalStars }}/30 ⭐</span></div>
        <div class="chest-mini" :class="{ 'claimed': totalStars >= 10 }">🎁 10⭐</div>
        <div class="chest-mini" :class="{ 'claimed': totalStars >= 20 }">🎁 20⭐</div>
        <div class="chest-mini" :class="{ 'claimed': totalStars >= 30 }">💎 30⭐</div>
      </div>
    </div>

    <!-- Map Chòm Sao (Constellation) -->
    <div class="map-area">
      <!-- Đường vẽ thiên vân đứt nét phía sau -->
      <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline 
          :points="linePoints" 
          fill="none" 
          stroke="#444" 
          stroke-dasharray="2,2" 
          vector-effect="non-scaling-stroke" 
        />
      </svg>

      <!-- Các chấm sao (Node) -->
      <div 
        v-for="stage in stages" 
        :key="stage.id" 
        class="dot-node"
        :class="stage.status"
        :style="{ left: stage.x + '%', top: stage.y + '%' }"
        @click="openStage(stage)"
      >
        <div class="dot-circle"></div>
        <div class="dot-info">
          <div class="dot-name">{{ stage.id }}. {{ stage.name }}</div>
          <div class="dot-stars" v-if="stage.status !== 'locked'">
            <span v-for="i in 3" :key="i" class="star" :class="{ 'active': i <= stage.stars }">★</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup Chi Tiết Ải (Giữ nguyên logic cũ) -->
    <div class="stage-overlay" v-if="selectedStage" @click.self="closeStage">
      <div class="stage-modal">
        <h2>Ải {{ selectedStage.id }}: {{ selectedStage.name }}</h2>
        <div class="missions-box">
          <h3>Mục Tiêu Thử Thách (Để nhận 3⭐):</h3>
          <ul>
            <li v-for="(mission, index) in selectedStage.missions" :key="index">
              <span class="check">{{ selectedStage.stars > index ? '✅' : '⬜' }}</span> 
              {{ mission }}
            </li>
          </ul>
        </div>
        <div class="stamina-cost">Tiêu hao: <span>⚡ {{ selectedStage.cost }}</span></div>
        <div class="modal-actions">
          <button class="btn cancel" @click="closeStage">Hủy</button>
          <button class="btn battle" @click="enterBattle">Vào Chiến Lập Tức</button>
        </div>
      </div>

      <!-- TÍNH NĂNG MỚI: POPUP CHỌN ĐỘI HÌNH TRƯỚC KHI ĐÁNH -->
      <div class="stage-overlay" v-if="isSelectingTeam" @click.self="cancelTeamSelection">
        <div class="team-modal">
          <h2 style="color: #f1c40f; text-align: center; margin-top: 0;">Chuẩn Bị Đội Hình</h2>
          <p style="text-align: center; color: #aaa; margin-bottom: 20px;">Ải: {{ targetStageForBattle?.name }} | Đã chọn: {{ selectedTeam.length }}/3</p>
          
          <!-- 3 Ô chứa tướng đã chọn -->
          <div class="team-slots">
            <div 
              v-for="i in 3" :key="i" 
              class="team-slot" 
              @click="selectedTeam[i-1] ? toggleCardSelection(selectedTeam[i-1]) : null"
            >
              <!-- Nếu ô đó có Tướng -->
              <template v-if="selectedTeam[i-1]">
                <img v-if="selectedTeam[i-1].cardId?.image" :src="selectedTeam[i-1].cardId?.image" class="slot-img">
                <div class="slot-remove-badge">✖</div>
              </template>
              <!-- Nếu ô trống -->
              <span v-else class="empty-icon">+</span>
            </div>
          </div>

          <h3 style="border-bottom: 1px solid #444; padding-bottom: 5px; margin-top: 20px;">Kho Nhân Vật</h3>
          
          <!-- Lưới Chọn Tướng -->
          <div class="mini-inventory">
            <div 
              v-for="item in inventory" 
              :key="item._id"
              class="mini-card"
              :class="{ 'is-selected': selectedTeam.find(c => c._id === item._id) }"
              :style="{ borderColor: getCardColor(item.cardId?.rarity) }"
              @click="toggleCardSelection(item)"
            >
              <div class="mini-level">Lv.{{ item.level }}</div>
              <img v-if="item.cardId?.image" :src="item.cardId?.image" class="mini-img">
              <div v-else class="mini-no-image">🧙‍♂️</div>
              
              <!-- Lớp phủ khi bị chọn -->
              <div v-if="selectedTeam.find(c => c._id === item._id)" class="selected-overlay">
                <span>Đã Chọn</span>
              </div>
            </div>
            <div v-if="inventory.length === 0" style="color: #aaa; text-align: center; width: 100%;">Túi đồ trống không!</div>
          </div>

          <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn cancel" @click="cancelTeamSelection">Trở lại</button>
            <button class="btn battle" @click="confirmStartBattle" :disabled="selectedTeam.length === 0">
              Xuất Chiến ⚔️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adventure-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Đảm bảo không vượt quá chiều cao màn hình */
  overflow: hidden; 
  gap: 15px;
}

/* --- HEADER GỌN GÀNG --- */
/* --- FIX LỖI HEADER BỊ DỒN CHỮ --- */
.chapter-header {
  background: #1a1a1f;
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid #3a3a45;
  display: flex;
  flex-wrap: wrap; /* Cho phép rớt dòng nếu thiếu chỗ */
  justify-content: space-between;
  align-items: center;
  gap: 15px; /* Giữ khoảng cách khi rớt dòng */
}

.chapter-title {
  margin: 0;
  color: #fff;
  font-size: 20px;
  white-space: nowrap; /* Ép không cho chữ tự xuống dòng chẻ nhỏ ra */
}

/* --- GIAO DIỆN CHỌN ĐỘI HÌNH --- */
.team-modal {
  background: #1e1e24;
  border: 2px solid #f1c40f;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.9);
}

.team-slots {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.team-slot {
  width: 80px;
  height: 80px;
  border: 2px dashed #555;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: 0.2s;
}

.team-slot:hover { border-color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
.slot-img { width: 100%; height: 100%; object-fit: cover; }
.empty-icon { font-size: 30px; color: #555; font-weight: bold; }
.slot-remove-badge {
  position: absolute; top: 0; right: 0; background: rgba(231, 76, 60, 0.9);
  color: white; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; font-size: 10px; font-weight: bold; border-bottom-left-radius: 8px;
}

.mini-inventory {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.mini-card {
  min-width: 70px; width: 70px; height: 90px;
  border: 2px solid; border-radius: 8px; background: #222;
  position: relative; cursor: pointer; overflow: hidden;
  transition: transform 0.1s;
}
.mini-card:active { transform: scale(0.95); }
.mini-level { position: absolute; top: 2px; left: 2px; font-size: 9px; background: rgba(0,0,0,0.8); padding: 1px 4px; border-radius: 4px; z-index: 2; }
.mini-img { width: 100%; height: 100%; object-fit: cover; }
.mini-no-image { display:flex; justify-content:center; align-items:center; height:100%; font-size:24px; }

.selected-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 3;
}
.selected-overlay span { background: #e74c3c; font-size: 10px; padding: 2px 5px; border-radius: 4px; font-weight: bold; }

.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

.rewards-compact {
  display: flex;
  align-items: center;
  gap: 15px;
}

.star-count {
  color: #ccc;
  font-size: 14px;
  margin-right: 10px;
}

.star-count span {
  color: #f1c40f;
  font-weight: bold;
}

.chest-mini {
  background: rgba(0,0,0,0.5);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: #aaa;
  border: 1px solid #333;
  opacity: 0.5;
}

.chest-mini.claimed {
  opacity: 1;
  border-color: #f1c40f;
  color: #f1c40f;
  box-shadow: 0 0 8px rgba(241, 196, 15, 0.4);
}

/* --- BẢN ĐỒ THIÊN VÂN --- */
.map-area {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  width: 100%;
}

.constellation-lines {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1;
}

.dot-node {
  position: absolute;
  transform: translate(-50%, -50%); /* Căn giữa tâm tọa độ */
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.dot-node:hover:not(.locked) .dot-circle {
  transform: scale(1.3);
}

/* Chấm nhỏ */
.dot-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid;
  transition: transform 0.2s;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.cleared .dot-circle { background: #27ae60; border-color: #2ecc71; }
.current .dot-circle { background: #d35400; border-color: #f1c40f; box-shadow: 0 0 12px #f1c40f; animation: pulse 1.5s infinite; }
.locked .dot-circle { background: #333; border-color: #555; cursor: not-allowed; }

/* Thông tin dưới chấm */
.dot-info {
  position: absolute;
  top: 25px; /* Nằm ngay dưới chấm */
  text-align: center;
  width: 80px; /* Đủ rộng để chữ không rớt dòng nhiều */
  pointer-events: none; /* Không che mất sự kiện click của chấm khác */
}

.dot-name {
  color: #eee;
  font-size: 11px;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
}

.dot-stars {
  font-size: 10px;
  color: #555;
}
.star.active { color: #f1c40f; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(241, 196, 15, 0); }
  100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); }
}

/* --- POPUP --- (Giữ nguyên như cũ, làm gọn padding) */
.stage-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 100; }
.stage-modal { background: #2c3e50; border: 2px solid #34495e; padding: 25px; border-radius: 12px; width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
.stage-modal h2 { margin-top: 0; color: #fff; font-size: 20px; border-bottom: 1px solid #444; padding-bottom: 10px; }
.missions-box { background: #1a252f; padding: 12px; border-radius: 8px; margin: 15px 0; }
.missions-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #f1c40f; }
.missions-box ul { list-style: none; padding: 0; margin: 0; font-size: 13px; }
.missions-box li { margin-bottom: 8px; color: #ecf0f1; display: flex; gap: 8px; }
.stamina-cost { font-size: 14px; color: #ccc; text-align: center; margin-bottom: 15px; }
.stamina-cost span { font-weight: bold; color: #e74c3c; font-size: 16px; }
.modal-actions { display: flex; gap: 10px; }
.btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn.cancel { background: #7f8c8d; color: white; }
.btn.battle { background: #e74c3c; color: white; }
.btn.battle:active { transform: translateY(2px); }
</style>