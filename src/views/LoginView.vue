<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoginMode = ref(true) // true = Đăng nhập, false = Đăng ký

const form = ref({
  username: '',
  password: ''
})

// Chuyển đổi giữa 2 chế độ
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  form.value.username = ''
  form.value.password = ''
}

// Xử lý khi bấm nút (Sau này sẽ gọi API Backend ở đây)
const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    alert('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!')
    return
  }

  try {
    // 1. Xác định đang là Đăng nhập hay Đăng ký để gọi đúng API
    const url = isLoginMode.value 
      ? 'http://localhost:5000/api/login' 
      : 'http://localhost:5000/api/register'

    // 2. Gửi hàng đi
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    // 3. Xử lý phản hồi
    if (response.ok) {
      if (isLoginMode.value) {
        // Nếu đăng nhập thành công -> Lưu dữ liệu người chơi vào trình duyệt và vào sảnh
        alert(`Chào mừng ${data.user.username} trở lại!`)
        localStorage.setItem('currentUser', JSON.stringify(data.user)) // Lưu vào bộ nhớ cục bộ
        router.push('/home')
      } else {
        // Nếu đăng ký thành công -> Báo hỉ và chuyển sang tab đăng nhập
        alert('🎉 ' + data.message)
        isLoginMode.value = true
        form.value.password = '' // Xóa trắng ô password cho an toàn
      }
    } else {
      // Nếu server báo lỗi (Sai pass, trùng tên...)
      alert('❌ ' + data.message)
    }
  } catch (error) {
    console.error(error)
    alert('Không thể kết nối đến máy chủ!')
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- Logo hoặc Tên Game -->
      <div class="brand">
        <h1>🃏 Liên Giới Kỳ</h1>
        <p>Bước vào thế giới thẻ bài chiến thuật</p>
      </div>

      <!-- Tabs chuyển đổi -->
      <div class="auth-tabs">
        <button :class="{ active: isLoginMode }" @click="isLoginMode = true">Đăng Nhập</button>
        <button :class="{ active: !isLoginMode }" @click="isLoginMode = false">Đăng Ký</button>
      </div>

      <!-- Form nhập liệu -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label>Tên tài khoản</label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="Nhập tên đăng nhập..."
            autocomplete="off"
          >
        </div>

        <div class="input-group">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="Nhập mật khẩu..."
          >
        </div>

        <button type="submit" class="submit-btn">
          {{ isLoginMode ? 'Vào Game Ngay' : 'Tạo Tài Khoản' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Giao diện phủ toàn màn hình */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: radial-gradient(circle at center, #2c3e50 0%, #000000 100%);
  position: fixed;
  top: 0; left: 0; z-index: 9999; /* Đè lên mọi thứ khác */
}

/* Hộp form */
.auth-box {
  background: #1e1e24;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.5);
  border: 1px solid #3a3a45;
}

.brand {
  text-align: center;
  margin-bottom: 30px;
}

.brand h1 {
  color: #f1c40f;
  margin: 0 0 10px 0;
  font-size: 32px;
  text-shadow: 0 2px 10px rgba(241, 196, 15, 0.3);
}

.brand p {
  color: #aaa;
  margin: 0;
  font-size: 14px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  margin-bottom: 25px;
  background: #111;
  border-radius: 8px;
  padding: 5px;
}

.auth-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #888;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.auth-tabs button.active {
  background: #3498db;
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

/* Inputs */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #ddd;
  font-size: 13px;
  font-weight: bold;
}

.input-group input {
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #111;
  color: white;
  font-size: 15px;
  transition: border 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.4);
}

/* Nút Submit */
.submit-btn {
  margin-top: 10px;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(230, 126, 34, 0.4);
}

.submit-btn:active {
  transform: translateY(2px);
}
</style>