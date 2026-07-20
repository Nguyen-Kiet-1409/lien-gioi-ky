<script setup>
// Bổ sung thêm onUnmounted vào dòng import
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router' 

const route = useRoute()
const router = useRouter() 

// Biến lưu trữ thông tin người chơi
const playerInfo = ref({
  username: 'Khách',
  level: 1,
  gold: 0,
  diamonds: 0
})

// Hàm đọc dữ liệu từ LocalStorage
const loadPlayerData = () => {
  const savedData = localStorage.getItem('currentUser')
  if (savedData) {
    playerInfo.value = JSON.parse(savedData)
  }
}

// Chạy hàm khi trang vừa load
onMounted(() => {
  loadPlayerData()
  
  // 👉 GẮN ĐÀI RADIO: Lắng nghe sự kiện 'wallet-updated' từ CharacterView gửi sang
  window.addEventListener('wallet-updated', loadPlayerData)
})

// 👉 TẮT ĐÀI: Gỡ bỏ lắng nghe khi component bị hủy để máy không bị lag
onUnmounted(() => {
  window.removeEventListener('wallet-updated', loadPlayerData)
})

// Theo dõi khi chuyển trang thì load lại dữ liệu
watch(route, () => {
  loadPlayerData()
})

// HÀM ĐĂNG XUẤT
const handleLogout = () => {
  if(confirm('Bạn có chắc chắn muốn thoát game không?')) {
    localStorage.removeItem('currentUser') // Xé vé
    playerInfo.value = { username: 'Khách', level: 1, gold: 0, diamonds: 0 } // Reset thông tin
    router.push('/login') // Đá về màn hình đăng nhập
  }
}
</script>

<template>
  <div class="game-container">
    <!-- HEADER -->
    <header class="top-bar" v-if="route.path !== '/login' && route.path !== '/admin'">
      <div class="player-profile">
        <div class="avatar">🧙‍♂️</div>
        <div class="info">
          <span class="name">{{ playerInfo.username }}</span>
          <span class="level">Lv. {{ playerInfo.level || 1 }}</span>
        </div>
      </div>
      
      <div class="resources">
        <div class="resource-item">⚡ 50/50</div>
        <!-- Ép hiển thị đúng biến gold và diamonds -->
        <div class="resource-item">💰 {{ playerInfo.gold !== undefined ? playerInfo.gold : 0 }}</div>
        <div class="resource-item">💎 {{ playerInfo.diamonds !== undefined ? playerInfo.diamonds : 0 }}</div>
      </div>
    </header>

    <div class="layout-body">
      <!-- SIDE MENU -->
      <nav class="side-menu" v-if="route.path !== '/login' && route.path !== '/admin'">
        <div class="menu-links">
          <RouterLink to="/home" class="menu-btn">🏠 Trang Chủ</RouterLink>
          <RouterLink to="/phieu-luu" class="menu-btn">🗺️ Phiêu Lưu</RouterLink>
          <RouterLink to="/che-do" class="menu-btn">⚔️ Chế Độ</RouterLink>
          <RouterLink to="/nhan-vat" class="menu-btn">🎴 Nhân Vật</RouterLink>
        </div>

        <!-- NÚT ĐĂNG XUẤT NẰM Ở ĐÁY -->
        <button class="logout-btn" @click="handleLogout">🚪 Đăng Xuất</button>
      </nav>

      <!-- MAIN CONTENT -->
      <main class="content-area" :style="(route.path === '/login' || route.path === '/admin') ? { padding: 0 } : {}">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Reset cơ bản */
:global(body) {
  margin: 0;
  padding: 0;
  background-color: #121212;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* HEADER */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #1e1e24;
  padding: 0 20px;
  border-bottom: 2px solid #3a3a45;
}

.player-profile { display: flex; align-items: center; gap: 10px; }
.avatar { font-size: 30px; background: #3a3a45; border-radius: 50%; padding: 5px; }
.info { display: flex; flex-direction: column; }
.name { font-weight: bold; font-size: 16px; color: #f1c40f; }
.level { font-size: 12px; color: #aaa; }

.resources { display: flex; gap: 15px; }
.resource-item {
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  border: 1px solid #3a3a45;
}

/* PHẦN THÂN */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* MENU TRÁI */
.side-menu {
  width: 200px;
  background-color: #1a1a1f;
  border-right: 2px solid #3a3a45;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  justify-content: space-between; /* Đẩy nội dung ra 2 đầu (Menu ở trên, Nút ở dưới) */
}

.menu-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-btn {
  text-decoration: none;
  color: #ccc;
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.2s;
}

.menu-btn:hover {
  background-color: #3a3a45;
  color: white;
  transform: translateX(5px);
}

.router-link-active {
  background-color: #2c3e50;
  color: #42b983;
  border-left: 4px solid #42b983;
}

/* NÚT ĐĂNG XUẤT MỚI */
.logout-btn {
  background-color: #c0392b; /* Màu đỏ nguy hiểm */
  color: white;
  border: none;
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  text-align: left;
  font-size: 15px;
  font-family: inherit;
}

.logout-btn:hover {
  background-color: #e74c3c;
  transform: translateX(5px); /* Trượt nhẹ sang phải giống các menu khác */
}

/* MAIN CONTENT */
.content-area {
  flex: 1;
  padding: 20px;
  background-color: #121212;
  overflow-y: auto;
}
</style>