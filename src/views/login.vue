<script setup>
import { ref,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAuthStore1 } from '../stores/user'
import { loginApi } from '../services/auth'
import { ElMessage } from 'element-plus'
import logo from '../assets/logo.png'
import { ElNotification } from 'element-plus'
const router = useRouter()
const auth = useAuthStore()
const userdata = useAuthStore1()
const form = ref({
  username: '',
  password: ''
})
const usernameRef = ref(null)
const passwordRef = ref(null)
function focusPassword() {   
  passwordRef.value?.focus()
}
onMounted(()=>{
  usernameRef.value.focus()
})
const loading = ref(false)
async function handleLogin() {
  loading.value = true
  try {
    const response = await loginApi(form.value)
    const token = response.data.data.Token 
    const user = response.data.data 
    auth.login(token)
    userdata.login(user)
    ElNotification({
    title: 'ជោគជ័យ',
    message: 'ចូលប្រព័ន្ធបានជោគជ័យ',
    position: 'top-left',
    type: 'success',
  })
    await router.replace('/5a3bcbcef5b4e4d069cf81db423a5de624c6d0bc32c227cd32d4bc9ee9145ec1')
  } catch (error) {
     ElNotification({
    title: 'បរាជ័យ',
    message: 'ព្យាយាមម្ដងទៀត',
    position: 'top-left',
    type: 'error',
  })
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.telegram-bg {
  background: #17212B;
}
.telegram-bg-second {
  background: #0E1621;
}
</style>
<template>
  <div class="telegram-bg">
      <div class="flex justify-center items-center h-screen px-4 ">
    <el-card class="w-full max-w-md p-2 border border-gray-300 telegram-bg-second" shadow="never" >
      <div class="flex flex-col gap-4 items-center">
         <el-image
          :src="logo"
          style="width: 130px; height: 130px"
          fit="cover"
        />

         <el-text class="mx-1" size="large" style="color: whitesmoke;">សាកលវិទ្យាល័យខេមរៈ</el-text>
        <el-input
          
          ref="usernameRef"
          v-model="form.username"
          placeholder="Username"
           :disabled="loading"
           size="large"
           @keyup.enter="focusPassword"
             style="
    --el-input-bg-color: #2b5278;
    --el-input-text-color: white;
  "
        />

        <el-input
          ref="passwordRef"
          v-model="form.password"
          type="password"
          placeholder="Please input password"
          show-password
           :disabled="loading"
           size="large"
           @keyup.enter="handleLogin"
            style="
    --el-input-bg-color: #2b5278;
    --el-input-text-color: white;
  "
        />

        <el-button
          type="primary"
          class="w-full"
          :loading="loading"
          @click="handleLogin"
          size="large"
        >
          Login
        </el-button>

      </div>
    </el-card>
  </div>
  </div>

</template>