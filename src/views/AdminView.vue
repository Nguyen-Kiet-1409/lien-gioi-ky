<script setup>
import { ref } from 'vue'

// Dữ liệu trống để nhập thẻ bài mới (Khớp 100% với Card Model Backend)
const newCard = ref({
  name: '',
  image: '',
  rarity: 'R',
  type: 'Đấu Sĩ',
  color: '#bdc3c7',
  stars: 1,
  lore: '',
  stats: { hp: 1000, atk: 100, spd: 50 },
  skills: {
    normal: { name: '', desc: '' },
    active: { name: '', desc: '' },
    ultimate: { name: '', desc: '' }
  }
})

// Danh sách thẻ bài giả lập (Sau này sẽ lấy từ Database lên)
const cardList = ref([
  { name: 'Thánh Nữ Ánh Sáng', rarity: 'SSR', type: 'Hỗ Trợ' },
  { name: 'Hiệp Sĩ Rừng Xanh', rarity: 'SR', type: 'Đấu Sĩ' }
])

// Biến để móc vào cái thẻ <input type="file">
const fileInput = ref(null)

// Hàm mở cửa sổ chọn file khi click vào cái khung nét đứt
const triggerFileInput = () => {
  fileInput.value.click()
}

// Hàm xử lý khi người dùng đã chọn xong ảnh từ máy tính
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Giới hạn dung lượng ảnh (Khuyên dùng dưới 2MB để Database đỡ nặng)
  if (file.size > 2 * 1024 * 1024) {
    alert('Vui lòng chọn ảnh nhẹ hơn 2MB để hệ thống chạy mượt nhé!')
    return
  }

  // Phép thuật FileReader biến ảnh thành chuỗi mã (Base64)
  const reader = new FileReader()
  reader.onload = (e) => {
    // Lưu thẳng đoạn mã này vào biến image, trình duyệt sẽ tự hiểu nó là hình ảnh
    newCard.value.image = e.target.result 
  }
  reader.readAsDataURL(file)
}

const submitCard = async () => {
  if (!newCard.value.name) {
    alert("Vui lòng nhập tên nhân vật!")
    return
  }
  
  try {
    // Dùng fetch để đóng gói dữ liệu và gửi tới Cổng số 5000 của Backend
    const response = await fetch('http://localhost:5000/api/cards', {
      method: 'POST', // Phương thức gửi dữ liệu lên
      headers: {
        'Content-Type': 'application/json' // Báo cho server biết đây là file JSON
      },
      body: JSON.stringify(newCard.value) // Biến cái Object thẻ bài thành chữ JSON
    })

    // Đọc phản hồi từ Backend trả về
    const data = await response.json()

    if (response.ok) {
      alert(`🎉 Thành công! Thẻ bài ${newCard.value.name} đã hạ cánh an toàn vào Database!`)
      
      // Thêm ngay thẻ vừa tạo vào danh sách bên trái cho ngầu
      cardList.value.push({
        name: newCard.value.name,
        rarity: newCard.value.rarity,
        type: newCard.value.type
      })

      // Reset lại form để tạo tướng tiếp theo
      newCard.value.name = ''
      newCard.value.image = ''
      newCard.value.lore = ''
      // (Bạn có thể cho reset thêm các chỉ số nếu muốn)
      
    } else {
      alert('❌ Lỗi từ server: ' + data.message)
    }
  } catch (error) {
    console.error(error)
    alert('❌ Không thể kết nối tới Backend! Server đã bật chưa?')
  }
}
</script>

