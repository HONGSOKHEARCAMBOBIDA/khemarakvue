<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">សាកលវិទ្យាល័យខេមរៈ ខេត្តបាត់ដំបង</div>
          <div class="nav-buttons desktop-nav">
            <el-button type="primary" plain @click="navigateTo('/5a3bcbcef5b4e4d069cf81db423a5de624c6d0bc32c227cd32d4bc9ee9145ec1')">កត់ត្រាវត្តមាន</el-button>
            <el-button  type="primary" plain @click="navigateTo('/4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942')"  :class="{ 'is-active-nav': isActive('/4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942') }">បុគ្គលិក</el-button>
            <el-button  type="primary" plain @click="navigateTo('/91e6236168751f05de4ac5f4bbf867fe8d955925d44f356046854829644d0baf')" :class="{'is-active-nav': isActive('/91e6236168751f05de4ac5f4bbf867fe8d955925d44f356046854829644d0baf')}">វត្តមាន</el-button>
            <el-button  type="primary" plain @click="navigateTo('/af193190b8d3cd14103e20e900378a2b76414ff6428065f3f8539b3577b22fdf')" :class="{'is-active-nav': isActive('/af193190b8d3cd14103e20e900378a2b76414ff6428065f3f8539b3577b22fdf')}">ច្បាប់</el-button>
            <el-button  type="primary" plain @click="navigateTo('/472bbf14923e2e7cefd8529825c401e8d1a2937b96dd697a6d1c75c53e6cca3a')" :class="{'is-active-nav': isActive('/472bbf14923e2e7cefd8529825c401e8d1a2937b96dd697a6d1c75c53e6cca3a')}">កម្ចី</el-button>
            <el-button  type="primary"  plain @click="navigateTo('/bf43e564ebc1b828180e6e4517d872bf71e80b431caeec6b5451e9254a0c6ee9')" :class="{'is-active-nav': isActive('/bf43e564ebc1b828180e6e4517d872bf71e80b431caeec6b5451e9254a0c6ee9')}">ប្រាក់ខែ</el-button>
             
          </div>

          <div class="header-right">
             <el-button type="success" plain @click="calcVisible = true">
    <el-icon><Cpu /></el-icon>
  </el-button>
            <div class="user-info">
              <el-dropdown @command="handleCommand">
               <span class="user-dropdown">
  {{ userlogin.toUpperCase() }}
  <el-icon><arrow-down /></el-icon>
</span>
                <template #dropdown>
                  <el-dropdown-menu>
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
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="navigateTo('/7dfb4cf67742cb0660305e56ef816c53fcec892cae7f6ee39b75f34e659d672c')">បង្កេីតអ្នកប្រេីប្រាស់ថ្មី</el-button>
            <el-button v-if="hasAdminOrHR" type="primary" plain @click="navigateTo('/4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942')">បញ្ជីបុគ្គលិក</el-button>
            <el-button  type="primary" plain @click="navigateTo('/91e6236168751f05de4ac5f4bbf867fe8d955925d44f356046854829644d0baf')">បញ្ជីវត្តមាន</el-button>
            <el-button type="primary" plain @click="navigateTo('/af193190b8d3cd14103e20e900378a2b76414ff6428065f3f8539b3577b22fdf ')">ច្បាប់</el-button>
            <el-button  type="warning" plain @click="navigateTo('/472bbf14923e2e7cefd8529825c401e8d1a2937b96dd697a6d1c75c53e6cca3a')">កម្ចី</el-button>
            <el-button type="primary"  plain @click="navigateTo('/bf43e564ebc1b828180e6e4517d872bf71e80b431caeec6b5451e9254a0c6ee9')">ប្រាក់ខែ</el-button>
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
    <el-dialog v-model="calcVisible" title="គណនា" width="350px" :show-close="true">
    <Calculator />
  </el-dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ArrowDown, Expand, Close } from '@element-plus/icons-vue'
import { useAuthStore1 } from '../stores/user'
import { computed, ref , onUnmounted, onMounted} from 'vue'
import { useRoute } from 'vue-router'
import { Cpu } from '@element-plus/icons-vue'
import Calculator from '../components/Calculator.vue'
const calcVisible = ref(false)
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const authstore = useAuthStore1()
const menuOpen = ref(false)
const isActive = (path) => route.path === path
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

const userlogin = computed(() => authstore.name)

const handleCommand = (command) => {
  if (command === 'logout') {
    authstore.logout()
    router.push('/login')
  } 
}

onMounted(()=>{
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})


function handleGlobalKeydown(e){
  if(e.key === 'F1'){
    e.preventDefault()
    navigateTo('/4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942')
  }
  if(e.key === 'F2'){
    e.preventDefault()
    navigateTo('/91e6236168751f05de4ac5f4bbf867fe8d955925d44f356046854829644d0baf')
  }
  if(e.key === 'F3'){
    e.preventDefault()
    navigateTo('/af193190b8d3cd14103e20e900378a2b76414ff6428065f3f8539b3577b22fdf')
  }
  if(e.key === 'F4'){
    e.preventDefault()
    navigateTo('/472bbf14923e2e7cefd8529825c401e8d1a2937b96dd697a6d1c75c53e6cca3a')
  }
  if(e.key === 'F12'){
    e.preventDefault()
    navigateTo('/bf43e564ebc1b828180e6e4517d872bf71e80b431caeec6b5451e9254a0c6ee9')
  }
  if (e.key === 'Delete'){
    auth.logout()
    router.push('/login')
  }
  if(e.key === 'F5'){
    e.preventDefault()
    window.location.reload();
  }
}
</script>

<style scoped>
.el-button.is-active-nav {
  background-color: rgb(88, 173, 102) !important;
  color: #ebf5ff !important;
  border-color: white !important;
  font-weight: 500;
}
.el-header {
 background-color: #409eff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: auto !important;
  color: white;
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
  color: white;
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
  color: white;
  cursor: pointer;
}

.user-dropdown {
  color: white;
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