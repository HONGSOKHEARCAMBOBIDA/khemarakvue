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
import { Calendar, Search, Filter, Refresh } from '@element-plus/icons-vue'

const loading     = ref(false)
const leave       = ref([])
const leavetype   = ref([])
const statusleave = ref([])
const branch      = ref([])
const user        = ref([])
const office      = ref([])

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

watch(() => formDataParam.value.employee_id,    () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.office_id,      () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.status_leave_id,() => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.leave_type_id,  () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.start_date,     () => { pagination.value.page = 1; loadLeave(buildParams()) })
watch(() => formDataParam.value.end_date,       () => { pagination.value.page = 1; loadLeave(buildParams()) })
</script>

<template>
  <div class="leave-page">
    <div class="page-header">
      <div class="header-left">
       
        <div>
          <el-text size="large">ការគ្រប់គ្រងច្បាប់ឈប់សម្រាក</el-text>
        </div>
      </div>
      <el-button :icon="Refresh" circle plain @click="resetFilters" title="Reset filters" />
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-grid">
        <el-input
          v-model="formDataParam.search"
          placeholder="ស្វែងរក​ឈ្មោះបុគ្គលិក..."
          :prefix-icon="Search"
          clearable
         
        />

        <el-date-picker
          v-model="formDataParam.start_date"
          type="date"
          placeholder="ថ្ងៃចាប់ផ្ដើម"
          value-format="YYYY-MM-DD"
          style="width:100%"
        />
        <el-date-picker
          v-model="formDataParam.end_date"
          type="date"
          placeholder="ថ្ងៃបញ្ចប់"
          value-format="YYYY-MM-DD"
          style="width:100%"
        />

        <el-select
          v-model="formDataParam.branch_id"
          placeholder="សាខា"
          clearable
          filterable
          style="width:100%"
        >
          <el-option
            v-for="b in branch"
            :key="b.id"
            :label="b.name"
            :value="b.id"
          />
        </el-select>


        <el-select
          v-model="formDataParam.employee_id"
          placeholder="បុគ្គលិក"
          clearable
          filterable
          :disabled="!formDataParam.branch_id"
          style="width:100%"
        >
          <el-option
            v-for="u in user"
            :key="u.id"
            :label="u.name"
            :value="u.id"
          />
        </el-select>

        <el-select
          v-model="formDataParam.office_id"
          placeholder="ការិយាល័យ"
          clearable
          filterable
          style="width:100%"
        >
          <el-option
            v-for="o in office"
            :key="o.id"
            :label="o.name"
            :value="o.id"
          />
        </el-select>

        <el-select
          v-model="formDataParam.leave_type_id"
          placeholder="ប្រភេទច្បាប់"
          clearable
          style="width:100%"
        >
          <el-option
            v-for="lt in leavetype"
            :key="lt.id"
            :label="lt.name"
            :value="lt.id"
          />
        </el-select>

        <el-select
          v-model="formDataParam.status_leave_id"
          placeholder="ស្ថានភាព"
          clearable
          style="width:100%"
        >
          <el-option
            v-for="st in statusleave"
            :key="st.id"
            :label="st.name"
            :value="st.id"
          />
        </el-select>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="leave"
        v-loading="loading"
        stripe
        border
        row-key="id"
        style="width:100%"
        empty-text="គ្មានទិន្នន័យ"
      >
        <el-table-column type="index" label="ល.រ" width="55" align="center" fixed />
        <el-table-column label="លេខកូដ" min-width="130" fixed>
          <template #default="{ row }">
            <div class="employee-cell">
              <div>
                <div class="emp-name-kh">{{ row.employee_code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="បុគ្គលិក" min-width="170" fixed>
          <template #default="{ row }">
            <div class="employee-cell">
              <div>
                <div class="emp-name-kh">{{ row.employee_name_kh }}</div>
                <el-text type="success" size="small">{{ row.employee_name_en }}</el-text>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ភេទ" min-widht="70" fixed align="center">
          <template #default="{row}">
            <el-tag type="primary">
              {{ row?.employee_gender === 1 ? "ប្រុស" : row?.employee_gender === 2 ? "ស្រី" : "—" }}
            </el-tag>
          </template>

        </el-table-column>

        <el-table-column label="មុខតំណែង / ការិយាល័យ" min-width="180" align="center">
          <template #default="{ row }">
            <div class="two-line ">
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
          <template #default="{row}">
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

        <!-- Branch -->
        <el-table-column prop="branch_name" label="សាខា" min-width="130" align="center"/>

        <!-- Description -->
        <el-table-column label="មូលហេតុ" min-width="140" align="center">
          <template #default="{ row }">
            <el-text>{{ row.description || '—' }}</el-text>
          </template>
        </el-table-column>

        <!-- Approved by -->
        <el-table-column label="អនុម័តដោយ" min-width="130" align="center">
          <template #default="{ row }">
            <span>{{ row.approve_by_name || '—' }}</span>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="ស្ថានភាព" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusType(row.status_leave_id)"
              effect="light"
              size="large"
            >
              {{ row.status_leave_name }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="សកម្មភាព" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="មើលលម្អិត" placement="top">
              <el-button type="primary" :icon="'View'" circle size="small" plain />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
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
  </div>
</template>

<style scoped>
.leave-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  font-size: 28px;
  color: #409eff;
}
.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d2939;
  line-height: 1.3;
}
.page-sub {
  margin: 0;
  font-size: 12px;
  color: #98a2b3;
  font-family: 'Inter', sans-serif;
}

/* Filter card */
.filter-card {
  margin-bottom: 16px;
  border-radius: 3px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 5px;
}

/* Table card */
.table-card {
  border-radius: 3px;
}

/* Employee cell */
.employee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.emp-avatar {
  background: #409eff;
  color: #fff;
  font-weight: 700;
  flex-shrink: 0;
}
.emp-name-kh {
  font-size: 13px;
  font-weight: 600;
  color: #1d2939;
}
.emp-name-en {
  font-size: 11px;
  color: #98a2b3;
  font-family: 'Inter', sans-serif;
}

/* Two-line cells */
.two-line { display: flex; flex-direction: column; gap: 2px; }
.two-line.center { align-items: center; }
.line-main { font-size: 13px; color: #344054; font-weight: 500; }
.line-sub  { font-size: 11px; color: #98a2b3; }


.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>