<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAttendance } from '../services/attendance'
import { fetchDepartment } from '../services/department'
import { fetchOffice } from '../services/office'
import { fetchBranch } from '../services/branch'
import { getuser } from '../services/userservice'
const loading = ref(false)
const attendance = ref([])
const departments = ref([])
const offices = ref([])
const expandedRows = ref([])
const branch = ref([])
const user = ref([])
const searchInputRef = ref(null)
function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
const formData = ref({
  name: '',
  branch_id: null,
  department_id: null,
  office_id: null,
  check_date_from: getToday(),
  check_date_to:getToday() ,
  is_late: null,
  is_left_early: null,
  check_in_early: null,
  check_in_on_time: null,
  check_out_on_time: null,
  check_out_overtime: null,
})

const pagination = ref({ page: 1, pageSize: 10, total: 0 })
let searchTimer = null

const statusOptions = [
  { label: 'មកយឺត', field: 'is_late' },
  { label: 'មកមុន', field: 'check_in_early' },
  { label: 'ចេញមុន', field: 'is_left_early' },
  { label: 'ចេញយឺត', field: 'check_out_overtime' },
  { label: 'ចូលទាន់ម៉ោង', field: 'check_in_on_time' },
  { label: 'ចេញត្រឹមម៉ោង', field: 'check_out_on_time' },
]


function buildParams() {
  const p = { page: pagination.value.page, pageSize: pagination.value.pageSize }
  const f = formData.value
  if (f.name.trim()) p.name = f.name.trim()
  if(f.branch_id) p.branch_id = f.branch_id
  if(f.employee_id) p.employee_id = f.employee_id
  if (f.department_id) p.department_id = f.department_id
  if (f.office_id) p.office_id = f.office_id
  if (f.check_date_from) p.check_date_from = f.check_date_from
  if (f.check_date_to) p.check_date_to = f.check_date_to
  statusOptions.forEach(({ field }) => {
    if (f[field]) p[field] = f[field]
  })
  return p
}

function getImage(row) {
  return row.profile
    ? `http://localhost:8080/profileimage/${row.profile}`
    : 'https://via.placeholder.com/40'
}

function getStatusBadges(logs) {
  const badges = new Set()
  logs.forEach(log => {
    log.attendancerecordresponse.forEach(rec => {
      if (rec.is_late) badges.add('is_late')
      if (rec.is_left_early) badges.add('is_left_early')
      if (rec.check_out_overtime) badges.add('check_out_overtime')
      if (rec.check_in_early) badges.add('check_in_early')
    })
  })
  return [...badges]
}

const badgeMap = {
  is_late: { label: 'មកយឺត', type: 'danger' },
  is_left_early: { label: 'ចេញមុន', type: 'warning' },
  check_out_overtime: { label: 'ចេញបន្ថែម', type: 'success' },
  check_in_early: { label: 'មកមុន', type: 'info' },
}

