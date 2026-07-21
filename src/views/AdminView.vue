<script setup>
import { ref, onMounted } from 'vue'

// =====================================
// KHU VỰC 0: ĐIỀU HƯỚNG TABS
// =====================================
const activeTab = ref('cards') // Mặc định mở tab Thẻ Bài

// =====================================
// KHU VỰC 1: XỬ LÝ THẺ BÀI (Giữ nguyên logic của bạn)
// =====================================
const editingId = ref(null) 
const emptyCardForm = {
  name: '', image: '', rarity: 'R', type: 'Đấu Sĩ', color: '#bdc3c7', stars: 1, lore: '',
  stats: { hp: 1000, atk: 100, spd: 50 },
  skills: {
    normal: { name: '', desc: '' },
    active: { name: '', desc: '' },
    ultimate: { name: '', desc: '' }
  }
}

const newCard = ref(JSON.parse(JSON.stringify(emptyCardForm)))
const cardList = ref([]) 
const urCards = ref([])
const fileInput = ref(null)

const loadAllCards = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/cards/all')
    const data = await res.json()
    urCards.value = data    
    cardList.value = data    
  } catch (error) {
    console.error('Lỗi khi load thẻ:', error)
  }
}

const selectCardToEdit = (card) => {
  editingId.value = card._id
  newCard.value = JSON.parse(JSON.stringify(card))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingId.value = null
  newCard.value = JSON.parse(JSON.stringify(emptyCardForm))
}

const submitCard = async () => {
  if (!newCard.value.name) return alert("Vui lòng nhập tên nhân vật!")
  try {
    const isEditing = !!editingId.value
    const url = isEditing ? `http://localhost:5000/api/cards/${editingId.value}` : 'http://localhost:5000/api/cards'
    const method = isEditing ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard.value)
    })
    const data = await response.json()

    if (response.ok) {
      alert(`🎉 ${isEditing ? 'Cập nhật' : 'Tạo'} thẻ bài ${newCard.value.name} thành công!`)
      await loadAllCards() 
      cancelEdit()        
    } else { alert('❌ Lỗi: ' + data.message) }
  } catch (error) { alert('❌ Không thể kết nối tới Backend!') }
}

const triggerFileInput = () => fileInput.value.click()

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return alert('Vui lòng chọn ảnh nhẹ hơn 2MB!')
  
  const reader = new FileReader()
  reader.onload = (e) => newCard.value.image = e.target.result 
  reader.readAsDataURL(file)
}

// =====================================
// KHU VỰC 2: XỬ LÝ BANNER (Giữ nguyên logic của bạn)
// =====================================
const bannerForm = ref({
  bannerId: '', title: '', description: '', image: '', isLimited: false, featuredCards: []
})

const handleBannerImage = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => bannerForm.value.image = e.target.result
    reader.readAsDataURL(file)
  }
}

const submitBanner = async () => {
  if (!bannerForm.value.bannerId || !bannerForm.value.title) return alert('Vui lòng nhập Mã Banner và Tiêu đề!')
  try {
    const response = await fetch('http://localhost:5000/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerForm.value)
    })
    const data = await response.json()
    if (response.ok) {
      alert(data.message)
      bannerForm.value = { bannerId: '', title: '', description: '', image: '', isLimited: false, featuredCards: [] }
    } else { alert('❌ ' + data.message) }
  } catch (error) { alert('Không thể kết nối đến máy chủ!') }
}

// =====================================
// KHU VỰC 3: QUẢN LÝ ẢI & QUÁI VẬT (KẾT NỐI API)
// =====================================
// =====================================
// KHU VỰC QUẢN LÝ CHƯƠNG & ẢI
// =====================================
const chaptersList = ref([])
const editingChapterId = ref(null)

// Khuôn mẫu mặc định cho 1 Chương (Tự sinh 10 ải trống)
const emptyChapterForm = {
  chapterNumber: 1,
  title: '',
  bossId: '',
  stages: Array.from({ length: 10 }, (_, i) => ({
    stageId: i + 1,
    name: '',
    cost: i === 9 ? 10 : 5,
    monsters: []
  }))
}
const chapterForm = ref(JSON.parse(JSON.stringify(emptyChapterForm)))

