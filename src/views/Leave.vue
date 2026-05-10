<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchLeave,
  fetchLeaveDurationUnit,
  fetchLeaveType,
  fetchStatusLeave
} from '../services/leave'
import { fetchBranch } from '../services/branch'
import { getuser } from '../services/userservice'
import { fetchOffice } from '../services/office'
import { Search, Refresh } from '@element-plus/icons-vue'
import { previewLeavePDF, downloadLeavePDF } from '../utils/generateLeavePDF'

// ── state ─────────────────────────────────────────────────────────────────
const loading     = ref(false)
const leave       = ref([])
const leavetype   = ref([])
const statusleave = ref([])
const branch      = ref([])
const user        = ref([])
const office      = ref([])

// ── PDF preview dialog ────────────────────────────────────────────────────
const previewVisible = ref(false)
const previewUrl     = ref('')      // blob URL fed to <iframe>
const previewRow     = ref(null)    // current row (for download button)

function openPreview(row) {
  previewRow.value = row
  previewUrl.value = previewLeavePDF(row)   // generate blob URL
  previewVisible.value = true
}

function closePreview() {
  previewVisible.value = false
  // Release the blob URL from memory
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  previewRow.value = null
}

function handleDownload() {
  if (previewRow.value) downloadLeavePDF(previewRow.value)
}

// ── filters & pagination ──────────────────────────────────────────────────
function getToday() {
  return new Date().toISOString().slice(0, 10)
}

const formDataParam = ref({
  employee_id:     null,
  branch_id:       null,
  office_id:       null,
  status_leave_id: null,
  leave_type_id:   null,
  start_date:      getToday(),
  end_date:        getToday(),
  search:          ''
})

const pagination = ref({ page: 1, pageSize: 10, total: 0 })
let searchTimer = null

function buildParams() {
  const p = { page: pagination.value.page, pageSize: pagination.value.pageSize }
  const f = formDataParam.value
  if (f.search?.trim())          p.search          = f.search.trim()
  if (f.start_date?.trim())      p.start_date      = f.start_date.trim()
  if (f.end_date?.trim())        p.end_date        = f.end_date.trim()
  if (f.employee_id)             p.employee_id     = f.employee_id
  if (f.branch_id)               p.branch_id       = f.branch_id
  if (f.office_id)               p.office_id       = f.office_id
  if (f.status_leave_id)         p.status_leave_id = f.status_leave_id
  if (f.leave_type_id)           p.leave_type_id   = f.leave_type_id
  return p
}

async function loadLeave(params = {}) {
  loading.value = true
  try {
    const res = await fetchLeave(params)
    leave.value = res.data.data
    pagination.value.total = res.data.pagination.totalCount
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

async function loadLookup(fn, target) {
  try {
    const res = await fn()
    target.value = res.data.data
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Load failed')
  }
}

function onPageChange(newPage) {
  pagination.value.page = newPage
  loadLeave(buildParams())
}
function onSizeChange(newSize) {
  pagination.value.pageSize = newSize
  pagination.value.page = 1
  loadLeave(buildParams())
}

function resetFilters() {
  formDataParam.value = {
    employee_id: null, branch_id: null, office_id: null,
    status_leave_id: null, leave_type_id: null,
    start_date: getToday(), end_date: getToday(), search: ''
  }
  user.value = []
  pagination.value.page = 1
  loadLeave(buildParams())
}

function statusType(id) {
  const map = { 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
  return map[id] ?? 'info'
}

onMounted(() => {
  loadLeave(buildParams())
  loadLookup(fetchBranch, branch)
  loadLookup(fetchLeaveType, leavetype)
  loadLookup(fetchStatusLeave, statusleave)
  loadLookup(fetchOffice, office)
})

watch(() => formDataParam.value.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { pagination.value.page = 1; loadLeave(buildParams()) }, 300)
})

watch(() => formDataParam.value.branch_id, async (v) => {
  pagination.value.page = 1
  user.value = []
  formDataParam.value.employee_id = null
  if (v) {
    try { user.value = (await getuser(v)).data.data } catch {}
  }
  loadLeave(buildParams())
})

watch(() => formDataParam.value.employee_id,     () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.office_id,       () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.status_leave_id, () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.leave_type_id,   () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.start_date,      () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.end_date,        () => { pagination.value.page = 1; loadLeave(buildParams()) })

// ── phone helpers ─────────────────────────────────────────────────────────
const formDataPhone = (phone) => {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9 || cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')
  }
  return phone
}

