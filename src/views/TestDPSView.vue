<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const inventory = ref([])
const selectedCard = ref(null)
const isLoading = ref(true)

// Biến phục vụ chiến đấu
const maxTurns = 5
const currentTurn = ref(1)
const totalDamage = ref(0)
const combatLog = ref([])
const isBattleEnded = ref(false)

// BIẾN ĐIỀU KHIỂN ANIMATION
const isAttacking = ref(false)
const isHit = ref(false)

const getActualAtk = (baseAtk, level, rarity) => {
  if (!baseAtk) return 0
  let growthRate = 0.05
  if (rarity === 'UR') growthRate = 0.15
  else if (rarity === 'SSR') growthRate = 0.10
  else if (rarity === 'SR') growthRate = 0.08
  return Math.floor(baseAtk * (1 + (level - 1) * growthRate))
}

const getCardColor = (rarity) => {
  switch(rarity) {
    case 'UR': return '#e74c3c';
    case 'SSR': return '#f1c40f';
    case 'SR': return '#9b59b6';
    default: return '#bdc3c7';
  }
}

onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem('currentUser'))
  if (!userData || !userData.id) {
    alert('Vui lòng đăng nhập!')
    router.push('/login')
    return
  }

  try {
    const res = await fetch(`http://localhost:5000/api/user/${userData.id}/inventory`)
    const data = await res.json()
    if (res.ok) {
      inventory.value = data
    }
  } catch (error) {
    console.error('Lỗi tải túi đồ:', error)
  } finally {
    isLoading.value = false
  }
})

const selectCharacterForTest = (item) => {
  selectedCard.value = item
  currentTurn.value = 1
  totalDamage.value = 0
  combatLog.value = []
  isBattleEnded.value = false
}

// LOGIC ĐÁNH & CHUYỂN ĐỘNG
const useSkill = (skillType) => {
  // Ngăn chặn bấm liên tục khi đang có animation hoặc đã hết game
  if (isBattleEnded.value || isAttacking.value) return

  // 1. Bật cờ lao lên tấn công
  isAttacking.value = true

  // 2. Đợi 200ms để hoạt ảnh lao lên chạm tới cọc gỗ
  setTimeout(() => {
    isHit.value = true // Bật cờ cho cọc gỗ rung & chớp đỏ
    
    // Tính toán sát thương
    const card = selectedCard.value.cardId
    const actualAtk = getActualAtk(card.stats?.atk, selectedCard.value.level, card.rarity)
    
    let multiplier = 1
    let skillName = ''

    if (skillType === 'normal') {
      multiplier = 1.0
      skillName = card.skills?.normal?.name || 'Đánh thường'
    } else if (skillType === 'active') {
      multiplier = 1.5
      skillName = card.skills?.active?.name || 'Kỹ năng'
    } else if (skillType === 'ultimate') {
      multiplier = 2.5
      skillName = card.skills?.ultimate?.name || 'Tuyệt kỹ'
    }

    const variance = (Math.random() * 0.2) - 0.1 
    const finalDamage = Math.floor(actualAtk * multiplier * (1 + variance))

    totalDamage.value += finalDamage
    combatLog.value.unshift(`Lượt ${currentTurn.value}: [${skillName}] gây ${finalDamage} sát thương!`)
  }, 200)

  // 3. Hồi vị trí cũ sau 600ms và kiểm tra kết thúc
  setTimeout(() => {
    isAttacking.value = false
    isHit.value = false
    
    currentTurn.value++
    if (currentTurn.value > maxTurns) {
      isBattleEnded.value = true
      combatLog.value.unshift(`🏁 KẾT THÚC! TỔNG SÁT THƯƠNG: ${totalDamage.value}`)
    }
  }, 600)
}

const cancelTest = () => {
  selectedCard.value = null
}
</script>