const loadChapters = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/chapters')
    if (res.ok) chaptersList.value = await res.json()
  } catch (error) { console.error('Lỗi load chương:', error) }
}

const openChapterForm = (mode, chapter = null) => {
  formMode.value = mode
  if (mode === 'edit' && chapter) {
    editingChapterId.value = chapter._id
    const cloned = JSON.parse(JSON.stringify(chapter))
    
    if (cloned.bossId && cloned.bossId._id) cloned.bossId = cloned.bossId._id
    
    // 👉 Biến đổi mảng object quái thành mảng ID quái cho form Sửa
    cloned.stages.forEach(stage => {
      if (stage.monsters) {
        stage.monsters = stage.monsters.map(m => m._id ? m._id : m)
      }
    })
    
    chapterForm.value = cloned
  } else {
    editingChapterId.value = null
    chapterForm.value = JSON.parse(JSON.stringify(emptyChapterForm))
    // Tự tăng số chương lên 1 so với chương cuối
    if (chaptersList.value.length > 0) {
      chapterForm.value.chapterNumber = chaptersList.value[chaptersList.value.length - 1].chapterNumber + 1
    }
  }
  isFormOpen.value = 'chapter' // Đánh dấu đang mở form Chương
}

const submitChapter = async () => {
  if (!chapterForm.value.title) return alert('Vui lòng nhập Tên chương!')
  try {
    const isEditing = !!editingChapterId.value
    const url = isEditing ? `http://localhost:5000/api/chapters/${editingChapterId.value}` : 'http://localhost:5000/api/chapters'
    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterForm.value)
    })
    if (res.ok) {
      alert(`🎉 Đã ${isEditing ? 'cập nhật' : 'tạo'} Chương thành công!`)
      await loadChapters()
      closeForm()
    } else alert('❌ Lỗi khi lưu Chương!')
  } catch (err) { alert('❌ Lỗi kết nối!') }
}

const deleteChapter = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa Chương này?')) return
  try {
    const res = await fetch(`http://localhost:5000/api/chapters/${id}`, { method: 'DELETE' })
    if (res.ok) { alert('🗑️ Đã xóa Chương!'); await loadChapters() }
  } catch (err) { alert('❌ Lỗi kết nối!') }
}

const monstersList = ref([]) // Dữ liệu sẽ được tải từ Server
const editingMonsterId = ref(null)

const emptyMonsterForm = { name: '', emoji: '👺', hp: 2000, atk: 150, spd: 40, isBoss: false }
const monsterForm = ref(JSON.parse(JSON.stringify(emptyMonsterForm)))

const isFormOpen = ref(false)
const formMode = ref('add') 

// Hàm tải danh sách Quái vật
const loadMonsters = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/monsters')
    if (res.ok) monstersList.value = await res.json()
  } catch (error) {
    console.error('Lỗi khi load quái vật:', error)
  }
}

// Hàm hỗ trợ lấy Emoji của quái vật dựa vào ID
const getMonsterEmoji = (id) => {
  const monster = monstersList.value.find(m => m._id === id)
  return monster ? monster.emoji : '❓'
}

// Mở form Quái vật
const openMonsterForm = (mode, monster = null) => {
  formMode.value = mode
  if (mode === 'edit' && monster) {
    editingMonsterId.value = monster._id
    monsterForm.value = JSON.parse(JSON.stringify(monster))
  } else {
    editingMonsterId.value = null
    monsterForm.value = JSON.parse(JSON.stringify(emptyMonsterForm))
  }
  isFormOpen.value = 'monster'
}

const closeForm = () => { isFormOpen.value = false }

