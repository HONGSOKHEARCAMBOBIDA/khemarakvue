<script setup>
import { ref } from 'vue'
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
    await router.replace('/attendance')
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

<template>
  <div class="flex justify-center items-center h-screen px-4">
    <el-card class="w-full max-w-md p-6 border border-gray-300">
      <div class="flex flex-col gap-4 items-center">
         <el-image
          :src="logo"
          style="width: 100px; height: 100px"
          fit="cover"
        />

         <el-text class="mx-1" size="large">សាកលវិទ្យាល័យខេមរៈ</el-text>
        <el-input
          v-model="form.username"
          placeholder="Username"
           :disabled="loading"
           size="large"
        />

        <el-input
          v-model="form.password"
          type="password"
          placeholder="Please input password"
          show-password
           :disabled="loading"
           size="large"
        />

        <el-button
          type="primary"
          class="w-full"
          :loading="loading"
          @click="handleLogin"
        >
          Login
        </el-button>

      </div>
    </el-card>
  </div>
</template>