const getProvider = (phone) => {
  if (!phone) return 'Unknown'
  const c = phone.replace(/\D/g, '')
  if (['010','015','016','069','070','081','086','093','096','098'].some(p => c.startsWith(p))) return 'Smart'
  if (['011','012','014','017','061','076','078','079','089','092','095'].some(p => c.startsWith(p))) return 'Cellcard'
  if (['031','036','038','039','071','085','087','088','090','097','099'].some(p => c.startsWith(p))) return 'Metfone'
  if (['066','068','077'].some(p => c.startsWith(p))) return 'Seatel'
  if (c.startsWith('018')) return 'Cootel'
  return 'Other'
}

const getProviderType = (phone) => {
  const map = { Smart: 'success', Cellcard: 'danger', Metfone: 'primary' }
  return map[getProvider(phone)] ?? 'info'
}
</script>

<template>
  <div class="leave-page">

    <!-- ── page header ── -->
    <div class="page-header">
      <div class="header-left">
        <el-text size="large">ការគ្រប់គ្រងច្បាប់ឈប់សម្រាក</el-text>
      </div>
      <el-button :icon="Refresh" circle plain @click="resetFilters" title="Reset filters" />
    </div>

    <!-- ── filters ── -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-grid">
        <el-input v-model="formDataParam.search" placeholder="ស្វែងរក​ឈ្មោះបុគ្គលិក..." :prefix-icon="Search" clearable />
        <el-date-picker v-model="formDataParam.start_date" type="date" placeholder="ថ្ងៃចាប់ផ្ដើម" value-format="YYYY-MM-DD" style="width:100%" />
        <el-date-picker v-model="formDataParam.end_date"   type="date" placeholder="ថ្ងៃបញ្ចប់"    value-format="YYYY-MM-DD" style="width:100%" />
        <el-select v-model="formDataParam.branch_id" placeholder="សាខា" clearable filterable style="width:100%">
          <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
        </el-select>
        <el-select v-model="formDataParam.employee_id" placeholder="បុគ្គលិក" clearable filterable :disabled="!formDataParam.branch_id" style="width:100%">
          <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
        </el-select>
        <el-select v-model="formDataParam.office_id" placeholder="ការិយាល័យ" clearable filterable style="width:100%">
          <el-option v-for="o in office" :key="o.id" :label="o.name" :value="o.id" />
        </el-select>
        <el-select v-model="formDataParam.leave_type_id" placeholder="ប្រភេទច្បាប់" clearable style="width:100%">
          <el-option v-for="lt in leavetype" :key="lt.id" :label="lt.name" :value="lt.id" />
        </el-select>
        <el-select v-model="formDataParam.status_leave_id" placeholder="ស្ថានភាព" clearable style="width:100%">
          <el-option v-for="st in statusleave" :key="st.id" :label="st.name" :value="st.id" />
        </el-select>
      </div>
    </el-card>

    <!-- ── table ── -->
    <el-card class="table-card" shadow="never">
      <el-table :data="leave" v-loading="loading" stripe border row-key="id" style="width:100%" empty-text="គ្មានទិន្នន័យ">

        <el-table-column type="index" label="ល.រ" width="55" align="center" fixed />

        <el-table-column label="លេខកូដ" min-width="130" fixed>
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_code }}</div>
          </template>
        </el-table-column>

        <el-table-column label="បុគ្គលិក" min-width="170" fixed>
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_name_kh }}</div>
            <el-text type="success" size="small">{{ row.employee_name_en }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="លេខទូរសព្ទ" min-width="170" fixed>
          <template #default="{ row }">
            <span class="fw-bold">{{ formDataPhone(row.employee_phone) }}</span>
            <el-tag size="small" :type="getProviderType(row.employee_phone)" effect="light" style="margin-left:6px">
              {{ getProvider(row.employee_phone) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="ភេទ" min-width="70" fixed align="center">
          <template #default="{ row }">
            <el-tag type="primary">
              {{ row.employee_gender === 1 ? 'ប្រុស' : row.employee_gender === 2 ? 'ស្រី' : '—' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="មុខតំណែង / ការិយាល័យ" min-width="180" align="center">
          <template #default="{ row }">
            <div class="two-line">
              <el-text type="primary" size="small">{{ row.position_name }}</el-text>
              <el-text type="warning" size="small">{{ row.office_name }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ប្រភេទច្បាប់" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary" effect="light" size="large">{{ row.leave_type_name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="សុំច្បាប់" min-width="70" align="center">
          <template #default="{ row }">
            <el-text>{{ row.duration_value }} {{ row.duration_unit_name_kh }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="រយៈពេល" min-width="150" align="center">
          <template #default="{ row }">
            <div class="two-line center">
              <span class="line-main">{{ row.duration_display }}</span>
              <el-text type="primary" size="small">{{ row.start_date }} → {{ row.end_date }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ការកាត់ប្រាក់" min-width="150" align="center">
          <template #default="{ row }">
            <div class="two-line">
              <span class="line-main">{{ row.deduct_type_name }}</span>
              <el-tag size="small" effect="plain">{{ row.deduct_type_code }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="branch_name" label="សាខា" min-width="130" align="center" />

        <el-table-column label="មូលហេតុ" min-width="140" align="center">
          <template #default="{ row }">
            <el-text>{{ row.description || '—' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="អនុម័តដោយ" min-width="130" align="center">
          <template #default="{ row }">
            <span>{{ row.approve_by_name || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="ស្ថានភាព" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status_leave_id)" effect="light" size="large">
              {{ row.status_leave_name }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- ── action column: opens preview dialog ── -->
        <el-table-column label="សកម្មភាព" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="មើលលម្អិត" placement="top">
              <el-button
                type="primary"
                :icon="'View'"
                circle
                size="small"
                plain
                @click="openPreview(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <!-- ════════════════════════════════════════════════════════════════
         PDF PREVIEW DIALOG
         ════════════════════════════════════════════════════════════════ -->
    <el-dialog
      v-model="previewVisible"
      title="មើលទម្រង់ច្បាប់ឈប់សម្រាក"
      width="860px"
      top="4vh"
      :before-close="closePreview"
      destroy-on-close
    >
      <!-- iframe shows the PDF blob -->
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        class="pdf-iframe"
        frameborder="0"
      />

      <!-- dialog footer: close + download -->
      <template #footer>
        <el-button @click="closePreview">បិទ</el-button>
        <el-button type="primary" @click="handleDownload">
          ទាញយក PDF
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped>
.leave-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-left { display: flex; align-items: center; gap: 12px; }

.filter-card  { margin-bottom: 16px; border-radius: 3px; }
.filter-grid  {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 5px;
}

.table-card { border-radius: 3px; }

.emp-name-kh { font-size: 13px; font-weight: 600; color: #1d2939; }

.two-line        { display: flex; flex-direction: column; gap: 2px; }
.two-line.center { align-items: center; }
.line-main       { font-size: 13px; color: #344054; font-weight: 500; }

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* PDF iframe fills the dialog body */
.pdf-iframe {
  width: 100%;
  height: 78vh;
  border: none;
  border-radius: 4px;
  background: #eee;
}

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>