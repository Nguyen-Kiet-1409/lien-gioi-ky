import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdventureView from '../views/AdventureView.vue'
import ModesView from '../views/ModesView.vue'
import CharactersView from '../views/CharactersView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView }, // Trang cổng chính
    { path: '/home', name: 'home', component: HomeView },    // Đổi trang chủ thành /home
    { path: '/phieu-luu', name: 'adventure', component: AdventureView },
    { path: '/che-do', name: 'modes', component: ModesView },
    { path: '/nhan-vat', name: 'characters', component: CharactersView },
    { path: '/admin', name: 'admin', component: AdminView },
    // Thêm vào mảng routes của bạn:
    {
      path: '/test-dps',
      name: 'test-dps',
      component: () => import('../views/TestDPSView.vue')
    },
    {
      path: '/battle',
      name: 'battle',
      component: () => import('../views/BattleView.vue')
    }
  ]
})

// BẢO VỆ CỔNG CHÍNH
router.beforeEach((to, from, next) => {
  // Kiểm tra xem trong túi người dùng có "Vé" (Dữ liệu đăng nhập) chưa?
  const isAuthenticated = localStorage.getItem('currentUser')

  // Nếu muốn vào trang Admin thì tạm thời cứ cho vào tự do (hoặc bạn có thể chặn sau)
  if (to.path === '/admin') {
    next()
    return
  }

  if (to.path !== '/login' && !isAuthenticated) {
    // Trường hợp 1: Mày đi đâu đấy? Chưa đăng nhập mà đòi vào game à? -> Bắt về trang Login
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // Trường hợp 2: Đăng nhập rồi thì ở trong sảnh chơi đi, quay ra cổng Login làm gì nữa? -> Bắt về Home
    next('/home')
  } else {
    // Trường hợp 3: Vé hợp lệ, mời qua!
    next()
  }
})

export default router