<template>
  <div class="admin-layout">
    <!-- Cột trái: Quản lý danh sách -->
    <div class="sidebar">
      <h2>🛠️ Admin Panel</h2>
      <div class="menu-item active">Thêm Thẻ Bài Mới</div>
      <div class="menu-item">Quản lý Tài Khoản</div>
      <div class="menu-item">Cài đặt Game</div>

      <h3 class="list-title">Thẻ bài đã tạo:</h3>
      <ul class="mini-card-list">
        <li v-for="(card, index) in cardList" :key="index">
          <span class="rarity-tag" :class="card.rarity">{{ card.rarity }}</span>
          {{ card.name }}
        </li>
      </ul>
    </div>

    <!-- Cột phải: Khung nhập liệu (Form) -->
    <div class="main-content">
      <div class="header">
        <h1>Tạo Thẻ Bài Mới (Tạo Data Gốc)</h1>
      </div>

      <form class="create-form" @submit.prevent="submitCard">
        <!-- Phần 1: Thông tin cơ bản -->
        <!-- Phần 1: Thông tin cơ bản -->
        <div class="form-section">
          <h3>1. Thông tin cơ bản</h3>
          
          <div class="basic-info-layout">
            <!-- Cột trái (70%): Thông tin nhập liệu -->
            <div class="basic-info-left">
              <div class="form-grid">
                <div class="form-group">
                  <label>Tên nhân vật</label>
                  <input type="text" v-model="newCard.name" placeholder="VD: Ma Tôn Hắc Ám">
                </div>

                <div class="form-group">
                  <label>Độ hiếm</label>
                  <select v-model="newCard.rarity">
                    <option value="R">R (Xám)</option>
                    <option value="SR">SR (Tím)</option>
                    <option value="SSR">SSR (Vàng)</option>
                    <option value="UR">UR (Đỏ)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Hệ / Loại</label>
                  <select v-model="newCard.type">
                    <option value="Đấu Sĩ">Đấu Sĩ</option>
                    <option value="Pháp Sư">Pháp Sư</option>
                    <option value="Hỗ Trợ">Hỗ Trợ</option>
                    <option value="Sát Thủ">Sát Thủ</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Mã màu (Hex)</label>
                  <input type="color" v-model="newCard.color" class="color-picker">
                </div>
              </div>
              
              <div class="form-group full-width" style="margin-top: 15px; flex: 1;">
                <label>Cốt truyện / Tiểu sử</label>
                <textarea v-model="newCard.lore" style="height: 100%; min-height: 80px;" placeholder="Nhập tiểu sử nhân vật..."></textarea>
              </div>
            </div>

            <!-- Cột phải (30%): Khung Ảnh Preview phong cách CMS -->
            <div class="basic-info-right">
              <label>Ảnh đại diện (Click để tải lên)</label>
              
              <!-- Thêm sự kiện @click="triggerFileInput" vào khung này -->
              <div class="upload-area" @click="triggerFileInput">
                <img v-if="newCard.image" :src="newCard.image" alt="Character Preview">
                <div v-else class="upload-placeholder">
                  <span class="icon">📁</span>
                  <p>Tải ảnh từ thiết bị</p>
                </div>

                <!-- Thẻ input file thật sự (Bị ẩn đi cho đẹp) -->
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/*" 
                  @change="handleImageUpload" 
                  style="display: none;"
                >
              </div>

              <!-- Nút xóa ảnh nếu lỡ chọn nhầm -->
              <button 
                v-if="newCard.image" 
                class="remove-img-btn" 
                @click.prevent="newCard.image = ''"
              >
                🗑️ Gỡ ảnh
              </button>
            </div>
          </div>
        </div>

        <!-- Phần 2: Chỉ số sinh tồn -->
        <div class="form-section">
          <h3>2. Chỉ số gốc (Cấp 1)</h3>
          <div class="form-grid stats-grid">
            <div class="form-group">
              <label>❤️ Máu (HP)</label>
              <input type="number" v-model="newCard.stats.hp">
            </div>
            <div class="form-group">
              <label>⚔️ Tấn Công</label>
              <input type="number" v-model="newCard.stats.atk">
            </div>
            <div class="form-group">
              <label>⚡ Tốc Độ</label>
              <input type="number" v-model="newCard.stats.spd">
            </div>
          </div>
        </div>

        <!-- Phần 3: Kỹ năng -->
        <div class="form-section">
          <h3>3. Bộ Kỹ Năng</h3>
          
          <div class="skill-group">
            <div class="skill-header normal">Đánh Thường</div>
            <input type="text" v-model="newCard.skills.normal.name" placeholder="Tên chiêu (VD: Chém gió)">
            <input type="text" v-model="newCard.skills.normal.desc" placeholder="Mô tả kỹ năng...">
          </div>

          <div class="skill-group">
            <div class="skill-header active">Kỹ Năng Kích Hoạt</div>
            <input type="text" v-model="newCard.skills.active.name" placeholder="Tên chiêu...">
            <input type="text" v-model="newCard.skills.active.desc" placeholder="Mô tả kỹ năng...">
          </div>

          <div class="skill-group">
            <div class="skill-header ultimate">Tuyệt Kỹ (Ultimate)</div>
            <input type="text" v-model="newCard.skills.ultimate.name" placeholder="Tên chiêu...">
            <input type="text" v-model="newCard.skills.ultimate.desc" placeholder="Mô tả kỹ năng...">
          </div>
        </div>

        <button type="submit" class="save-btn">💾 Xuất Bản Thẻ Bài Lên Server</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #121215;
  color: #eee;
  position: fixed; top: 0; left: 0; z-index: 10000;
}

/* SIDEBAR */
.sidebar {
  width: 250px;
  background: #1a1a1f;
  border-right: 1px solid #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar h2 { margin-top: 0; color: #f1c40f; font-size: 20px; border-bottom: 1px solid #333; padding-bottom: 15px; }
.menu-item { padding: 12px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; color: #aaa; transition: 0.2s; }
.menu-item:hover { background: #25252d; color: #fff; }
.menu-item.active { background: #3498db; color: white; font-weight: bold; }

.list-title { margin-top: 30px; font-size: 14px; color: #888; text-transform: uppercase; }
.mini-card-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex: 1; }
.mini-card-list li { font-size: 13px; padding: 10px 0; border-bottom: 1px dashed #333; display: flex; align-items: center; gap: 8px; }
.rarity-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #000; }
.rarity-tag.SSR { background: #f1c40f; }
.rarity-tag.SR { background: #9b59b6; color: white; }
.rarity-tag.R { background: #bdc3c7; }
.rarity-tag.UR { background: #e74c3c; color: white; }

/* MAIN CONTENT */
.main-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
}

.header h1 { margin-top: 0; color: #fff; font-size: 28px; }

.create-form { max-width: 900px; display: flex; flex-direction: column; gap: 25px; }

.form-section { background: #1e1e24; padding: 20px; border-radius: 12px; border: 1px solid #333; }
.form-section h3 { margin: 0 0 20px 0; color: #3498db; font-size: 18px; border-bottom: 1px solid #333; padding-bottom: 10px; }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.stats-grid { grid-template-columns: repeat(3, 1fr); }

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group.full-width { margin-top: 15px; }

label { font-size: 13px; color: #aaa; font-weight: bold; }
input, select, textarea { 
  padding: 10px; border-radius: 6px; border: 1px solid #444; 
  background: #111; color: #fff; font-family: inherit;
}
input:focus, select:focus, textarea:focus { outline: none; border-color: #3498db; }
.color-picker { padding: 2px; height: 40px; width: 100%; cursor: pointer; }

/* SKILLS */
.skill-group { display: grid; grid-template-columns: 150px 1fr 2fr; gap: 10px; margin-bottom: 10px; align-items: center; }
.skill-header { font-size: 13px; font-weight: bold; padding: 8px; text-align: center; border-radius: 6px; color: white; }
.skill-header.normal { background: #7f8c8d; }
.skill-header.active { background: #2980b9; }
.skill-header.ultimate { background: #c0392b; }

/* BUTTON */
.save-btn { 
  align-self: flex-end; padding: 15px 40px; font-size: 16px; font-weight: bold;
  background: #27ae60; color: white; border: none; border-radius: 8px;
  cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}
.save-btn:hover { background: #2ecc71; transform: translateY(-2px); }
.save-btn:active { transform: translateY(0); }

/* =========================================
   LAYOUT THÔNG TIN CƠ BẢN (70/30)
   ========================================= */
.basic-info-layout {
  display: flex;
  gap: 25px;
  align-items: stretch;
}

.basic-info-left {
  flex: 7; /* Chiếm 7 phần */
  display: flex;
  flex-direction: column;
}

.basic-info-right {
  flex: 3; /* Chiếm 3 phần */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Khung vuông to nét đứt CMS */
.upload-area {
  flex: 1;
  min-height: 180px;
  background: #1a1a1f;
  border: 2px dashed #555;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.upload-area img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Hoặc 'cover' tùy bạn muốn ảnh vừa vặn hay lấp đầy */
  background: #000; /* Nền đen làm nổi bật ảnh */
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-placeholder .icon {
  font-size: 40px;
  opacity: 0.5;
}

.upload-placeholder p {
  margin: 10px 0 0 0;
  font-size: 13px;
  font-weight: bold;
}

.image-url-input {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

/* Thêm vào phần CSS */
.upload-area {
  cursor: pointer; /* Biến con trỏ thành bàn tay khi rê vào khung */
}

.remove-img-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: 0.2s;
  text-align: center;
}

.remove-img-btn:hover {
  background: #e74c3c;
  color: white;
}
</style>