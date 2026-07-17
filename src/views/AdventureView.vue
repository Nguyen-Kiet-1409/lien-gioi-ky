<script setup>
import { ref, computed } from 'vue'

const chapterName = ref("Chương 1: Khu Rừng Khởi Nguyên")

// 1. Thêm tọa độ (x, y) % cho từng ải để tạo hình ziczac/thiên vân
const stages = ref([
  { id: 1, name: 'Cửa Rừng', status: 'cleared', stars: 3, cost: 5, missions: ['Hoàn thành ải', 'Không thẻ bài chết', 'Thắng trong 5 hiệp'], x: 15, y: 20 },
  { id: 2, name: 'Đường Mòn', status: 'cleared', stars: 2, cost: 5, missions: ['Hoàn thành ải', 'Máu trên 50%', 'Không dùng thẻ phép'], x: 35, y: 15 },
  { id: 3, name: 'Suối Tiên', status: 'cleared', stars: 3, cost: 5, missions: ['Hoàn thành ải', 'Tiêu diệt 3 quái', 'Thắng trong 4 hiệp'], x: 55, y: 25 },
  { id: 4, name: 'Bẫy Rập', status: 'current', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Chỉ dùng thẻ Nước', 'Bảo vệ NPC'], x: 75, y: 15 },
  { id: 5, name: 'Trại Goblin', status: 'locked', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Không ai ngã xuống', 'Thắng trong 3 hiệp'], x: 85, y: 40 },
  { id: 6, name: 'Hang Động', status: 'locked', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Dùng kỹ năng 5 lần', 'Giữ HP > 80%'], x: 70, y: 60 },
  { id: 7, name: 'Vách Đá', status: 'locked', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Hạ gục Boss', 'Không thẻ bài chết'], x: 85, y: 80 },
  { id: 8, name: 'Đầm Lầy', status: 'locked', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Không bị dính Độc', 'Thắng trong 5 hiệp'], x: 55, y: 75 },
  { id: 9, name: 'Tế Đàn', status: 'locked', stars: 0, cost: 5, missions: ['Hoàn thành ải', 'Dùng thẻ UR', 'Thắng ngay hiệp 1'], x: 35, y: 85 },
  { id: 10, name: 'Boss Rừng', status: 'locked', stars: 0, cost: 10, missions: ['Hoàn thành ải', 'Đánh bại Boss Rừng', 'Tất cả thẻ bài còn sống'], x: 15, y: 70 },
])

const totalStars = computed(() => {
  return stages.value.reduce((sum, stage) => sum + stage.stars, 0)
})

// 2. Tạo đường kẻ nối các tọa độ ải (SVG path)
const linePoints = computed(() => {
  return stages.value.map(s => `${s.x},${s.y}`).join(' ')
})

const selectedStage = ref(null)

const openStage = (stage) => {
  if (stage.status !== 'locked') {
    selectedStage.value = stage
  }
}

const closeStage = () => {
  selectedStage.value = null
}

const enterBattle = () => {
  alert(`Đang tải ải ${selectedStage.value.name}... Sắp vào đánh rồi! ⚔️`)
  closeStage()
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
.chapter-header {
  background: #1a1a1f;
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid #3a3a45;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-title {
  margin: 0;
  color: #fff;
  font-size: 20px;
}

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