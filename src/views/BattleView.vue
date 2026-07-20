<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dữ liệu chiến đấu
const stageInfo = ref(null)
const allies = ref([])
const enemies = ref([])
const combatLog = ref([])
const isAutoPlaying = ref(false)
const battleStatus = ref('waiting') // waiting, playing, victory, defeat

// BIẾN CHO POPUP KẾT QUẢ
const showResultPopup = ref(false)
const earnedStars = ref(0)
const earnedGold = ref(0)

let battleInterval = null

// Hàm tính toán chỉ số thực tế
const getActualStat = (baseStat, level, rarity, statType) => {
  if (!baseStat) return 0
  let growthRate = statType === 'hp' ? 0.08 : 0.05
  if (rarity === 'UR') growthRate += 0.10
  else if (rarity === 'SSR') growthRate += 0.05
  return Math.floor(baseStat * (1 + (level - 1) * growthRate))
}

// Hàm khởi tạo/Reset sàn đấu
const initBattle = () => {
  const data = JSON.parse(localStorage.getItem('battleData'))
  if (!data || !data.team) {
    alert('Không tìm thấy dữ liệu đội hình!')
    router.push('/phieu-luu')
    return
  }
  
  stageInfo.value = data.stage
  
  // Khởi tạo phe Ta
  allies.value = data.team.map((item, index) => {
    const card = item.cardId
    const hp = getActualStat(card.stats?.hp || 1000, item.level, card.rarity, 'hp')
    return {
      uid: `ally_${index}`,
      isAlly: true,
      name: card.name,
      image: card.image,
      rarity: card.rarity,
      level: item.level,
      maxHp: hp,
      hp: hp,
      atk: getActualStat(card.stats?.atk || 100, item.level, card.rarity, 'atk'),
      spd: getActualStat(card.stats?.spd || 50, item.level, card.rarity, 'spd'),
      skills: card.skills || {},
      isAttacking: false,
      isHit: false
    }
  })

  // Khởi tạo phe Địch
  const enemyLevel = stageInfo.value.id * 2
  enemies.value = [1, 2, 3].map(i => ({
    uid: `enemy_${i}`,
    isAlly: false,
    name: i === 2 ? 'Goblin Thủ Lĩnh' : 'Goblin Tay Sai',
    image: null,
    emoji: i === 2 ? '👹' : '👺',
    maxHp: 2000 + (enemyLevel * 200),
    hp: 2000 + (enemyLevel * 200),
    atk: 150 + (enemyLevel * 20),
    spd: 40 + (enemyLevel * 2) + (Math.random() * 10),
    isAttacking: false,
    isHit: false
  }))

  combatLog.value = []
  battleStatus.value = 'waiting'
  isAutoPlaying.value = false
  showResultPopup.value = false
  earnedStars.value = 0
  earnedGold.value = 0
  
  addLog(`Tiến vào ải: [${stageInfo.value.name}]. Trận chiến chuẩn bị bắt đầu!`)
}

onMounted(() => {
  initBattle()
})

const addLog = (msg) => {
  combatLog.value.unshift(msg)
  if (combatLog.value.length > 30) combatLog.value.pop()
}

// Logic Trận Đánh Tự Động
const toggleAutoBattle = () => {
  if (battleStatus.value === 'victory' || battleStatus.value === 'defeat') return
  
  isAutoPlaying.value = !isAutoPlaying.value
  battleStatus.value = isAutoPlaying.value ? 'playing' : 'waiting'

  if (isAutoPlaying.value) runBattleLoop()
  else clearTimeout(battleInterval)
}