<template>
  <div class="test-dps-container">
    <div class="header">
      <button class="back-btn" @click="router.push('/modes')">⬅ Quay lại</button>
      <h1 class="title">🎯 Phòng Tập Test DPS</h1>
      <div></div>
    </div>

    <!-- MÀN HÌNH CHỌN NHÂN VẬT -->
    <div v-if="!selectedCard" class="selection-screen">
      <h2 style="color: #ccc; text-align: center; margin-bottom: 20px;">Vui lòng chọn nhân vật để thử nghiệm:</h2>
      <div v-if="isLoading" style="color: white; text-align: center;">Đang tải kho đồ...</div>
      
      <div v-else class="cards-grid">
        <div 
          v-for="(item, index) in inventory" 
          :key="index"
          class="inventory-card"
          :style="{ borderColor: getCardColor(item.cardId?.rarity) }"
          @click="selectCharacterForTest(item)"
        >
          <div class="level-badge">Lv.{{ item.level }}</div>
          <div class="card-image-container">
            <img v-if="item.cardId?.image" :src="item.cardId?.image" class="card-img">
            <div v-else class="no-image">🧙‍♂️</div>
          </div>
          <div class="card-info">
            <div class="card-rarity" :style="{ color: getCardColor(item.cardId?.rarity) }">{{ item.cardId?.rarity }}</div>
            <div class="card-name">{{ item.cardId?.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- MÀN HÌNH VÕ ĐÀI -->
    <div v-else class="battle-screen">
      <div class="arena">
        <!-- Phe Ta (Thêm class attacking động) -->
        <div class="fighter ally" :class="{ 'attacking': isAttacking }">
          <img v-if="selectedCard.cardId?.image" :src="selectedCard.cardId?.image" class="avatar-full" :style="{ borderColor: getCardColor(selectedCard.cardId?.rarity) }">
          <h3>{{ selectedCard.cardId?.name }}</h3>
          <span class="atk-stat">⚔️ ATK: {{ getActualAtk(selectedCard.cardId?.stats?.atk, selectedCard.level, selectedCard.cardId?.rarity) }}</span>
        </div>

        <div class="vs-badge">VS</div>

        <!-- Phe Địch (Thêm class hit động) -->
        <div class="fighter enemy" :class="{ 'hit': isHit }">
          <div class="dummy-icon">🎯</div>
          <h3>Cọc Gỗ Luyện Tập</h3>
          <span class="hp-stat">❤️ HP: Vô Hạn</span>
        </div>
      </div>

      <!-- Bảng điều khiển -->
      <div class="control-panel">
        <div class="battle-stats">
          <div class="stat-box">Lượt: <span style="color: #f1c40f">{{ Math.min(currentTurn, maxTurns) }} / {{ maxTurns }}</span></div>
          <div class="stat-box">Tổng Sát Thương: <span style="color: #e74c3c; font-size: 24px;">{{ totalDamage }}</span></div>
        </div>

        <div v-if="!isBattleEnded" class="skills-bar">
          <button class="skill-btn normal" :disabled="isAttacking" @click="useSkill('normal')">
            ⚔️ {{ selectedCard.cardId?.skills?.normal?.name || 'Đánh thường' }}
          </button>
          <button class="skill-btn active" :disabled="isAttacking" @click="useSkill('active')">
            ✨ {{ selectedCard.cardId?.skills?.active?.name || 'Kỹ năng' }}
          </button>
          <button class="skill-btn ultimate" :disabled="isAttacking" @click="useSkill('ultimate')">
            🔥 {{ selectedCard.cardId?.skills?.ultimate?.name || 'Tuyệt kỹ' }}
          </button>
        </div>

        <div v-else class="end-actions">
          <button class="action-btn restart" @click="selectCharacterForTest(selectedCard)">🔄 Thử Lại</button>
          <button class="action-btn change" @click="cancelTest">👥 Đổi Tướng</button>
        </div>
      </div>

      <!-- Log chiến đấu -->
      <div class="combat-log">
        <h4 style="margin: 0 0 10px 0; color: #aaa;">Nhật ký sát thương:</h4>
        <div v-for="(log, idx) in combatLog" :key="idx" class="log-line" :class="{ 'highlight': log.includes('KẾT THÚC') }">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   BỐ CỤC TỔNG THỂ & DANH SÁCH TƯỚNG
   ========================================= */
.test-dps-container { display: flex; flex-direction: column; height: 100%; gap: 20px; color: white;}
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px;}
.back-btn { background: #333; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer;}
.back-btn:hover { background: #555; }
.title { margin: 0; color: #f1c40f; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px; overflow-y: auto; max-height: 70vh;}
.inventory-card { aspect-ratio: 2/3; background: #1a1a1a; border: 2px solid; border-radius: 8px; position: relative; cursor: pointer; transition: 0.2s; overflow: hidden; display: flex; flex-direction: column;}
.inventory-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(255,255,255,0.2); }
.level-badge { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.8); padding: 2px 6px; font-size: 10px; border-radius: 10px; z-index: 2;}
.card-image-container { flex: 1; background: #2c3e50; }
.card-img { width: 100%; height: 100%; object-fit: cover; }
.no-image { display:flex; justify-content:center; align-items:center; height:100%; font-size: 40px; }
.card-info { background: #111; padding: 5px; text-align: center; }
.card-rarity { font-size: 12px; font-weight: bold; }
.card-name { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

/* =========================================
   VÕ ĐÀI 2.5D SIÊU THỰC
   ========================================= */
.battle-screen { display: flex; flex-direction: column; gap: 20px; align-items: center; }
.arena { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 60px; 
  background: radial-gradient(ellipse at bottom, #2c3e50 0%, #111 60%, #000 100%); 
  padding: 60px 20px; 
  border-radius: 16px; 
  border: 1px solid #333; 
  width: 100%; 
  max-width: 700px; 
  position: relative;
  overflow: hidden;
  perspective: 1000px;
}
.arena::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 50%;
  background-image: 
    linear-gradient(rgba(46, 204, 113, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 204, 113, 0.2) 1px, transparent 1px);
  background-size: 40px 20px;
  transform: perspective(500px) rotateX(60deg);
  z-index: 0;
}

.fighter { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 10px;
  position: relative;
  z-index: 1;
}
.fighter::after {
  content: '';
  display: block;
  width: 90px;
  height: 15px;
  background: rgba(0,0,0,0.8);
  border-radius: 50%;
  filter: blur(5px);
  margin-top: -10px;
}
.atk-stat, .hp-stat { background: #000; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; border: 1px solid #444; }

/* =========================================
   ANIMATION TRẠNG THÁI NGHỈ (IDLE)
   ========================================= */
.fighter.ally .avatar-full { 
  width: 140px; 
  height: 140px; 
  border-radius: 12px; 
  object-fit: cover; 
  border: 2px solid; 
  box-shadow: -10px 10px 20px rgba(0,0,0,0.6), 0 0 15px currentColor; 
  transform: rotateY(15deg); 
  animation: floatAlly 3s ease-in-out infinite;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); /* Làm mượt lúc thu về */
}
.fighter.enemy .dummy-icon { 
  font-size: 70px; 
  width: 140px; 
  height: 140px; 
  background: linear-gradient(135deg, #795548, #3e2723); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-radius: 12px; 
  border: 4px solid #5d4037;
  box-shadow: 10px 10px 20px rgba(0,0,0,0.6);
  transform: rotateY(-15deg); 
  animation: floatEnemy 3.5s ease-in-out infinite;
  transition: all 0.2s ease;
}

@keyframes floatAlly { 0%, 100% { transform: rotateY(15deg) translateY(0); } 50% { transform: rotateY(15deg) translateY(-10px); } }
@keyframes floatEnemy { 0%, 100% { transform: rotateY(-15deg) translateY(0); } 50% { transform: rotateY(-15deg) translateY(-10px); } }

/* Chữ VS */
.vs-badge { font-size: 40px; font-weight: 900; color: #e74c3c; font-style: italic; text-shadow: 0 0 20px #e74c3c, 3px 3px 0 #000; z-index: 1; animation: pulse 1s infinite alternate;}
@keyframes pulse { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }

/* =========================================
   ANIMATION CHIẾN ĐẤU (ATTACK & HIT)
   ========================================= */
/* Khi Phe ta đánh: Ngừng thở, lao tới, phát sáng đỏ */
.fighter.ally.attacking .avatar-full {
  animation: none !important; 
  transform: rotateY(15deg) translate(50px, -20px) scale(1.1); /* Chạy tới trước & bự lên */
  box-shadow: -10px 10px 30px rgba(231, 76, 60, 0.8), 0 0 40px #fff;
  border-color: #fff;
}

/* Khi Cọc gỗ bị đánh trúng: Chớp đỏ rực và giật lắc */
.fighter.enemy.hit .dummy-icon {
  animation: none !important;
  transform: rotateY(-15deg) scale(0.95);
  background: linear-gradient(135deg, #e74c3c, #c0392b); /* Đổi sang màu đỏ */
  border-color: #fff;
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.8);
}
.fighter.enemy.hit { animation: shake 0.3s ease-in-out; }

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-15px) rotate(-5deg); }
  50% { transform: translateX(15px) rotate(5deg); }
  75% { transform: translateX(-15px) rotate(-5deg); }
  100% { transform: translateX(0); }
}

/* =========================================
   BẢNG ĐIỀU KHIỂN & NHẬT KÝ
   ========================================= */
.control-panel { width: 100%; max-width: 700px; background: #222; padding: 20px; border-radius: 12px;}
.battle-stats { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #444; padding-bottom: 10px;}
.skills-bar, .end-actions { display: flex; gap: 15px; justify-content: center; }
.skill-btn, .action-btn { flex: 1; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; color: white; transition: 0.2s;}
.skill-btn:active, .action-btn:active { transform: scale(0.95); }
.skill-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.skill-btn.normal { background: #34495e; }
.skill-btn.active { background: #2980b9; }
.skill-btn.ultimate { background: #c0392b; }
.action-btn.restart { background: #27ae60; }
.action-btn.change { background: #7f8c8d; }

.combat-log { width: 100%; max-width: 700px; background: #111; padding: 15px; border-radius: 8px; height: 150px; overflow-y: auto; border: 1px solid #333; font-family: monospace; font-size: 14px;}
.log-line { margin-bottom: 5px; color: #ddd; border-bottom: 1px dashed #333; padding-bottom: 5px; }
.log-line.highlight { color: #f1c40f; font-weight: bold; font-size: 16px; margin-top: 10px; border: none; }
</style>