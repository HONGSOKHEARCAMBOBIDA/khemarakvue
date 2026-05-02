import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { pinia } from '../main'

// Import layouts
import MainLayout from '../layouts/MainLayout.vue'

// Import pages
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/login.vue'
import Profile from '../views/Profile.vue'
import Users from '../views/Users.vue'
import Reports from '../views/Reports.vue'
import AttendanceCreate from '../components/AttendanceCreate.vue'
import AttendanceView from '../views/AttendanceView.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { title: 'Home' }
      },
      {
        path: 'attendanceview',
        name: 'attendanceView',
        component: AttendanceView,
        meta: {title: 'AttendanceView',requiresAuth: true}
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: AttendanceCreate,
        meta: {title: 'Attendance',requiresAuth: true}
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: { title: 'About' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: 'Profile' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: 'Users', requiresAuth: true }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: Reports,
        meta: { title: 'Reports', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from) => {
  const auth = useAuthStore(pinia)
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  
  // Check if route is for guests only (like login page)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/attendance'
  }
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - My App`
  }
  
  return true
})

export default router