const runBattleLoop = async () => {
  if (!isAutoPlaying.value) return

  const aliveAllies = allies.value.filter(a => a.hp > 0)
  const aliveEnemies = enemies.value.filter(e => e.hp > 0)

  // XỬ LÝ KẾT THÚC TRẬN ĐẤU
  if (aliveEnemies.length === 0 || aliveAllies.length === 0) {
    isAutoPlaying.value = false
    
    if (aliveEnemies.length === 0) {
      battleStatus.value = 'victory'
      addLog('🏆 CHIẾN THẮNG! Toàn bộ kẻ địch đã bị tiêu diệt.')
      
      // Tính số sao (Cứ sống 1 người = 1 sao)
      earnedStars.value = aliveAllies.length
      
      const userData = JSON.parse(localStorage.getItem('currentUser'))
      if (userData) {
        try {
          const res = await fetch('http://localhost:5000/api/user/win-battle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id, stageId: stageInfo.value.id })
          })
          const data = await res.json()
          if (res.ok && data.rewardGold) {
            earnedGold.value = data.rewardGold
            addLog(`🎁 Nhận thưởng: ${data.rewardGold} Vàng!`)
            userData.gold = data.newGold
            userData.highestStageCleared = Math.max(userData.highestStageCleared || 0, data.highestStageCleared)
            localStorage.setItem('currentUser', JSON.stringify(userData))
            window.dispatchEvent(new CustomEvent('wallet-updated'))
          }
        } catch (err) { console.error('Lỗi lưu kết quả', err) }
      }
    } else {
      battleStatus.value = 'defeat'
      addLog('☠️ THẤT BẠI! Toàn bộ đội hình đã ngã xuống.')
    }

    // Hiển thị popup sau 1 giây cho kịch tính
    setTimeout(() => { showResultPopup.value = true }, 1000)
    return
  }

  // LOGIC ĐÁNH NHƯ CŨ
  const allAlive = [...aliveAllies, ...aliveEnemies].sort((a, b) => b.spd - a.spd)
  const actor = allAlive[0]
  const targetTeam = actor.isAlly ? aliveEnemies : aliveAllies
  const target = targetTeam[Math.floor(Math.random() * targetTeam.length)]

  let skillName = 'Đánh thường'
  let multiplier = 1.0
  const roll = Math.random()

  if (actor.isAlly) {
    if (roll <= 0.10) { skillName = actor.skills.ultimate?.name || 'Tuyệt kỹ'; multiplier = 2.5 } 
    else if (roll <= 0.40) { skillName = actor.skills.active?.name || 'Kỹ năng'; multiplier = 1.5 }
  } else {
    skillName = roll < 0.2 ? 'Cắn xé' : 'Đập mạnh'
    multiplier = roll < 0.2 ? 1.5 : 1.0
  }

  const variance = (Math.random() * 0.2) - 0.1
  const finalDamage = Math.floor(actor.atk * multiplier * (1 + variance))

  actor.isAttacking = true
  setTimeout(() => {
    target.isHit = true
    target.hp = Math.max(0, target.hp - finalDamage)
    addLog(`[${actor.name}] dùng ${skillName} gây ${finalDamage} ST lên [${target.name}]`)
    if (target.hp === 0) addLog(`💀 [${target.name}] đã bị hạ gục!`)
  }, 300)

  battleInterval = setTimeout(() => {
    actor.isAttacking = false
    target.isHit = false
    
    allAlive.forEach(char => {
      if (char.uid !== actor.uid) char.spd += 20
      else char.spd = char.spd / 2
    })
    if (isAutoPlaying.value) runBattleLoop()
  }, 1000)
}

const exitBattle = () => {
  clearTimeout(battleInterval)
  router.push('/phieu-luu')
}

// Danh sách tên 10 Ải của Chương 1 để hệ thống biết đường gọi tên
const chapter1Stages = [
  'Cửa Rừng', 'Đường Mòn', 'Suối Tiên', 'Bẫy Rập', 'Trại Goblin',
  'Hang Động', 'Vách Đá', 'Đầm Lầy', 'Tế Đàn', 'Boss Rừng'
]

// Hàm chuyển sang màn tiếp theo
const nextStage = () => {
  const nextId = stageInfo.value.id + 1

  // Kiểm tra nếu đã đánh xong ải 10 (Max)
  if (nextId > 10) {
    alert('🎉 Chúc mừng! Bạn đã phá đảo toàn bộ Chương 1!')
    exitBattle()
    return
  }

  // Cập nhật lại thông tin ải mới vào localStorage
  const data = JSON.parse(localStorage.getItem('battleData'))
  data.stage = {
    id: nextId,
    name: chapter1Stages[nextId - 1]
  }
  localStorage.setItem('battleData', JSON.stringify(data))

  // Gọi hàm khởi tạo lại trận đấu (quái mới, máu mới, log mới)
  initBattle()
}