// Lưu Quái vật (Thêm mới hoặc Sửa)
const submitMonster = async () => {
  if (!monsterForm.value.name) return alert('Vui lòng nhập tên quái vật!')
  
  try {
    const isEditing = !!editingMonsterId.value
    const url = isEditing ? `http://localhost:5000/api/monsters/${editingMonsterId.value}` : 'http://localhost:5000/api/monsters'
    const method = isEditing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monsterForm.value)
    })
    
    if (res.ok) {
      alert(`🎉 Đã ${isEditing ? 'cập nhật' : 'tạo'} quái vật thành công!`)
      await loadMonsters()
      closeForm()
    } else {
      alert('❌ Có lỗi xảy ra!')
    }
  } catch (error) { alert('❌ Không thể kết nối tới Server!') }
}

// Xóa Quái vật
const deleteMonster = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa quái vật này không?')) return
  try {
    const res = await fetch(`http://localhost:5000/api/monsters/${id}`, { method: 'DELETE' })
    if (res.ok) {
      alert('🗑️ Đã xóa quái vật!')
      await loadMonsters()
    }
  } catch (error) { alert('❌ Lỗi kết nối!') }
}

// Cập nhật hàm onMounted để gọi cả loadAllCards và loadMonsters
onMounted(async () => {
  await loadAllCards()
  await loadMonsters() // Tải quái vật khi vào Admin
  await loadChapters()
})
</script>

