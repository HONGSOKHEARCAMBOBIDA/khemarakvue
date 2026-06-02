import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { pinia } from '../main'
import { useAuthStore1 } from '../stores/user.js'
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
import Leave from '../views/Leave.vue'
import Loan from '../views/loan.vue'
import Payroll from '../views/Payroll.vue'
import PayrollList from '../views/PayrollList.vue'
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
        redirect: '/5a3bcbcef5b4e4d069cf81db423a5de624c6d0bc32c227cd32d4bc9ee9145ec1'
      },
      {
        path: '4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942',
        name: 'Home',
        component: Home,
        meta: { title: 'Home' }
      },
      {
        path: '91e6236168751f05de4ac5f4bbf867fe8d955925d44f356046854829644d0baf',
        name: 'attendanceView',
        component: AttendanceView,
        meta: {title: 'AttendanceView',requiresAuth: true}
      },
      {
        path: '5a3bcbcef5b4e4d069cf81db423a5de624c6d0bc32c227cd32d4bc9ee9145ec1',
        name: 'Attendance',
        component: AttendanceCreate,
        meta: {title: 'Attendance',requiresAuth: true}
      },
      {
        path: 'af193190b8d3cd14103e20e900378a2b76414ff6428065f3f8539b3577b22fdf',
        name: 'Leave',
        component: Leave,
        meta: {title: 'Leave',requiresAuth: true}
      },
      {
        path: '472bbf14923e2e7cefd8529825c401e8d1a2937b96dd697a6d1c75c53e6cca3a',
        name: 'Loan',
        component: Loan,
        meta: {title: 'Loan',requiresAuth: true}
      },
      {
        path: '60f91a742458ae606572f40dd7df0a128e554acb023f6989fe5148872648fc56',
        name: 'Payroll',
        component: Payroll
      },
      {
        path: 'bf43e564ebc1b828180e6e4517d872bf71e80b431caeec6b5451e9254a0c6ee9',
        name: 'PayrollList',
        component: PayrollList,
        meta: {title: 'Payroll',requiresAuth:true}
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
        path: '7dfb4cf67742cb0660305e56ef816c53fcec892cae7f6ee39b75f34e659d672c',
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
  const auth = useAuthStore1(pinia)
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  
  // Check if route is for guests only (like login page)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/5a3bcbcef5b4e4d069cf81db423a5de624c6d0bc32c227cd32d4bc9ee9145ec1'
  }
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title}`
  }
  
  return true
})

export default router