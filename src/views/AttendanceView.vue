<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAttendance } from '../services/attendance'
import { fetchDepartment } from '../services/department'
import { fetchOffice } from '../services/office'

const loading = ref(false)
const attendance = ref([])
const departments = ref([])
const offices = ref([])
const expandedRows = ref([])

const formData = ref({
  name: '',
  department_id: null,
  office_id: null,
  check_date_from: '',
  check_date_to: '',
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
})

watch(() => formData.value.name, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    loadAttendance(buildParams())
  }, 300)
})

const watchFields = [
  'department_id','office_id','check_date_from','check_date_to',
  'is_late','is_left_early','check_in_early','check_in_on_time',
  'check_out_on_time','check_out_overtime'
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

</script>

<template>
  <div>
    <!-- Filters -->
    <el-card class="mb-4" shadow="never">
      <el-row :gutter="10" align="middle">
        <el-col :xs="24" :sm="12" :md="5">
          <el-input
            v-model="formData.name"
            placeholder="ស្វែងរកឈ្មោះ"
            clearable size="default"
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-select
            v-model="formData.department_id"
            placeholder="នាយកដ្ឋាន"
            clearable style="width:100%"
          >
            <el-option
              v-for="d in departments" :key="d.id"
              :label="d.display_name" :value="d.id"
            />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-select
            v-model="formData.office_id"
            placeholder="ការិយាល័យ"
            clearable style="width:100%"
          >
            <el-option
              v-for="o in offices" :key="o.id"
              :label="o.name" :value="o.id"
            />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-date-picker
            v-model="formData.check_date_from"
            type="date" placeholder="ចាប់ពីថ្ងៃ"
            value-format="YYYY-MM-DD" style="width:100%"
          />
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-date-picker
            v-model="formData.check_date_to"
            type="date" placeholder="រហូតថ្ងៃ"
            value-format="YYYY-MM-DD" style="width:100%"
          />
        </el-col>
<el-col :xs="24" :sm="12" :md="3">
  <el-select
    v-model="selectedStatus"
    placeholder="ស្ថានភាព"
    clearable
    style="width:100%"
    @change="onStatusChange"
    @clear="onStatusClear"
  >
    <el-option
      v-for="s in statusOptions"
      :key="s.field"
      :label="s.label"
      :value="s.field"
    />
  </el-select>
</el-col>
      </el-row>
    </el-card>

    <!-- Table -->
    <el-table
      v-loading="loading"
      :data="attendance"
      row-key="employee_id"
      border stripe
      style="width:100%"
    >
      <!-- Expand column -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <div
            v-for="log in row.attendancelogresponse"
            :key="log.id"
            class="mb-4"
          >
            <div class="text-sm text-gray-800 mb-2">
              វេន {{ log.attendancerecordresponse[0]?.shift_order }} ·
              {{ log.branch_name }} · {{ log.status_attendance_log_name }}
            </div>
            <el-table
              :data="log.attendancerecordresponse"
              size="small"
              border
              style="width:100%"
            >
              <el-table-column label="ប្រភេទ" width="80">
<template #default="{ row: rec }">
  <el-tag
    :type="rec.type === 'IN' ? 'success' : 'danger'"
    size="small"
  >
    {{ getCheckTypeLabel(rec.type) }}
  </el-tag>
</template>
              </el-table-column>
              <el-table-column label="ម៉ោងធ្វេីការ" width="150">
                <template #default="{ row: rec }">
                  {{ rec.start_time }} – {{ rec.end_time }}
                </template>
              </el-table-column>
              <el-table-column prop="check_time" label="ម៉ោងបាន Check" width="110" />
              <el-table-column label="ស្ថានភាព" min-width="160">
                <template #default="{ row: rec }">
                  <el-tag v-if="rec.is_late" type="danger" size="large" class="mr-1">មកយឺត</el-tag>
                  <el-tag v-if="rec.is_left_early" type="warning" size="large" class="mr-1">ចេញមុន</el-tag>
                  <el-tag v-if="rec.check_out_overtime" type="success" size="large" class="mr-1">ចេញយឺត</el-tag>
                  <el-tag v-if="rec.check_in_early" type="info" size="large" class="mr-1">មកមុន</el-tag>
                  <el-tag
                    v-if="!rec.is_late && !rec.is_left_early && !rec.check_out_overtime && !rec.check_in_early"
                    type="info" size="large"
                  >ធម្មតា</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="note" label="កំណត់ចំណាំ" min-width="180">
                <template #default="{ row: rec }">
                  {{ rec.note || '—' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <!-- Avatar -->
      <el-table-column label="" width="60">
        <template #default="{ row }">
          <el-avatar :size="40" :src="getImage(row)">
            {{ row.employee_name_en?.slice(0,1) }}
          </el-avatar>
        </template>
      </el-table-column>

      <el-table-column label="ឈ្មោះ" min-width="160">
        <template #default="{ row }">
          <div class="font-medium">{{ row.employee_name_kh }}</div>
          <div class="text-xs text-gray-400">{{ row.employee_name_en }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="position_display_name" label="តួនាទី" min-width="160" />
      <el-table-column prop="department_display_name" label="នាយកដ្ឋាន" min-width="140" />
      <el-table-column prop="office_name" label="ការិយាល័យ" min-width="140" />

      <el-table-column label="ថ្ងៃ" width="130">
        <template #default="{ row }">
          {{ row.attendancelogresponse[0]?.check_date?.slice(0,10) || '—' }}
        </template>
      </el-table-column>

      <el-table-column label="ស្ថានភាព" min-width="180">
        <template #default="{ row }">
          <template v-for="key in getStatusBadges(row.attendancelogresponse)" :key="key">
            <el-tag :type="badgeMap[key]?.type" size="small" class="mr-1">
              {{ badgeMap[key]?.label }}
            </el-tag>
          </template>
          <el-tag
            v-if="getStatusBadges(row.attendancelogresponse).length === 0"
            type="info" size="small"
          >ធម្មតា</el-tag>
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
:deep(.el-table__expand-icon) { font-size: 16px; }
:deep(.el-table__expanded-cell) {
  padding: 12px 20px !important;
  background-color: #f5f7fa;
}
:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>