<template>
  <div class="admin-layout">
    
    <!-- CỘT TRÁI: SIDEBAR ĐIỀU HƯỚNG -->
    <div class="sidebar">
      <div class="brand-box">
        <h2>🛠️ DEV PANEL</h2>
        <p>Hệ thống Quản Trị</p>
      </div>
      
      <!-- Menu Tabs -->
      <div class="menu-item" :class="{ active: activeTab === 'cards' }" @click="activeTab = 'cards'">🃏 Quản Lý Thẻ Bài</div>
      <div class="menu-item" :class="{ active: activeTab === 'banners' }" @click="activeTab = 'banners'">🎪 Quản Lý Banner</div>
      <div class="menu-item" :class="{ active: activeTab === 'stages' }" @click="activeTab = 'stages'">🗺️ Quản Lý Màn Ải</div>
      <div class="menu-item" :class="{ active: activeTab === 'monsters' }" @click="activeTab = 'monsters'">👾 Quản Lý Quái Vật</div>
      
      <!-- Nút thoát -->
      <router-link to="/home" class="menu-item back-btn" style="margin-top: 20px;">⬅ Về Trang Chủ</router-link>

      <!-- Danh sách thẻ bài (Chỉ hiện khi ở Tab Thẻ Bài) -->
      <div v-if="activeTab === 'cards'" class="mini-card-section">
        <h3 class="list-title">Danh sách Thẻ ({{ cardList.length }}):</h3>
        <ul class="mini-card-list">
          <li 
            v-for="card in cardList" 
            :key="card._id" 
            @click="selectCardToEdit(card)"
            class="mini-card-item"
            title="Click để sửa"
          >
            <span class="rarity-tag" :class="card.rarity" :style="{ background: card.color || '#555', color: '#fff' }">
              {{ card.rarity }}
            </span>
            <span class="card-name">{{ card.name }}</span> 
            <span class="edit-icon">✏️</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- CỘT PHẢI: KHÔNG GIAN LÀM VIỆC (MAIN CONTENT) -->
    <div class="main-content">
      
      <!-- ========================================== -->
      <!-- TAB 1: QUẢN LÝ THẺ BÀI -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'cards'" class="tab-pane">
        <div class="header">
          <h1>{{ editingId ? '✏️ Chỉnh Sửa Thẻ Bài' : '✨ Tạo Thẻ Bài Mới' }}</h1>
        </div>

        <form class="create-form" @submit.prevent="submitCard">
          <!-- Thông tin cơ bản -->
          <div class="form-section">
            <h3>1. Thông tin cơ bản</h3>
            <div class="basic-info-layout">
              <div class="basic-info-left">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Tên nhân vật</label>
                    <input type="text" v-model="newCard.name" placeholder="VD: Ma Tôn Hắc Ám">
                  </div>
                  <div class="form-group">
                    <label>Độ hiếm</label>
                    <select v-model="newCard.rarity">
                      <option value="R">R (Xám)</option><option value="SR">SR (Tím)</option><option value="SSR">SSR (Vàng)</option><option value="UR">UR (Đỏ)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Hệ / Loại</label>
                    <select v-model="newCard.type">
                      <option value="Đấu Sĩ">Đấu Sĩ</option><option value="Pháp Sư">Pháp Sư</option><option value="Hỗ Trợ">Hỗ Trợ</option><option value="Sát Thủ">Sát Thủ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Mã màu (Hex)</label>
                    <input type="color" v-model="newCard.color" class="color-picker">
                  </div>
                </div>
                <div class="form-group full-width" style="margin-top: 15px; flex: 1;">
                  <label>Cốt truyện / Tiểu sử</label>
                  <textarea v-model="newCard.lore" style="height: 100%; min-height: 80px;" placeholder="Nhập tiểu sử..."></textarea>
                </div>
              </div>

              <div class="basic-info-right">
                <label>Ảnh đại diện</label>
                <div class="upload-area" @click="triggerFileInput">
                  <img v-if="newCard.image" :src="newCard.image" alt="Preview">
                  <div v-else class="upload-placeholder"><span>📁</span><p>Tải ảnh lên</p></div>
                  <input type="file" ref="fileInput" accept="image/*" @change="handleImageUpload" style="display: none;">
                </div>
                <button v-if="newCard.image" class="remove-img-btn" @click.prevent="newCard.image = ''">🗑️ Gỡ ảnh</button>
              </div>
            </div>
          </div>

          <!-- Chỉ số & Kỹ năng -->
          <div class="form-section">
            <h3>2. Chỉ số gốc (Cấp 1)</h3>
            <div class="form-grid stats-grid">
              <div class="form-group"><label>❤️ HP</label><input type="number" v-model="newCard.stats.hp"></div>
              <div class="form-group"><label>⚔️ ATK</label><input type="number" v-model="newCard.stats.atk"></div>
              <div class="form-group"><label>⚡ SPD</label><input type="number" v-model="newCard.stats.spd"></div>
            </div>
          </div>

          <div class="form-section">
            <h3>3. Bộ Kỹ Năng</h3>
            <div class="skill-group"><div class="skill-header normal">Đánh Thường</div><input type="text" v-model="newCard.skills.normal.name" placeholder="Tên chiêu..."><input type="text" v-model="newCard.skills.normal.desc" placeholder="Mô tả..."></div>
            <div class="skill-group"><div class="skill-header active">Kỹ Năng Kích Hoạt</div><input type="text" v-model="newCard.skills.active.name" placeholder="Tên chiêu..."><input type="text" v-model="newCard.skills.active.desc" placeholder="Mô tả..."></div>
            <div class="skill-group"><div class="skill-header ultimate">Tuyệt Kỹ (Ultimate)</div><input type="text" v-model="newCard.skills.ultimate.name" placeholder="Tên chiêu..."><input type="text" v-model="newCard.skills.ultimate.desc" placeholder="Mô tả..."></div>
          </div>

          <div style="display: flex; gap: 15px; margin-top: 20px;">
            <button type="submit" class="save-btn" style="flex: 1;">💾 {{ editingId ? 'Cập Nhật' : 'Xuất Bản' }}</button>
            <button v-if="editingId" type="button" @click="cancelEdit" class="save-btn cancel">❌ Hủy Sửa</button>
          </div>
        </form>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: QUẢN LÝ BANNER -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'banners'" class="tab-pane">
        <div class="header"><h1>🎪 Đăng Cai Sự Kiện Gacha</h1></div>
        <div class="admin-box form-section">
          <div class="form-group"><label>Mã Banner (VD: limited_01):</label><input v-model="bannerForm.bannerId" type="text" placeholder="Nhập mã..." /></div>
          <div class="form-group"><label>Tiêu đề Sự Kiện:</label><input v-model="bannerForm.title" type="text" placeholder="VD: Hắc Ám Trỗi Dậy" /></div>
          <div class="form-group"><label>Mô tả ngắn:</label><textarea v-model="bannerForm.description" rows="3"></textarea></div>
          <div class="form-group"><label>Ảnh nền Banner:</label><input type="file" @change="handleBannerImage" accept="image/*" /><img v-if="bannerForm.image" :src="bannerForm.image" style="max-height: 150px; margin-top: 10px; border-radius: 8px;"></div>
          <div class="form-group checkbox-group"><label>Banner Giới Hạn:</label><input type="checkbox" v-model="bannerForm.isLimited" /></div>
          
          <div class="form-group card-selector">
            <label>🌟 Chọn danh sách tướng xuất hiện:</label>
            <p class="note">⚠️ Phải chọn đủ ít nhất 1 thẻ R, SR, SSR để Gacha không lỗi!</p>
            <div class="checkbox-grid">
              <label v-for="card in urCards" :key="card._id" class="check-item">
                <input type="checkbox" :value="card._id" v-model="bannerForm.featuredCards">
                <span class="rarity-tag" :class="card.rarity" :style="{ background: card.color }">{{ card.rarity }}</span>
                <span>{{ card.name }}</span>
              </label>
            </div>
          </div>
          <button class="save-btn banner-btn" @click="submitBanner">📢 Xuất Bản Banner</button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: QUẢN LÝ MÀN ẢI -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'stages'" class="tab-pane">
        <div class="pane-header">
          <h2>🗺️ Bản Đồ Chiến Dịch (Các Chương)</h2>
          <button class="add-btn" @click="openChapterForm('add')">+ Tạo Chương Mới</button>
        </div>
        
        <table class="admin-table">
          <thead><tr><th>Chương</th><th>Tên Chương</th><th>Số Ải</th><th>Boss Trấn Giữ</th><th>Hành Động</th></tr></thead>
          <tbody>
            <tr v-for="chapter in chaptersList" :key="chapter._id">
              <td style="font-size: 20px; font-weight: bold;">{{ chapter.chapterNumber }}</td>
              <td style="font-weight: bold; color: #f1c40f;">{{ chapter.title }}</td>
              <td>{{ chapter.stages.length }}/10</td>
              <td style="color: #e74c3c; font-weight: bold;">{{ chapter.bossId?.name || 'Chưa gắn Boss' }}</td>
              <td>
                <button class="action-btn edit" @click="openChapterForm('edit', chapter)">Sửa</button>
                <button class="action-btn delete" @click="deleteChapter(chapter._id)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ========================================== -->
      <!-- TAB 4: QUẢN LÝ QUÁI VẬT -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'monsters'" class="tab-pane">
        <div class="pane-header">
          <h2>👾 Kho Quái Vật & Boss</h2>
          <button class="add-btn" @click="openMonsterForm('add')">+ Tạo Quái Mới</button>
        </div>

        <div class="monsters-grid">
          <div v-for="monster in monstersList" :key="monster._id" class="monster-card">
            <div class="monster-emoji">{{ monster.emoji }}</div>
            <div class="monster-info">
              <h3>{{ monster.name }}</h3>
              <p>❤️ HP: {{ monster.hp }} | ⚔️ ATK: {{ monster.atk }} | ⚡ SPD: {{ monster.spd }}</p>
              <div v-if="monster.isBoss" style="color: #e74c3c; font-weight: bold; font-size: 12px; margin-top: 5px;">👑 BOSS</div>
            </div>
            <div class="monster-actions" style="margin-top: 15px;">
              <button class="action-btn edit" @click="openMonsterForm('edit', monster)">Sửa</button>
              <button class="action-btn delete" @click="deleteMonster(monster._id)">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP FORM (HIỆN TẠI DÀNH CHO QUÁI VẬT) -->
    <div class="modal-overlay" v-if="isFormOpen" @click.self="closeForm">
      <div class="admin-modal">
        <h3>{{ formMode === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa' }} Quái Vật</h3>
        
        <form @submit.prevent="submitMonster">
          <div class="form-group">
            <label>Tên Quái Vật:</label>
            <input type="text" v-model="monsterForm.name" placeholder="VD: Sói Cuồng Nộ" required>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Icon (Emoji):</label>
              <input type="text" v-model="monsterForm.emoji" placeholder="👺">
            </div>
            <div class="form-group" style="display: flex; align-items: flex-start; gap: 10px; margin-top: 30px;">
              <input type="checkbox" v-model="monsterForm.isBoss" style="width: 20px; height: 20px;">
              <label style="color: #e74c3c;">Đây là Boss</label>
            </div>
          </div>

          <div class="form-grid stats-grid">
            <div class="form-group"><label>❤️ HP</label><input type="number" v-model="monsterForm.hp"></div>
            <div class="form-group"><label>⚔️ ATK</label><input type="number" v-model="monsterForm.atk"></div>
            <div class="form-group"><label>⚡ SPD</label><input type="number" v-model="monsterForm.spd"></div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn cancel" @click="closeForm">Hủy</button>
            <button type="submit" class="btn save">💾 Lưu Dữ Liệu</button>
          </div>
        </form>
      </div>
    </div>

    <!-- POPUP FORM (DÀNH CHO CHƯƠNG) -->
    <div class="modal-overlay" v-if="isFormOpen === 'chapter'" @click.self="closeForm">
      <div class="admin-modal" style="width: 600px; max-height: 90vh; overflow-y: auto;">
        <h3>{{ formMode === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa' }} Chương Cốt Truyện</h3>
        
        <form @submit.prevent="submitChapter">
          <div class="form-grid">
            <div class="form-group">
              <label>Chương số:</label>
              <input type="number" v-model="chapterForm.chapterNumber" required>
            </div>
            <div class="form-group">
              <label>Tên Chương:</label>
              <input type="text" v-model="chapterForm.title" placeholder="VD: Rừng Sương Mù" required>
            </div>
          </div>

          <div class="form-group" style="background: #22222d; padding: 15px; border-radius: 8px;">
            <label style="color: #e74c3c;">👹 Chọn Boss Ải 10:</label>
            <select v-model="chapterForm.bossId" style="width: 100%;">
              <option value="">-- Không có Boss --</option>
              <!-- Lọc danh sách quái chỉ lấy những con được tick là Boss -->
              <option v-for="boss in monstersList.filter(m => m.isBoss)" :key="boss._id" :value="boss._id">
                {{ boss.emoji }} {{ boss.name }} (Cấp độ đe dọa: {{ boss.atk }})
              </option>
            </select>
          </div>

          <label style="color: #f1c40f; margin-top: 25px; display: block; border-bottom: 1px solid #333; padding-bottom: 10px;">
            Thiết lập 10 Ải & Quái vật xuất hiện:
          </label>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div v-for="(stage, index) in chapterForm.stages" :key="index" style="background: #1a1a24; padding: 12px; border-radius: 8px; border: 1px solid #2a2a35;">
                <div style="font-size: 13px; color: #aaa; margin-bottom: 8px; font-weight: bold;">
                  Ải {{ index + 1 }} {{ index === 9 ? '👑 (BOSS)' : '' }}
                </div>
                
                <input type="text" v-model="stage.name" placeholder="Tên ải..." style="width: 100%; margin-bottom: 10px; font-size: 13px; padding: 8px; border-radius: 4px; background: #22222d; border: 1px solid #444; color: white;">
                
                <!-- Khu vực 1: Hiển thị đội hình đã chọn (Có thể trùng lặp thoải mái) -->
                <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Đội hình quái (Click để xóa):</label>
                <div style="display: flex; flex-wrap: wrap; gap: 5px; min-height: 35px; background: #0f0f13; padding: 5px; border-radius: 4px; border: 1px dashed #444; margin-bottom: 10px;">
                  <div 
                    v-for="(monsterId, mIndex) in stage.monsters" 
                    :key="'selected-' + index + '-' + mIndex"
                    @click="stage.monsters.splice(mIndex, 1)"
                    style="background: #2a2a35; border: 1px solid #e74c3c; border-radius: 4px; padding: 2px 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px;"
                    title="Click để xóa khỏi ải"
                  >
                    {{ getMonsterEmoji(monsterId) }} <span style="color: #e74c3c; font-weight: bold;">×</span>
                  </div>
                  <span v-if="stage.monsters.length === 0" style="color: #555; font-size: 11px; padding-top: 4px;">Chưa có quái...</span>
                </div>

                <!-- Khu vực 2: Kho quái vật để click thêm vào -->
                <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Thêm quái vào ải:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                  <div 
                    v-for="monster in monstersList.filter(m => !m.isBoss)" 
                    :key="'avail-' + monster._id"
                    @click="stage.monsters.push(monster._id)"
                    style="background: #22222d; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 14px; cursor: pointer; transition: 0.2s;"
                    title="Click để thêm vào đội hình"
                    onmouseover="this.style.borderColor='#f1c40f'"
                    onmouseout="this.style.borderColor='#555'"
                  >
                    {{ monster.emoji }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div v-for="(stage, index) in chapterForm.stages" :key="index" class="form-group" style="margin-bottom: 0;">
              <input type="text" v-model="stage.name" :placeholder="`Tên ải ${index + 1}`" style="font-size: 12px; padding: 8px;">
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn cancel" @click="closeForm">Hủy</button>
            <button type="submit" class="btn save">💾 Lưu Chương Này</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* =====================================
   BỐ CỤC CHÍNH
   ===================================== */
.admin-layout { display: flex; height: 100vh; background: #0f0f13; color: #ddd; overflow: hidden; }

/* CỘT TRÁI (SIDEBAR) */
.sidebar { width: 280px; background: #1a1a24; border-right: 1px solid #2a2a35; display: flex; flex-direction: column; overflow-y: auto; }
.brand-box { padding: 20px; border-bottom: 1px solid #2a2a35; margin-bottom: 10px; }
.brand-box h2 { color: #f1c40f; margin: 0 0 5px 0; }
.brand-box p { color: #888; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }

.menu-item { padding: 15px 20px; cursor: pointer; color: #aaa; font-weight: bold; border-left: 4px solid transparent; transition: 0.2s; text-decoration: none; display: block; }
.menu-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.menu-item.active { background: rgba(241, 196, 15, 0.1); border-left-color: #f1c40f; color: #f1c40f; }
.menu-item.back-btn { color: #e74c3c; border-top: 1px solid #333; }

.mini-card-section { padding: 20px; margin-top: auto; border-top: 1px solid #2a2a35; }
.list-title { color: #fff; font-size: 14px; margin-bottom: 15px; }
.mini-card-list { list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto; }
.mini-card-item { background: #22222d; padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
.mini-card-item:hover { border-color: #f1c40f; background: #2a2a35; }
.rarity-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-right: 10px; font-weight: bold; }
.card-name { flex: 1; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.edit-icon { font-size: 12px; opacity: 0.5; }
.mini-card-item:hover .edit-icon { opacity: 1; }

/* CỘT PHẢI (MAIN CONTENT) */
.main-content { flex: 1; padding: 30px; overflow-y: auto; }
.header, .pane-header { border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
.header h1, .pane-header h2 { margin: 0; color: #fff; }

/* =====================================
   FORM DÙNG CHUNG (CARD & BANNER)
   ===================================== */
.form-section { background: #1a1a24; padding: 25px; border-radius: 12px; border: 1px solid #2a2a35; margin-bottom: 25px; }
.form-section h3 { margin: 0 0 20px 0; color: #f1c40f; border-bottom: 1px dashed #444; padding-bottom: 10px; }
.form-group { display: flex; flex-direction: column; margin-bottom: 15px; }
.form-group label { margin-bottom: 8px; font-weight: bold; color: #ccc; font-size: 14px; }
.form-group input, .form-group select, .form-group textarea { background: #22222d; border: 1px solid #444; color: white; padding: 12px; border-radius: 8px; outline: none; transition: 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #f1c40f; }

.basic-info-layout { display: flex; gap: 30px; }
.basic-info-left { flex: 2; display: flex; flex-direction: column; }
.basic-info-right { flex: 1; display: flex; flex-direction: column; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.stats-grid { grid-template-columns: repeat(3, 1fr); }

/* Vùng Upload Ảnh */
.upload-area { flex: 1; border: 2px dashed #555; border-radius: 12px; background: #22222d; display: flex; justify-content: center; align-items: center; cursor: pointer; overflow: hidden; min-height: 200px; transition: 0.2s; }
.upload-area:hover { border-color: #f1c40f; }
.upload-area img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { text-align: center; color: #777; }
.upload-placeholder span { font-size: 40px; }
.remove-img-btn { margin-top: 10px; padding: 10px; background: #c0392b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }

/* Nút Submit */
.save-btn { padding: 15px; background: #27ae60; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.save-btn:hover { background: #2ecc71; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4); }
.save-btn.cancel { background: #7f8c8d; }
.save-btn.banner-btn { background: #9b59b6; width: 100%; margin-top: 20px; }

/* Kỹ năng */
.skill-group { background: #22222d; padding: 15px; border-radius: 8px; border-left: 4px solid; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px; }
.skill-group input { background: #1a1a24; border: 1px solid #333; }
.skill-header { font-weight: bold; font-size: 13px; text-transform: uppercase; }
.skill-header.normal { color: #3498db; }
.skill-header.active { color: #e67e22; }
.skill-header.ultimate { color: #e74c3c; }

/* Banner đặc thù */
.checkbox-group { flex-direction: row; align-items: center; gap: 15px; }
.checkbox-group input { width: 20px; height: 20px; cursor: pointer; }
.card-selector { background: #22222d; padding: 20px; border-radius: 8px; border: 1px solid #333; }
.note { font-size: 13px; color: #e74c3c; margin-top: 0; }
.checkbox-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.check-item { background: #1a1a24; padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; border: 1px solid #333; }
.check-item:hover { border-color: #f1c40f; }

/* =====================================
   BẢNG ẢI & LƯỚI QUÁI VẬT
   ===================================== */
.add-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.add-btn:hover { background: #2980b9; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3); }

.admin-table { width: 100%; border-collapse: collapse; background: #1a1a24; border-radius: 12px; overflow: hidden; }
.admin-table th, .admin-table td { padding: 15px; text-align: left; border-bottom: 1px solid #2a2a35; }
.admin-table th { background: #22222d; color: #aaa; text-transform: uppercase; font-size: 13px; }
.admin-table tbody tr:hover { background: rgba(255,255,255,0.05); }

.monsters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.monster-card { background: #1a1a24; border: 1px solid #2a2a35; border-radius: 12px; padding: 25px; text-align: center; transition: 0.2s; }
.monster-card:hover { transform: translateY(-5px); border-color: #f1c40f; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
.monster-emoji { font-size: 60px; width: 100px; height: 100px; margin: 0 auto 15px; background: #22222d; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #444; }
.monster-info h3 { margin: 0 0 10px 0; color: #e74c3c; }
.monster-info p { color: #ccc; font-size: 14px; background: #111; padding: 8px; border-radius: 6px; margin: 0 0 15px 0; }

.action-btn { border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-right: 5px; font-size: 12px; color: white; }
.action-btn.edit { background: #2980b9; }
.action-btn.delete { background: #c0392b; }

/* POPUP */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
.admin-modal { background: #1e1e24; padding: 30px; border-radius: 12px; width: 400px; border: 2px solid #f1c40f; box-shadow: 0 15px 30px rgba(0,0,0,0.5); }
.admin-modal h3 { margin: 0 0 10px 0; color: #fff; font-size: 22px; border-bottom: 1px solid #333; padding-bottom: 15px; }
.modal-actions { display: flex; gap: 15px; margin-top: 25px; }
.btn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; }
.btn.cancel { background: #555; }
.btn.save { background: #e67e22; }
</style>