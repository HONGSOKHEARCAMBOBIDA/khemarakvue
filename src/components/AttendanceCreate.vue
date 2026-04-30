<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { Loading, Location, Warning, Refresh } from "@element-plus/icons-vue";
import { useAuthStore1 } from "../stores/user";
import { createattendance, checkout } from "../services/attendance";
import { ElNotification } from "element-plus";
import { fetchsession } from "../services/attendance";
const authstore = useAuthStore1();
const session = ref({})
const userLat = ref(null);
const userLng = ref(null);
const locationStatus = ref("acquiring");
const locationText = ref("កំពុងចាប់ទីតាំង...");
const locationCoords = ref("");
const noteInput = ref("");
const submitting = ref(false);

const clock = ref("");
const dateStr = ref("");
let clockTimer;
const loading = ref(false)
async function load(fn, target) {
  loading.value = true
  try {
    const res = await fn()
    target.value = res.data.data
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function updateClock() {
  const now = new Date();
  clock.value = now.toLocaleTimeString("en-US", { hour12: true });
  dateStr.value = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = "error";
    locationText.value = "Geolocation not supported";
    return;
  }
  locationStatus.value = "acquiring";
  locationText.value = "កំពុងចាប់ទីតាំង...";
  locationCoords.value = "";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat.value = pos.coords.latitude;
      userLng.value = pos.coords.longitude;
      locationStatus.value = "ready";
      locationText.value = "ចាប់ទីតាំងបានជោគជ័យ";
      locationCoords.value = `${userLat.value.toFixed(6)}, ${userLng.value.toFixed(6)}`;
    },
    (err) => {
      locationStatus.value = "error";
      locationText.value = "ចាប់ទីតាំងបរាជ័យ";
      locationCoords.value = err.message;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
}

function buildPayload(type) {
  const formData = new FormData();
  formData.append("branch_id", authstore.branchID);
  formData.append("branch_latitude", authstore.branchLatitude);
  formData.append("branch_longitude", authstore.branchLongitude);
  formData.append("branch_radius", authstore.branchRadius);
  formData.append("employee_id", authstore.employeeID);
  formData.append("latitude", userLat.value);
  formData.append("longitude", userLng.value);
  formData.append("note", noteInput.value.trim());
  return formData;
}

async function handleCheckIn() {
  submitting.value = true;
  try {
    await createattendance(buildPayload("check_in"));
    ElNotification({
      title: "ជោគជ័យ",
      message: "ចូលធ្វេីការបានជោគជ័យ",
      position: "top-left",
      type: "success",
    });
  } catch (err) {
    ElNotification({
      title: "បរាជ័យ",
      message: err.response?.data?.error || err.message || "ព្យាយាមម្ដងទៀត",
      position: "top-left",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
}

async function handleCheckOut() {
  submitting.value = true;
  try {
    await checkout(buildPayload());
    ElNotification({
      title: "ជោគជ័យ",
      message: "ចេញធ្វេីការបានជោគជ័យ",
      position: "top-left",
      type: "success",
    });
  } catch {
    ElNotification({
      title: "បរាជ័យ",
      message: "ព្យាយាមម្ដងទៀត",
      position: "top-left",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
}

const suggestions = [
  { value: "ចុះខេត្តបន្ទាន់" },
  { value: "ណាត់ជួបពេទ្យ" },
  { value: "អត់ស្រួលខ្លួន" },
  { value: "មានរឿងបន្ទាន់" },
  { value: "ធ្វេីឯកសារបន្ទាន់" },
];
const suggestionlate = [
  { value: "អធ្យាស្រ័យខ្ញុំមកយឺត" },
  { value: "ស្ទះផ្លូវ" },
  { value: "ខូចយាន្តជំនិះ" },
];
const suggestionleftearly = [
  { value: "ចុះខេត្តបន្ទាន់" },
  { value: "ណាត់ជួបពេទ្យ" },
  { value: "អត់ស្រួលខ្លួន" },
  { value: "មានរឿងបន្ទាន់" },
  { value: "ធ្វេីឯកសារបន្ទាន់" },
];
function querySearch(queryString, cb) {
  const results = queryString
    ? suggestions.filter((s) =>
        s.value.toLowerCase().includes(queryString.toLowerCase()),
      )
    : suggestions;
  cb(results);
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  getLocation();
 load(fetchsession, session)
});

onUnmounted(() => clearInterval(clockTimer));
</script>

<template>
  <el-container
    style="min-height: 40vh; background: var(--el-fill-color-light)"
  >
    <el-main
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
      "
    >
      <el-card
        style="width: 100%; max-width: 480px"
        :body-style="{ padding: '28px 24px' }"
        shadow="never"
      >
        <!-- ── Header ── -->
        <el-row align="middle" :gutter="12" style="margin-bottom: 14px">
          <el-col :span="22">
            <el-text tag="p" size="large" style="font-weight: 700; margin: 0">
              បញ្ចូលវត្តមាន
            </el-text>
          </el-col>
        </el-row>

        <el-divider style="margin: 0 0 20px" />

        <!-- ── Clock ── -->
        <el-card
          shadow="never"
          :body-style="{ padding: '20px', textAlign: 'center' }"
          style="
            background: var(--el-color-primary-light-9);
            margin-bottom: 20px;
            border: none;
          "
        >
          <el-text
            style="
              font-size: 28px;
              font-weight: 800;
              letter-spacing: 2px;
              font-variant-numeric: tabular-nums;
            "
            type="danger"
          >
            {{ clock }}
          </el-text>
          <div>
            <el-text type="info" size="small">{{ dateStr }}</el-text>
          </div>
        </el-card>

        <!-- ── Location ── -->
        <el-text
          type="info"
          size="small"
          style="
            display: block;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          "
        >
          ទីតាំងបុគ្គលិក
        </el-text>

        <el-alert
          :type="
            locationStatus === 'ready'
              ? 'success'
              : locationStatus === 'error'
                ? 'error'
                : 'warning'
          "
          :closable="false"
          show-icon
          style="margin-bottom: 20px; align-items: center"
        >
          <template #icon>
            <el-icon v-if="locationStatus === 'acquiring'" class="spinning"
              ><Loading
            /></el-icon>
            <el-icon v-else-if="locationStatus === 'ready'"
              ><Location
            /></el-icon>
            <el-icon v-else><Warning /></el-icon>
          </template>

          <template #default>
            <el-row align="middle" justify="space-between" style="width: 100%">
              <!-- <el-text size="small" style="font-weight: 600;">{{ locationText }}</el-text> -->

              <el-tag
                :type="
                  locationStatus === 'ready'
                    ? 'success'
                    : locationStatus === 'error'
                      ? 'danger'
                      : 'warning'
                "
                size="small"
                plain
                style="margin-left: 8px"
              >
                {{
                  locationStatus === "ready"
                    ? "ចាប់បាន"
                    : locationStatus === "error"
                      ? "មិនបាន"
                      : "កំពុងចាប់ទីតាំង..."
                }}
              </el-tag>

              <el-text
                type="info"
                size="small"
                style="font-family: monospace; flex: 1; margin: 0 10px"
              >
                {{ locationCoords || "—" }}
              </el-text>

              <el-button
                :icon="Refresh"
                circle
                size="small"
                @click="getLocation"
              />
            </el-row>
          </template>
        </el-alert>

        <!-- ── Note ── -->
        <!-- ── Note ── -->
        <div style="margin-bottom: 20px">
          <div style="margin-bottom: 6px">
            <el-text
              type="info"
              size="small"
              style="text-transform: uppercase; letter-spacing: 1px"
            >
              មូលហេតុ
            </el-text>
            <el-text type="warning" size="small" style="margin-left: 6px">
              (បំពេញបើ យឺត ឬ ចេញមុន)
            </el-text>
          </div>

          <el-autocomplete
            v-model="noteInput"
            :fetch-suggestions="querySearch"
            placeholder="បញ្ចូលមូលហេតុ..."
            style="width: 100%; height: 60px"
            :trigger-on-focus="true"
            clearable
          />
        </div>

        <el-divider style="margin: 0 0 20px" />

        <!-- ── Buttons ── -->
        <el-row :gutter="12">
          <el-col :span="12">
            <el-button
              v-if="session.show_check_in == true"
              type="primary"
              size="large"
              :disabled="locationStatus !== 'ready' || submitting"
              :loading="submitting"
              style="width: 100%; font-weight: 600"
              @click="handleCheckIn"
            >
              🟢 ចូលធ្វេីការ
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button
             v-if="session.show_check_out == true"
              type="danger"
              size="large"
              :disabled="locationStatus !== 'ready' || submitting"
              :loading="submitting"
              style="width: 100%; font-weight: 600"
              @click="handleCheckOut"
            >
              🔴 ចេញពីធ្វេីការ
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-main>
  </el-container>
</template>

<style scoped>
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
