<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">សាកលវិទ្យាល័យខេមរៈ ខេត្តបាត់ដំបង</div>
          <div class="nav-buttons">
            <el-button type="primary" plain @click="navigateTo('/users')">បង្កេីតអ្នកប្រេីប្រាស់ថ្មី</el-button>
          </div>
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
        </div>
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
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

const navigateTo = (path) => {
  router.push(path)
}

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
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  white-space: nowrap;
}

.nav-buttons {
  flex: 1;
  display: flex;
  gap: 5px; /* Small gap between buttons */
}

.nav-buttons .el-button {
  margin: 0; /* Remove default margin */
}

.user-info {
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
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

/* Remove default button spacing */
.el-button + .el-button {
  margin-left: 0;
}
</style>