</script>

<template>
  <div class="battle-container">
    <div class="battle-header">
      <button class="back-btn" @click="exitBattle">⬅ Rút lui</button>
      <h2 class="stage-title">⚔️ Ải: {{ stageInfo?.name }} ⚔️</h2>
      <div class="status-badge" :class="battleStatus">
        {{ battleStatus === 'waiting' ? 'Đang chờ' : battleStatus === 'playing' ? 'Đang chiến đấu' : battleStatus === 'victory' ? 'Thắng' : 'Thua' }}
      </div>
    </div>

    <div class="battle-field">
      
      <!-- CỘT BÊN TRÁI: ĐỘI HÌNH TA -->
      <div class="team-column ally-team">
        <div 
          v-for="char in allies" 
          :key="char.uid" 
          class="fighter-card"
          :class="{ 'dead': char.hp <= 0, 'attacking': char.isAttacking, 'hit': char.isHit }"
        >
          <img v-if="char.image" :src="char.image" class="avatar">
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: (char.hp / char.maxHp * 100) + '%', background: '#27ae60' }"></div>
          </div>
          <div class="fighter-info">
            <div class="name">{{ char.name }}</div>
            <div class="hp-text">{{ char.hp }} / {{ char.maxHp }}</div>
          </div>
        </div>
      </div>

      <!-- CỘT GIỮA: NÚT ĐIỀU KHIỂN & VS -->
      <div class="center-control">
        <div class="vs-text">VS</div>
        <button 
          class="auto-btn" 
          :class="{ 'active': isAutoPlaying }"
          @click="toggleAutoBattle"
          :disabled="battleStatus === 'victory' || battleStatus === 'defeat'"
        >
          {{ isAutoPlaying ? '⏸ Tạm Dừng' : '▶ Bắt Đầu Tự Động' }}
        </button>
      </div>

      <!-- CỘT BÊN PHẢI: KẺ ĐỊCH -->
      <div class="team-column enemy-team">
        <div 
          v-for="char in enemies" 
          :key="char.uid" 
          class="fighter-card"
          :class="{ 'dead': char.hp <= 0, 'attacking-enemy': char.isAttacking, 'hit': char.isHit }"
        >
          <div class="monster-emoji">{{ char.emoji }}</div>
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: (char.hp / char.maxHp * 100) + '%', background: '#e74c3c' }"></div>
          </div>
          <div class="fighter-info">
            <div class="name">{{ char.name }}</div>
            <div class="hp-text">{{ char.hp }} / {{ char.maxHp }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- KHUNG NHẬT KÝ CHIẾN ĐẤU -->
    <div class="battle-log">
      <div v-for="(log, idx) in combatLog" :key="idx" class="log-line" :class="{ 'highlight': log.includes('CHIẾN THẮNG') || log.includes('THẤT BẠI') }">
        {{ log }}
      </div>
    </div>

    <!-- NÚT NỔI GỌI LẠI POPUP (Chỉ hiện khi đã xong trận mà Popup đang tắt) -->
    <button 
      v-if="(battleStatus === 'victory' || battleStatus === 'defeat') && !showResultPopup" 
      class="floating-result-btn"
      @click="showResultPopup = true"
    >
      📋 Xem Kết Quả
    </button>

    <!-- POPUP TỔNG KẾT TRẬN ĐẤU -->
    <div class="result-overlay" v-if="showResultPopup">
      <div class="result-modal" :class="battleStatus">
        <!-- Nút tắt để ra ngoài xem Log -->
        <button class="close-btn" @click="showResultPopup = false" title="Tắt để xem Log">✖</button>

        <div class="result-header">
          <h1 class="result-title">{{ battleStatus === 'victory' ? 'CHIẾN THẮNG' : 'THẤT BẠI' }}</h1>
          <p class="result-subtitle">{{ stageInfo?.name }}</p>
        </div>

        <!-- Số Sao (Chỉ hiện khi thắng) -->
        <div class="stars-container" v-if="battleStatus === 'victory'">
          <span v-for="i in 3" :key="i" class="star" :class="{ 'active': i <= earnedStars }">★</span>
        </div>
        
        <!-- Câu an ủi khi thua -->
        <div class="defeat-message" v-if="battleStatus === 'defeat'">
          <div class="skull-icon">💀</div>
          <p>Đội hình của bạn chưa đủ mạnh.</p>
          <p>Hãy nâng cấp Tướng và thử lại nhé!</p>
        </div>

        <!-- Phần thưởng -->
        <div class="rewards-box" v-if="battleStatus === 'victory'">
          <p class="reward-title">Phần Thưởng:</p>
          <div class="reward-item">💰 +{{ earnedGold }} Vàng</div>
        </div>

        <!-- Nút thao tác -->
        <div class="modal-actions">
          <!-- Nút Thử Lại (Reset ải hiện tại) -->
          <button class="btn retry" @click="initBattle">🔄 Thử Lại</button>
          
          <!-- Nếu THẮNG: Hiện nút Màn Kế (Hoặc Hoàn Thành nếu là ải cuối) -->
          <button 
            v-if="battleStatus === 'victory'" 
            class="btn confirm" 
            @click="nextStage"
          >
            {{ stageInfo?.id < 10 ? 'Màn Kế ⏩' : 'Hoàn Thành 🗺️' }}
          </button>
          
          <!-- Nếu THUA: Chỉ cho phép Rút lui -->
          <button 
            v-else 
            class="btn confirm" 
            @click="exitBattle"
          >
            Rút Lui 🏳️
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.battle-container { display: flex; flex-direction: column; height: 100vh; background: #0a0a0f; color: white; padding: 20px; overflow: hidden; box-sizing: border-box; }
.battle-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
.back-btn { background: #333; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
.stage-title { margin: 0; color: #f1c40f; text-shadow: 0 0 10px rgba(241, 196, 15, 0.5); }
.status-badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; background: #555; }
.status-badge.playing { background: #2980b9; }
.status-badge.victory { background: #27ae60; animation: pulse 1s infinite; }
.status-badge.defeat { background: #c0392b; }

.battle-field { 
  flex: 1; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background: radial-gradient(ellipse at center, #1a252f 0%, #000 100%);
  border-radius: 16px;
  border: 1px solid #333;
  padding: 20px 40px;
  perspective: 1200px; /* Góc nhìn 3D */
}

/* Các cột đội hình */
.team-column { display: flex; flex-direction: column; gap: 20px; width: 250px; }
.ally-team { transform: rotateY(15deg); }
.enemy-team { transform: rotateY(-15deg); }

/* Thẻ chiến binh */
.fighter-card { 
  background: rgba(30, 30, 36, 0.9); 
  border: 2px solid #444; 
  border-radius: 12px; 
  padding: 10px; 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  position: relative; 
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.avatar { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid #888; }
.monster-emoji { width: 60px; height: 60px; background: #3e2723; border-radius: 8px; font-size: 35px; display: flex; justify-content: center; align-items: center; border: 2px solid #795548;}

.fighter-info { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.name { font-size: 13px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hp-text { font-size: 11px; color: #ccc; text-align: right; }

.hp-bar-container { position: absolute; bottom: -2px; left: 0; width: 100%; height: 6px; background: #222; border-radius: 0 0 12px 12px; overflow: hidden; }
.hp-bar { height: 100%; transition: width 0.3s ease-out; }

/* Trạng thái chết */
.fighter-card.dead { filter: grayscale(100%) opacity(0.4); transform: scale(0.9); }

/* ANIMATION TẤN CÔNG & BỊ ĐÁNH */
.ally-team .fighter-card.attacking { transform: translate(50px, -10px) scale(1.1) rotateY(15deg); border-color: #f1c40f; box-shadow: 0 0 20px rgba(241, 196, 15, 0.5); z-index: 10; }
.enemy-team .fighter-card.attacking-enemy { transform: translate(-50px, -10px) scale(1.1) rotateY(-15deg); border-color: #e74c3c; box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); z-index: 10; }

.fighter-card.hit { animation: shake 0.3s; border-color: #e74c3c; background: rgba(231, 76, 60, 0.3); }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-10px); }
}

/* Nút trung tâm */
.center-control { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.vs-text { font-size: 50px; font-weight: 900; color: #555; font-style: italic; text-shadow: 2px 2px 0 #000; }
.auto-btn { padding: 15px 30px; border-radius: 30px; border: none; font-size: 16px; font-weight: bold; background: #e67e22; color: white; cursor: pointer; box-shadow: 0 5px 15px rgba(230, 126, 34, 0.4); transition: 0.2s; }
.auto-btn.active { background: #27ae60; box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4); }
.auto-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Bảng Log */
.battle-log { height: 150px; background: #111; border: 1px solid #333; border-radius: 12px; margin-top: 20px; padding: 15px; overflow-y: auto; font-family: monospace; font-size: 14px; }
.log-line { margin-bottom: 5px; color: #ddd; border-bottom: 1px dashed #222; padding-bottom: 5px; }
.log-line.highlight { color: #f1c40f; font-weight: bold; font-size: 16px; border: none; padding-top: 10px;}

/* =========================================
   POPUP KẾT QUẢ TRẬN ĐẤU
   ========================================= */
.result-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

.result-modal {
  background: #1e1e24; width: 90%; max-width: 450px;
  border-radius: 16px; position: relative; padding: 30px;
  text-align: center; border: 3px solid;
  box-shadow: 0 15px 50px rgba(0,0,0,0.8);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.result-modal.victory { border-color: #f1c40f; box-shadow: 0 0 30px rgba(241, 196, 15, 0.2); }
.result-modal.defeat { border-color: #e74c3c; box-shadow: 0 0 30px rgba(231, 76, 60, 0.2); }

.close-btn {
  position: absolute; top: 15px; right: 15px; background: none; border: none;
  color: #aaa; font-size: 20px; cursor: pointer; transition: 0.2s;
}
.close-btn:hover { color: #fff; transform: scale(1.2); }

.result-title { margin: 0 0 5px 0; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 0 #000; }
.victory .result-title { color: #f1c40f; }
.defeat .result-title { color: #e74c3c; }
.result-subtitle { color: #aaa; margin: 0 0 20px 0; font-size: 16px; }

/* Hiệu ứng Sao */
.stars-container { display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; }
.star { font-size: 50px; color: #333; text-shadow: 2px 2px 5px #000; transition: 0.5s; }
.star.active { color: #f1c40f; text-shadow: 0 0 20px #f1c40f, 2px 2px 0 #b7950b; animation: starPop 0.5s ease-out; }

/* Phần Thưởng / Thua */
.rewards-box { background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #333; }
.reward-title { margin: 0 0 10px 0; color: #ddd; font-size: 14px; }
.reward-item { font-size: 22px; font-weight: bold; color: #f1c40f; }

.defeat-message { margin-bottom: 25px; }
.skull-icon { font-size: 50px; margin-bottom: 10px; animation: floatAlly 3s infinite; }
.defeat-message p { margin: 5px 0; color: #ccc; }

/* Nút bấm */
.modal-actions { display: flex; gap: 15px; }
.btn { flex: 1; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; color: white; transition: 0.2s; }
.btn.retry { background: #34495e; }
.btn.retry:hover { background: #2c3e50; }
.btn.confirm { background: #27ae60; }
.defeat .btn.confirm { background: #7f8c8d; }
.btn:active { transform: translateY(2px); }

/* Nút nổi xem kết quả */
.floating-result-btn {
  position: absolute; right: 20px; bottom: 190px; /* Nằm ngay trên thanh Log */
  background: #f1c40f; color: #000; border: none; padding: 10px 20px;
  border-radius: 20px; font-weight: bold; cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 50; animation: pulse 2s infinite;
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(50px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes starPop { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 70% { transform: scale(1.3) rotate(15deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }

@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
</style>