async function loadAttendance(params = {}) {
  loading.value = true
  try {
    const res = await fetchAttendance(params)
    attendance.value = res.data.data
    pagination.value.total = res.data.pagination.totalCount
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

async function loadMeta(fn, target) {
  try {
    const res = await fn()
    target.value = res.data.data
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Load failed')
  }
}

function onPageChange(p) {
  pagination.value.page = p
  loadAttendance(buildParams())
}

function onSizeChange(s) {
  pagination.value.pageSize = s
  pagination.value.page = 1
  loadAttendance(buildParams())
}

function resetFilters() {
  Object.keys(formData.value).forEach(k => {
    formData.value[k] = typeof formData.value[k] === 'string' ? '' : null
  })
  pagination.value.page = 1
  loadAttendance(buildParams())
}

onMounted(() => {
  loadAttendance(buildParams())
  loadMeta(fetchDepartment, departments)
  loadMeta(fetchOffice, offices)
  loadMeta(fetchBranch,branch)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(e){
  if(e.ctrlKey && e.key === 'f'){
    e.preventDefault() 
    searchInputRef.value?.focus()
  }
  if (e.key === 'Escape') {
    resetFilters()
  }
}

function cellStyle({ column }) {
    return { backgroundColor: '#fef9c3', color: '#000' }
  
}

watch(() => formData.value.name, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    loadAttendance(buildParams())
  }, 300)
})

watch(() => formData.value.branch_id,async (v) => {
  user.value = [];
  if(!v) return
  try{
    user.value = (await getuser(v)).data.data
  }catch(e){
ElMessage.error(e?.message || 'Load branch data failed')
  }
})

const watchFields = [
  'department_id', 'office_id', 'check_date_from', 'check_date_to',
  'is_late', 'is_left_early', 'check_in_early', 'check_in_on_time',
  'check_out_on_time', 'check_out_overtime','branch_id','employee_id'
]
watchFields.forEach(field => {
  watch(() => formData.value[field], () => {
    pagination.value.page = 1
    loadAttendance(buildParams())
  })
})
function getCheckTypeLabel(type) {
  return type === 'IN' ? 'ចូលធ្វើការ' : 'ចេញពីធ្វើការ'
}
const selectedStatus = ref(null)
function onStatusChange(field) {
  statusOptions.forEach(s => { formData.value[s.field] = null })
  // set only the selected one
  if (field) formData.value[field] = 1
  pagination.value.page = 1
  loadAttendance(buildParams())
}

function onStatusClear() {
  statusOptions.forEach(s => { formData.value[s.field] = null })
  pagination.value.page = 1
  loadAttendance(buildParams())
}

function formatDiff(scheduledTime, checkTime) {
  if (!scheduledTime || !checkTime) return '🫩'
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const diff = Math.abs(toMins(checkTime) - toMins(scheduledTime))
  // Math.abs(...) → យកតម្លៃដាច់ខាត ដើម្បីឱ្យចម្លើយជានាទីវិជ្ជមានជានិច្ច (មិនមាន - នៅខាងមុខ)
  if (diff === 0) return ''
  const h = Math.floor(diff / 60)
  // Math.floor() គឺជា function ដែល បង្គត់លេខចុះក្រោម ទៅជាចំនួនគត់ (integer)
  const m = diff % 60
  if (h > 0 && m > 0) return `${h} ម៉ោង ${m} នាទី`
  if (h > 0) return `${h} ម៉ោង`
  return `${m} នាទី`
}
</script>

<template>
  <div>
    <!-- Filters (unchanged) -->
    <el-card class="mb-4" shadow="never">
      <el-row :gutter="8" align="middle">
        <el-col :xs="24" :sm="12" :md="3">
          <el-input v-model="formData.name" placeholder="ស្វែងរកឈ្មោះ"
            clearable size="large" :prefix-icon="Search" ref="searchInputRef"/>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-select v-model="formData.branch_id" placeholder="សាខា"
            clearable filterable style="width:100%" size="large">
            <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-select v-model="formData.employee_id" placeholder="បុគ្គលិក"
            clearable filterable style="width:100%" size="large">
            <el-option v-for="e in user" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-select v-model="formData.department_id" placeholder="នាយកដ្ឋាន"
            clearable filterable style="width:100%" size="large">
            <el-option v-for="d in departments" :key="d.id" :label="d.display_name" :value="d.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-select v-model="formData.office_id" placeholder="ការិយាល័យ"
            clearable filterable style="width:100%" size="large">
            <el-option v-for="o in offices" :key="o.id" :label="o.name" :value="o.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-date-picker v-model="formData.check_date_from" type="date"
            placeholder="ចាប់ពីថ្ងៃ" value-format="YYYY-MM-DD"
            style="width:100%" size="large" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-date-picker v-model="formData.check_date_to" type="date"
            placeholder="រហូតថ្ងៃ" value-format="YYYY-MM-DD"
            style="width:100%" size="large" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-select v-model="selectedStatus" placeholder="ស្ថានភាព"
            clearable filterable style="width:100%" size="large"
            @change="onStatusChange" @clear="onStatusClear">
            <el-option v-for="s in statusOptions" :key="s.field" :label="s.label" :value="s.field" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <el-table
      v-loading="loading"
      :data="attendance"
      row-key="id"
      border
      stripe
      style="width:100%"
      height="700"
      default-expand-all
    >
      <template #empty>
        <el-empty description="គ្មានទិន្ន័យ" />
      </template>

      <!-- ✅ FIX 1: Expand row — loop over attendance_record correctly -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <div
            v-for="log in row.attendance_record"
            :key="log.id"
            class="mb-4"
          >
            <!-- Session header -->
            <div class="text-sm text-gray-800 mb-2 font-semibold">
              {{ log.session_name }} : {{ log.start_time }} – {{ log.end_time }}
            </div>

            <!-- ✅ FIX 2: Inner table data = array with just this one log record -->
            <el-table :data="[log]" size="small" border style="width:100%">

              <el-table-column label="ប្រភេទ" width="140">
                <!-- ✅ FIX 3: was missing #default slot binding -->
                <template #default="{ row: rec }">
                  <el-tag :type="rec.type === 'IN' ? 'success' : 'danger'" size="large">
                    {{ getCheckTypeLabel(rec.type) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="ម៉ោងធ្វើការ" width="160">
                <template #default="{ row: rec }">
                  {{ rec.start_time }} – {{ rec.end_time }}
                </template>
              </el-table-column>

              <el-table-column prop="check_time" label="ម៉ោងបាន Check" width="120" />

              <el-table-column label="ស្ថានភាព" min-width="220">
                <template #default="{ row: rec }">
                  <el-tag v-if="rec.is_late" type="danger" size="large" class="mr-1">
                    មកយឺត
                    <span style="font-weight:600; margin-left:4px">
                      {{ formatDiff(rec.start_time, rec.check_time) }}
                    </span>
                  </el-tag>
                  <el-tag v-if="rec.is_left_early" type="warning" size="large" class="mr-1">
                    ចេញមុន
                    <span style="font-weight:600; margin-left:4px">
                      {{ formatDiff(rec.end_time, rec.check_time) }}
                    </span>
                  </el-tag>
                  <el-tag v-if="rec.check_out_overtime" type="success" size="large" class="mr-1">
                    ចេញយឺត
                    <span style="font-weight:600; margin-left:4px">
                      {{ formatDiff(rec.end_time, rec.check_time) }}
                    </span>
                  </el-tag>
                  <el-tag v-if="rec.check_in_early" type="primary" size="large" class="mr-1">
                    មកមុន
                    <span style="font-weight:600; margin-left:4px">
                      {{ formatDiff(rec.start_time, rec.check_time) }}
                    </span>
                  </el-tag>
                  <el-tag
                    v-if="!rec.is_late && !rec.is_left_early && !rec.check_out_overtime && !rec.check_in_early"
                    type="info"
                    size="large"
                  >
                    ធម្មតា
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="កំណត់ចំណាំ" min-width="180">
                <template #default="{ row: rec }">
                  {{ rec.note || '—' }}
                </template>
              </el-table-column>

            </el-table>
          </div>
        </template>
      </el-table-column>

      <!-- Outer columns -->
      <el-table-column label="រូបភាព" width="80">
        <template #default="{ row }">
          <el-avatar :size="55" :src="getImage(row)" style="border: 2px solid #409eff;" />
        </template>
      </el-table-column>

      <el-table-column label="ឈ្មោះ" min-width="160">
        <template #default="{ row }">
          <div class="font-medium">{{ row.employee_name }}</div>
        </template>
      </el-table-column>

      <el-table-column label="សាខា" prop="branch_name" />

      <!-- ✅ BONUS: show status badges on outer row -->
      <el-table-column label="ស្ថានភាព" min-width="200">
        <template #default="{ row }">
          <template v-for="badge in getStatusBadges(row.attendance_record)" :key="badge">
            <el-tag :type="badgeMap[badge].type" size="small" class="mr-1">
              {{ badgeMap[badge].label }}
            </el-tag>
          </template>
        </template>
      </el-table-column>

    </el-table>

    <!-- Pagination -->
    <div class="flex justify-end mt-4">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

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
:deep(.el-table__expanded-cell .el-table__header-wrapper th) {
  background-color: #2980b9 !important;
  color: #ffffff !important;
}

</style>