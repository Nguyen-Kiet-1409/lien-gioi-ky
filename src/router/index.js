import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdventureView from '../views/AdventureView.vue' // Import trang mới
import ModesView from '../views/ModesView.vue'
import CharactersView from '../views/CharactersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/phieu-luu',
      name: 'adventure',
      component: AdventureView // Gắn thành phần vào đường dẫn
    },
    {
      path: '/che-do',
      name: 'modes',
      component: ModesView // Gắn thành phần vào đường dẫn
    },
    {
      path: '/nhan-vat',
      name: 'characters',
      component: CharactersView
    }
  ]
})

export default router