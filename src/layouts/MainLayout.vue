<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">សាកលវិទ្យាល័យខេមរៈ ខេត្តបាត់ដំបង</div>
          <div class="nav-buttons desktop-nav">
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="navigateTo('/users')">បង្កេីតអ្នកប្រេីប្រាស់ថ្មី</el-button>
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="navigateTo('/home')">បញ្ជីបុគ្គលិក</el-button>
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="navigateTo('/attendanceview')">បញ្ជីវត្តមាន</el-button>
            <el-button type="primary" plain @click="navigateTo('/leave')">ច្បាប់</el-button>
            <el-button v-if="hasAdminOrHR" type="warning" plain @click="navigateTo('/loan')">កម្ចី</el-button>     
            <el-button type="primary" v-if="hasAdminOrHR" plain @click="navigateTo('/payroll')">បេីកប្រាក់ខែ</el-button>
          </div>

          <div class="header-right">
            <div class="user-info">
              <el-dropdown @command="handleCommand">
                <span class="user-dropdown">
                  {{ auth.user?.name || 'User' }}
                  <el-icon><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">Profile</el-dropdown-item>
                    <el-dropdown-item command="settings">Settings</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>Logout</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <el-button
              class="hamburger-btn"
              :icon="menuOpen ? Close : Expand"
              @click="menuOpen = !menuOpen"
              text
            />
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="menuOpen" class="mobile-nav">
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="mobileNavigateTo('/users')">បង្កេីតអ្នកប្រេីប្រាស់ថ្មី</el-button>
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="mobileNavigateTo('/home')">បញ្ជីបុគ្គលិក</el-button>
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="mobileNavigateTo('/attendanceview')">បញ្ជីវត្តមាន</el-button>
            <el-button type="primary" plain @click="mobileNavigateTo('/leave')">ច្បាប់</el-button>
          </div>
        </transition>
      </el-header>

      <el-main>
        <router-view />
      </el-main>

      <el-footer>
        <div class="footer-content">
          ប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្ស | រក្សាសិទ្ធិគ្រប់យ៉ាង © 2026
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ArrowDown, Expand, Close } from '@element-plus/icons-vue'
import { useAuthStore1 } from '../stores/user'
import { computed, ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()
const authstore = useAuthStore1()
const menuOpen = ref(false)

const navigateTo = (path) => {
  router.push(path)
}

const mobileNavigateTo = (path) => {
  menuOpen.value = false
  router.push(path)
}

const hasAdminOrHR = computed(() => {
  const parts = authstore.parts ?? []
  return parts.some(p => p.part_name === 'Admin' || p.part_name === 'HR')
})

const handleCommand = (command) => {
  if (command === 'logout') {
    auth.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  }
}
</script>

<style scoped>
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: auto !important;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  gap: 12px;
}

.logo {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  white-space: nowrap;
  flex-shrink: 0;
}

.desktop-nav {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.desktop-nav .el-button {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.user-info {
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
}

.hamburger-btn {
  display: none;
  font-size: 22px;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0 14px;
  border-top: 1px solid #e4e7ed;
}

.mobile-nav .el-button {
  width: 100%;
  margin: 0;
  justify-content: flex-start;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.el-footer {
  background-color: #409eff;
  text-align: center;
  line-height: 60px;
  color: white;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.el-button + .el-button {
  margin-left: 0;
}

@media (max-width: 900px) {
  .logo {
    font-size: 14px;
  }

  .desktop-nav .el-button {
    font-size: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 640px) {
  .desktop-nav {
    display: none;
  }

  .hamburger-btn {
    display: inline-flex;
  }

  .logo {
    font-size: 13px;
  }

  .el-main {
    padding: 12px;
  }
}
</style>