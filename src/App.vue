<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="game-container">
    <!-- 1. HEADER: Thanh thông tin tài khoản -->
    <header class="top-bar">
      <div class="player-profile">
        <div class="avatar">🧙‍♂️</div>
        <div class="info">
          <span class="name">Pepy</span>
          <span class="level">Lv. 10</span>
        </div>
      </div>
      
      <div class="resources">
        <div class="resource-item">⚡ 50/50</div>
        <div class="resource-item">💰 1,500</div>
        <div class="resource-item">💎 300</div>
      </div>
    </header>

    <div class="layout-body">
      <!-- 2. NAVIGATION: Menu điều hướng bên trái -->
      <nav class="side-menu">
        <RouterLink to="/" class="menu-btn">🏠 Trang Chủ</RouterLink>
        <RouterLink to="/phieu-luu" class="menu-btn">🗺️ Phiêu Lưu</RouterLink>
        <RouterLink to="/che-do" class="menu-btn">⚔️ Chế Độ</RouterLink>
        <RouterLink to="/nhan-vat" class="menu-btn">🎴 Nhân Vật</RouterLink>
      </nav>

      <!-- 3. MAIN CONTENT: Khu vực hiển thị nội dung chính -->
      <main class="content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Reset cơ bản để full màn hình */
:global(body) {
  margin: 0;
  padding: 0;
  background-color: #121212; /* Màu nền tối chuẩn game */
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Cao bằng 100% màn hình */
}

/* --- Style cho HEADER --- */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #1e1e24;
  padding: 0 20px;
  border-bottom: 2px solid #3a3a45;
}

.player-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  font-size: 30px;
  background: #3a3a45;
  border-radius: 50%;
  padding: 5px;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: bold;
  font-size: 16px;
  color: #f1c40f; /* Màu vàng nổi bật */
}

.level {
  font-size: 12px;
  color: #aaa;
}

.resources {
  display: flex;
  gap: 15px;
}

.resource-item {
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  border: 1px solid #3a3a45;
}

/* --- Style cho PHẦN THÂN (Menu + Content) --- */
.layout-body {
  display: flex;
  flex: 1; /* Chiếm hết phần chiều cao còn lại */
  overflow: hidden;
}

/* --- Style cho MENU TRÁI --- */
.side-menu {
  width: 200px;
  background-color: #1a1a1f;
  border-right: 2px solid #3a3a45;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
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

/* Hiệu ứng khi nút đang được chọn */
.router-link-active {
  background-color: #2c3e50;
  color: #42b983; /* Màu xanh đặc trưng của Vue */
  border-left: 4px solid #42b983;
}

/* --- Style cho MAIN CONTENT --- */
.content-area {
  flex: 1; /* Chiếm hết không gian còn lại bên phải */
  padding: 20px;
  background-color: #121212;
  overflow-y: auto;
}
</style>