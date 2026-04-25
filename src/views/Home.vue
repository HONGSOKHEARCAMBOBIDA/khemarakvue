<template>
  <div class="pb-4">
    <el-row :gutter="10">
      <el-col :span="4">
        <el-input v-model="formData.name" placeholder="ស្វែងរក" size="large" />
      </el-col>
      <el-col :span="4">
        <el-select v-model="formData.branch_id" placeholder="ជ្រើសរើសសាខា" style="width:100%" size="large" clearable>
          <el-option v-for="branch in branches" :key="branch.id" :label="branch.name" :value="branch.id" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="formData.department_id" placeholder="ជ្រើសរើសនាយកដ្ឋាន" style="width:100%" size="large" clearable>
          <el-option v-for="department in departments" :key="department.id" :label="department.display_name" :value="department.id" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="formData.position_id" placeholder="ជ្រើសរើសតួនាទី" style="width:100%" size="large" clearable>
          <el-option v-for="position in positions" :key="position.id" :label="position.display_name" :value="position.id" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="formData.office_id" placeholder="ជ្រើសរើសការិយាល័យ" style="width:100%" size="large" clearable>
          <el-option v-for="office in offices" :key="office.id" :label="office.name" :value="office.id" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="formData.is_promote" placeholder="ជ្រើសរើសស្ថានភាព" style="width:100%" size="large" clearable>
          <el-option label="បានវាយតម្លៃ" :value="1" />
          <el-option label="មិនទាន់វាយតម្លៃ" :value="0" />
        </el-select>
      </el-col>
    </el-row>
  </div>

  <EmployeeDetailDrawer v-model="drawerVisible" :employee="selectedEmployee" @refresh="onEmployeeUpdated"/>

  <el-table :data="employees" height="750" style="width: 100%" v-loading="loading" default-expand-all>

    <el-table-column type="expand" fixed>
      <template #default="scope">
        <div style="display: flex;">
          <el-button  type="primary" plain :icon="View" @click="openDetail(scope.row)">មេីលលំអិត</el-button>
          <el-button  type="success" plain :icon="Edit">កែប្រែ</el-button>
          <el-button  type="warning" plain :icon="Wallet">កែប្រែប្រាក់ខែ</el-button>
          <el-button  type="success" plain :icon="Wallet">ដំឡេីងប្រាក់ខែ</el-button>
          <el-button  type="primary" plain :icon="ArrowUp">វាយតម្លៃការងារ</el-button>
          <el-button  plain :icon="Clock">ដូរវេនការងារ</el-button>
          <el-button  type="danger" plain :icon="Switch">ដូរថ្ងៃសម្រាក</el-button>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="រូបភាព" width="100" fixed>
      <template #default="{ row }">
        <el-image
          :src="getImage(row)"
          :preview-src-list="[getImage(row)]"
          preview-teleported
          style="width: 60px; height: 60px; border-radius: 50%; cursor: pointer"
          fit="cover"
        >
          <template #toolbar="{ actions }">
            <el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
            <el-icon @click="actions('zoomIn')"><ZoomIn /></el-icon>
            <el-icon @click="actions('clockwise')"><RefreshRight /></el-icon>
            <el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>

    <el-table-column label="រូបភាពQR" width="100" fixed>
      <template #default="{ row }">
        <el-image
          :src="getImageQR(row)"
          :preview-src-list="[getImageQR(row)]"
          preview-teleported
          style="width: 60px; height: 60px; border-radius: 10%; cursor: pointer"
          fit="cover"
        />
      </template>
    </el-table-column>

    <el-table-column label="ឈ្មោះខែ្មរ" width="130" fixed>
      <template #default="{ row }">
        <el-text>{{ row.employees?.[0]?.name_kh ?? "—" }}</el-text>
      </template>
    </el-table-column>

    <el-table-column label="ឈ្មោះអង់គ្លេស" width="130" fixed>
      <template #default="{ row }">
        <el-text type="primary">{{ row.employees?.[0]?.name_en ?? "—" }}</el-text>
      </template>
    </el-table-column>

    <el-table-column label="ភេទ" width="70">
      <template #default="{ row }">
        <el-tag type="primary">
          {{ row.employees?.[0]?.gender === 1 ? "ប្រុស" : row.employees?.[0]?.gender === 2 ? "ស្រី" : "—" }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="អត្តសញ្ញាណប័ណ្ណ" width="130">
      <template #default="{ row }">{{ row.employees?.[0]?.national_id_number ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="តួនាទី" width="150">
      <template #default="{ row }">
        <el-tag size="large">{{ row.employees?.[0]?.position_name ?? "—" }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="កម្រិតតួនាទី" width="100">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.position_level_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ថ្ងៃចូលធ្វេីការ" width="110">
      <template #default="{ row }">{{ row.employees?.[0]?.hire_date ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ថ្ងៃត្រូវវាយតម្លៃ" width="110">
      <template #default="{ row }">
        <el-tag :type="row.employees?.[0]?.is_promote ? 'success' : 'danger'" effect="light">
          {{ row.employees?.[0]?.promote_date ?? "—" }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="ប្រភេទបុគ្គលិក" width="130">
      <template #default="{ row }">{{ row.employees?.[0]?.employee_type_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ស្ថិតក្នុងការិយាល័យ" width="150">
      <template #default="{ row }">{{ row.employees?.[0]?.office_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ថ្ងៃ-ខែ-ឆ្នាំ(កំណេីត)" width="150">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.dob ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ទីកន្លែង(កំណេីត)" width="320">
      <template #default="{ row }">
        <span>
          <el-text type="info">
            {{ [row.employeeprofies?.[0]?.village_name_birth, row.employeeprofies?.[0]?.communce_name_birth, row.employeeprofies?.[0]?.district_name_birth].join(" / ") }}
          </el-text>
          <el-text type="primary"> / {{ row.employeeprofies?.[0]?.province_name_birth ?? "—" }}</el-text>
        </span>
      </template>
    </el-table-column>

    <el-table-column label="ទីកន្លែង(បច្ចុប្បន្ន)" width="320">
      <template #default="{ row }">
        <span>
          <el-text type="info">
            {{ [row.employeeprofies?.[0]?.village_name_current, row.employeeprofies?.[0]?.communce_name_current, row.employeeprofies?.[0]?.district_name_current].join(" / ") }}
          </el-text>
          <el-text type="primary"> / {{ row.employeeprofies?.[0]?.province_name_current ?? "—" }}</el-text>
        </span>
      </template>
    </el-table-column>

    <el-table-column label="លេខទូរសព្ទគ្រូសារ" width="150">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.family_phone ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="កុងធនាគារ" width="90">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.bank_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="លេខកុងធនាគារ" width="120">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.bank_account_number ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="រាយការណ៍ជួន" width="120">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.report_to_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ឈ្មោះប្រពន្ធ" width="120">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.wife_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="ឈ្មោះប្ដី" width="120">
      <template #default="{ row }">{{ row.employeeprofies?.[0]?.husban_name ?? "—" }}</template>
    </el-table-column>

    <el-table-column label="កូនប្រុស" width="120">
      <template #default="{ row }">
        <el-tag size="large" type="primary">{{ row.employeeprofies?.[0]?.son_number ?? "—" }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="កូនស្រី" width="120">
      <template #default="{ row }">
        <el-tag size="large" type="warning">{{ row.employeeprofies?.[0]?.daughter_number ?? "—" }}</el-tag>
      </template>
    </el-table-column>

  </el-table>

  <div style="display: flex; justify-content: flex-end; margin-top: 16px">
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { fetchEmployee } from "../services/employee"
import { fetchBranch } from "../services/branch"
import { fetchDepartment } from "../services/department"
import { fetchPosition } from "../services/position"
import { fetchOffice } from "../services/office"
import {
  Edit, View, Wallet, ArrowUp, Clock, Switch,
  ZoomIn, ZoomOut, RefreshLeft, RefreshRight
} from "@element-plus/icons-vue"
import EmployeeDetailDrawer from "./EmployeeDetailDrawer.vue"

// ── State ──────────────────────────────────────────────────────────────────
const loading        = ref(false)
const employees      = ref([])
const drawerVisible  = ref(false)
const selectedEmployee = ref(null)
const branches       = ref([])
const departments    = ref([])
const positions      = ref([])
const offices        = ref([])

const formData = ref({
  name:          "",
  branch_id:     null,
  department_id: null,
  position_id:   null,
  office_id:     null,
  is_promote:    null,
})

const pagination = ref({
  page:     1,
  pageSize: 10,
  total:    0,
})

let searchTimer = null

// ── Helpers ────────────────────────────────────────────────────────────────
function buildParams() {
  const params = {
    page:     pagination.value.page,
    pageSize: pagination.value.pageSize,
  }
  if (formData.value.name.trim())       params.name          = formData.value.name.trim()
  if (formData.value.branch_id)         params.branch_id     = formData.value.branch_id
  if (formData.value.department_id)     params.department_id = formData.value.department_id
  if (formData.value.position_id)       params.position_id   = formData.value.position_id
  if (formData.value.office_id)         params.office_id     = formData.value.office_id
  if (formData.value.is_promote != null) params.is_promote   = formData.value.is_promote
  return params
}

function getImage(row) {
  const file = row.employeeprofies?.[0]?.profile_image
  return file ? `http://localhost:8080/profileimage/${file}` : "https://via.placeholder.com/40"
}

function getImageQR(row) {
  const file = row.employeeprofies?.[0]?.qr_code_bank_account
  return file ? `http://localhost:8080/qrcodeimage/${file}` : "https://via.placeholder.com/40"
}

function openDetail(row) {
  selectedEmployee.value = row
  drawerVisible.value    = true
}

async function loadEmployees(params = {}) {
  loading.value = true
  try {
    const res = await fetchEmployee(params)
    employees.value       = res.data.data
    pagination.value.total = res.data.pagination.totalCount  
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Load failed")
  } finally {
    loading.value = false
  }
}

async function onEmployeeUpdated() {
  await loadEmployees(buildParams())
  if (selectedEmployee.value) {
    const userId = selectedEmployee.value.user_id
    const fresh = employees.value.find(e => e.user_id === userId)
    if (fresh) selectedEmployee.value = fresh
  }
}

async function loadLookup(fn, target) {
  try {
    const res = await fn()
    target.value = res.data.data
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Load failed")
  }
}

function onPageChange(newPage) {
  pagination.value.page = newPage
  loadEmployees(buildParams())
}

function onSizeChange(newSize) {
  pagination.value.pageSize = newSize
  pagination.value.page     = 1
  loadEmployees(buildParams())
}

// ── Delete ─────────────────────────────────────────────────────────────────
function handleDelete(row) {
  ElMessageBox.confirm(
    `តើអ្នកពិតជាចង់លុបបុគ្គលិក ${row.employees?.[0]?.name_kh || row.user_id} មែនទេ?`,
    "បញ្ជាក់ការលុប",
    { confirmButtonText: "លុប", cancelButtonText: "បោះបង់", type: "warning" }
  ).then(async () => {
    try {
      // await deleteEmployee(row.user_id)
      ElMessage.success("លុបបុគ្គលិកដោយជោគជ័យ!")
      await loadEmployees(buildParams())
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || e?.message || "លុបមិនបានសម្រេច")
    }
  }).catch(() => {
    ElMessage.info("បានបោះបង់ការលុប")
  })
}

// ── Mounted ────────────────────────────────────────────────────────────────
onMounted(() => {
  loadEmployees(buildParams())
  loadLookup(fetchBranch,     branches)
  loadLookup(fetchDepartment, departments)
  loadLookup(fetchOffice,     offices)
})

// ── Watchers ───────────────────────────────────────────────────────────────
watch(() => formData.value.name, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    loadEmployees(buildParams())
  }, 250)
})

watch(() => formData.value.branch_id, () => {
  pagination.value.page = 1
  loadEmployees(buildParams())
})

watch(() => formData.value.department_id, async (newDepartmentId) => {
  positions.value            = []
  formData.value.position_id = null
  pagination.value.page      = 1
  await loadEmployees(buildParams())
  if (newDepartmentId) {
    try {
      const res = await fetchPosition(newDepartmentId)
      positions.value = res.data.data
    } catch (e) {
      ElMessage.error("គ្មានតួនាទីក្នុងនាយកដ្ឋាននេះទេ")
    }
  }
})

watch(() => formData.value.position_id, () => {
  pagination.value.page = 1
  loadEmployees(buildParams())
})

watch(() => formData.value.office_id, () => {
  pagination.value.page = 1
  loadEmployees(buildParams())
})

watch(() => formData.value.is_promote, () => {
  pagination.value.page = 1
  loadEmployees(buildParams())
})
</script>

<style scoped>
:deep(.el-table__expand-icon) {
  font-size: 16px;
}
:deep(.el-table__expanded-cell) {
  padding: 12px 20px !important;
  background-color: #f5f7fa;
}
:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>