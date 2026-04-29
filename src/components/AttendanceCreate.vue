<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useAuthStore1 } from '../stores/user'
import { createattendance } from '../services/attendance'

const authstore = useAuthStore1()

const userLat = ref(null)
const userLng = ref(null)
const locationStatus = ref('') // 'acquiring' | 'ready' | 'error'
const locationText = ref('')
const locationCoords = ref('')
const noteInput = ref('')
const submitting = ref(false)

// Clock
const clock = ref('')
const dateStr = ref('')

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString('en-US', { hour12: true })
  dateStr.value = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

// Geolocation
function getLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = 'error'
    locationText.value = 'Geolocation not supported'
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat.value = pos.coords.latitude.toFixed(6)
      userLng.value = pos.coords.longitude.toFixed(6)
      locationStatus.value = 'ready'
      locationText.value = 'Location acquired'
      locationCoords.value = `${userLat.value}, ${userLng.value}`
    },
    (err) => {
      locationStatus.value = 'error'
      locationText.value = 'Location failed'
      locationCoords.value = err.message
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

function buildPayload() {
  const formData = new FormData()
  formData.append('branch_id',        authstore.branchID)
  formData.append('branch_latitude',  authstore.branchLatitude)
  formData.append('branch_longitude', authstore.branchLongitude)
  formData.append('branch_radius',    authstore.branchRadius)
  formData.append('employee_id',      authstore.employeeID)
  formData.append('latitude',         userLat.value)
  formData.append('longitude',        userLng.value)
  formData.append('note',             noteInput.value.trim())
  return formData
}

async function handleCheckIn() {
  submitting.value = true
  try {
    await createattendance(buildPayload())
    ElMessage.success('ចូលធ្វេីការបានជោគជ័យ')
  } catch (e) {
    ElMessage.error('បរាជ័យ ព្យាយាមម្ដងទៀត')
  } finally {
    submitting.value = false
  }
}

async function handleCheckOut() {
  submitting.value = true
  try {
    await createattendance({ ...buildPayload()})
    ElMessage.success('ចេញធ្វេីការបានជោគជ័យ')
  } catch (e) {
    ElMessage.error('បរាជ័យ ព្យាយាមម្ដងទៀត')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  getLocation()
})
</script>

<template>
  <div class="attendance-page">
    <el-card class="attendance-card" shadow="never">

      <!-- Header --> 
      <div class="card-header">

        <div>
          <h2>បញ្ចូលវត្តមាន</h2>
          
        </div>
      </div>

      <!-- Clock -->
      <el-card class="time-card" shadow="never">
        <span class="time-big">{{ clock }}</span>
        <p class="date-small">{{ dateStr }}</p>
      </el-card>

      <!-- Location -->
      <p class="section-label">ទីតាំងបុគ្គលិក</p>
      <el-card
        class="location-card"
        shadow="never"
        :class="locationStatus"
      >
        <el-icon v-if="locationStatus === 'acquiring'" class="spinning"><Loading /></el-icon>
        <el-icon v-else-if="locationStatus === 'ready'"><Location /></el-icon>
        <el-icon v-else><Warning /></el-icon>

        <div class="loc-info">
          <p class="loc-status">{{ locationText }}</p>
          <p class="loc-coords">{{ locationCoords }}</p>
        </div>

        <el-tag
          :type="locationStatus === 'ready' ? 'success' : locationStatus === 'error' ? 'danger' : 'warning'"
          size="small"
        >
          {{ locationStatus === 'ready' ? 'ចាប់ទីតាំងបាន' : locationStatus === 'error' ? 'ចាប់ទីតាំងមិនបាន' : 'LOCATING' }}
        </el-tag>
      </el-card>

      <!-- Note -->
      
      <el-tag type="warning">សូមបំពេញបេី យឺត ឬ ចេញមុន</el-tag>
      <el-input
        v-model="noteInput"
        type="textarea"
        :rows="3"
        placeholder="បញ្ចូលមូលហេតុ"
        class="note-input"
      />

      <!-- Buttons -->
      <div class="btn-group">
        <el-button
          type="primary"
          size="large"
          :disabled="locationStatus !== 'ready' || submitting"
          :loading="submitting"
          @click="handleCheckIn"
        >
          🟢 ចូលធ្វេីការ
        </el-button>
        <el-button
          type="danger"
          size="large"
          :disabled="locationStatus !== 'ready' || submitting"
          :loading="submitting"
          @click="handleCheckOut"
        >
          🔴 ចេញពីធ្វេីការ
        </el-button>
      </div>

    </el-card>
  </div>
</template>

<style scoped>
.attendance-page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; padding: 24px;
  background: #f0f2f5;
}
.attendance-card { width: 100%; max-width: 500px; border-radius: 10px; }
.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.logo-icon { font-size: 32px; }
h2 { font-size: 20px; font-weight: 700; margin: 0; }
.subtitle { font-size: 12px; color: #9ca3af; margin: 2px 0 0; }

.time-card { background: #f5f7ff;  margin-bottom: 50px; text-align: center; }
.time-big { font-size: 32px; font-weight: 700; color: #f80101; letter-spacing: 2px; }
.date-small { font-size: 12px; color: #9ca3af; margin: 4px 0 0; }

.section-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
  text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }

.location-card {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px; border-radius: 12px;
  transition: border-color 0.3s;
}
.location-card.acquiring { border-color: #f59e0b; }
.location-card.ready     { border-color: #22c55e; }
.location-card.error     { border-color: #ef4444; }
.loc-info { flex: 1; min-width: 0; }
.loc-status { font-size: 13px; font-weight: 500; margin: 0; }
.loc-coords { font-size: 11px; color: #9ca3af; font-family: monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 2px 0 0; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.note-input { margin-bottom: 20px; }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.btn-group .el-button { width: 100%; font-weight: 600; }
</style>