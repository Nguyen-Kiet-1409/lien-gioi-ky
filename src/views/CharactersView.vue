<script setup>
import { ref, computed } from 'vue'

const maxCapacity = ref(50)
const selectedCard = ref(null)

// 1. Dữ liệu giả lập (Bổ sung thêm dòng stats: máu, tấn công, tốc độ)
const myCards = ref([
  { 
    id: 1, name: 'Thánh Nữ Ánh Sáng', rarity: 'SSR', level: 50, color: '#f1c40f',
    type: 'Hỗ Trợ', stars: 5,
    lore: 'Người kế thừa ánh sáng thánh thần, mang lại hy vọng cho đồng đội.',
    stats: { hp: 4500, atk: 850, spd: 110 }, // <--- CHỈ SỐ Ở ĐÂY
    skills: {
      normal: { name: 'Tia Sáng', type: 'Đánh thường', desc: 'Gây 100% sát thương phép lên 1 mục tiêu.' },
      active: { name: 'Thánh Ca', type: 'Kỹ năng', desc: 'Hồi HP cho toàn đội bằng 150% sức mạnh phép thuật.' },
      ultimate: { name: 'Ánh Sáng Cứu Rỗi', type: 'Tuyệt kỹ', desc: 'Hồi sinh 1 đồng đội và miễn nhiễm sát thương 1 lượt.' }
    },
    equip: {
      weapon: { name: 'Trượng Ánh Sáng', icon: '🪄', level: 20 },
      armor: { name: 'Áo Choàng Thánh', icon: '👘', level: 15 },
      pants: { name: 'Váy Tinh Tú', icon: '👖', level: 15 },
      shoes: { name: 'Giày Pha Lê', icon: '🥿', level: 10 }
    }
  },
  { 
    id: 2, name: 'Hiệp Sĩ Rừng Xanh', rarity: 'SR', level: 35, color: '#9b59b6',
    type: 'Đấu Sĩ', stars: 4,
    lore: 'Người bảo vệ rừng sâu, vung kiếm chém đứt mọi tà ác.',
    stats: { hp: 6200, atk: 1200, spd: 95 }, // <--- CHỈ SỐ Ở ĐÂY
    skills: {
      normal: { name: 'Chém Gió', type: 'Đánh thường', desc: 'Gây 120% sát thương vật lý.' },
      active: { name: 'Lá Chắn Gai', type: 'Kỹ năng', desc: 'Tạo giáp và phản 30% sát thương nhận vào.' },
      ultimate: { name: 'Bão Kiếm', type: 'Tuyệt kỹ', desc: 'Gây sát thương diện rộng 3 lần liên tiếp.' }
    },
    equip: {
      weapon: { name: 'Kiếm Gỗ Sồi', icon: '🗡️', level: 10 },
      armor: { name: 'Giáp Da', icon: '🦺', level: 10 },
      pants: { name: 'Quần Thợ Săn', icon: '🩳', level: 5 },
      shoes: { name: 'Ủng Da', icon: '👢', level: 5 }
    }
  },
])

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

    <div class="inventory-grid">
      <div v-for="(slot, index) in displayGrid" :key="index" class="slot-wrapper" @click="viewCharacter(slot)">
        <div v-if="!slot.isEmpty" class="character-card" :style="{ borderColor: slot.color, boxShadow: `inset 0 0 10px ${slot.color}33` }">
          <div class="card-rarity" :style="{ color: slot.color }">{{ slot.rarity }}</div>
          <div class="card-avatar">🧙‍♂️</div>
          <div class="card-name">{{ slot.name }}</div>
          <div class="card-level">Lv.{{ slot.level }}</div>
        </div>
        <div v-else class="empty-slot"></div>
      </div>
    </div>

    <!-- MÀN HÌNH CHI TIẾT NHÂN VẬT -->
    <div class="char-overlay" v-if="selectedCard" @click.self="closeCharacter">
      <div class="char-modal" :style="{ borderTopColor: selectedCard.color }">
        <button class="close-btn" @click="closeCharacter">✖</button>
        
        <div class="char-header-info">
          <div class="avatar-box" :style="{ borderColor: selectedCard.color }">
            <span class="avatar-emoji">🧙‍♂️</span>
          </div>
          <div class="basic-info">
            <h2 :style="{ color: selectedCard.color }">{{ selectedCard.name }}</h2>
            <div class="tags">
              <span class="tag type">{{ selectedCard.type }}</span>
              <span class="tag stars"><span v-for="i in selectedCard.stars" :key="i">★</span></span>
              <span class="tag level">Lv.{{ selectedCard.level }}</span>
            </div>
            <p class="lore">{{ selectedCard.lore }}</p>
          </div>
        </div>

        <!-- PHẦN MỚI: CHỈ SỐ CƠ BẢN -->
        <div class="stats-section">
          <div class="stat-box">
            <div class="stat-icon">❤️</div>
            <div class="stat-value">{{ selectedCard.stats.hp }}</div>
            <div class="stat-label">Máu (HP)</div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">⚔️</div>
            <div class="stat-value">{{ selectedCard.stats.atk }}</div>
            <div class="stat-label">Tấn Công</div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">{{ selectedCard.stats.spd }}</div>
            <div class="stat-label">Tốc Độ</div>
          </div>
        </div>

        <!-- Trang Bị -->
        <div class="equip-section">
          <h3>Trang Bị</h3>
          <div class="equip-grid">
            <div class="equip-slot">
              <div class="e-icon">{{ selectedCard.equip.weapon.icon }}</div>
              <div class="e-detail">
                <div class="e-type">Vũ Khí</div>
                <div class="e-name">+{{ selectedCard.equip.weapon.level }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">{{ selectedCard.equip.armor.icon }}</div>
              <div class="e-detail">
                <div class="e-type">Áo</div>
                <div class="e-name">+{{ selectedCard.equip.armor.level }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">{{ selectedCard.equip.pants.icon }}</div>
              <div class="e-detail">
                <div class="e-type">Quần</div>
                <div class="e-name">+{{ selectedCard.equip.pants.level }}</div>
              </div>
            </div>
            <div class="equip-slot">
              <div class="e-icon">{{ selectedCard.equip.shoes.icon }}</div>
              <div class="e-detail">
                <div class="e-type">Giày</div>
                <div class="e-name">+{{ selectedCard.equip.shoes.level }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kỹ Năng -->
        <div class="skills-section">
          <h3>Kỹ Năng</h3>
          <div class="skill-item normal">
            <div class="s-icon">⚔️</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.skills.normal.name }}</span>
                <span class="s-type">{{ selectedCard.skills.normal.type }}</span>
              </div>
              <p>{{ selectedCard.skills.normal.desc }}</p>
            </div>
          </div>
          <div class="skill-item active">
            <div class="s-icon">✨</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.skills.active.name }}</span>
                <span class="s-type">{{ selectedCard.skills.active.type }}</span>
              </div>
              <p>{{ selectedCard.skills.active.desc }}</p>
            </div>
          </div>
          <div class="skill-item ultimate">
            <div class="s-icon">🔥</div>
            <div class="s-info">
              <div class="s-head">
                <span class="s-name">{{ selectedCard.skills.ultimate.name }}</span>
                <span class="s-type">{{ selectedCard.skills.ultimate.type }}</span>
              </div>
              <p>{{ selectedCard.skills.ultimate.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Các style cũ giữ nguyên */
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
.character-card { width: 100%; height: 100%; background: #25252d; border: 2px solid; border-radius: 8px; display: flex; flex-direction: column; align-items: center; position: relative; }
.card-rarity { position: absolute; top: 4px; left: 6px; font-size: 12px; font-weight: 900; }
.card-avatar { font-size: 32px; margin-top: 15px; flex: 1; display: flex; align-items: center; }
.card-name { color: white; font-size: 11px; font-weight: bold; text-align: center; width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.card-level { width: 100%; background: rgba(0, 0, 0, 0.6); color: #ccc; font-size: 11px; text-align: center; padding: 3px 0; border-radius: 0 0 6px 6px; }

/* Modal & Overlay */
.char-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 20px; backdrop-filter: blur(5px); }
.char-modal { background: #1e1e24; width: 100%; max-width: 450px; border-radius: 12px; border-top: 6px solid; max-height: 90vh; overflow-y: auto; position: relative; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
.close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #aaa; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }
.char-header-info { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; }
.avatar-box { width: 90px; height: 90px; background: #2c3e50; border: 3px solid; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 45px; flex-shrink: 0; }
.basic-info h2 { margin: 0 0 8px 0; font-size: 22px; text-shadow: 1px 1px 2px #000; }
.tags { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tag { font-size: 12px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.tag.type { background: #34495e; color: #fff; }
.tag.stars { color: #f1c40f; letter-spacing: 2px; }
.tag.level { background: #e74c3c; color: #fff; }
.lore { margin: 0; font-size: 13px; color: #bdc3c7; line-height: 1.4; font-style: italic; }
h3 { margin: 0 0 10px 0; font-size: 16px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 5px; }

/* =========================================
   CSS PHẦN CHỈ SỐ MỚI
   ========================================= */
.stats-section {
  display: flex;
  justify-content: space-around;
  background: #1a1a1f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #333;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon { font-size: 20px; }
.stat-value { color: #fff; font-size: 16px; font-weight: bold; }
.stat-label { color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }

/* Trang bị & Kỹ năng giữ nguyên */
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