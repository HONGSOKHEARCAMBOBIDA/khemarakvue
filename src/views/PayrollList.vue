<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchpayroll, fetchpayrollstatus,approvepayroll,deletepayroll } from "../services/payroll";
import { fetchBranch } from "../services/branch";
import { fetchDepartment } from "../services/department";
import { fetchPosition } from "../services/position";
import { fetchOffice } from "../services/office";
import { markRaw } from 'vue'
import { Search, Refresh,  View as IconView, Check, Edit, Plus, Close, Calendar, Money, User, Delete } from "@element-plus/icons-vue";
const loading = ref(false);
const payroll  = ref([]);
const branches      = ref([]);
const departments   = ref([]);
const positions     = ref([]);
const offices       = ref([]);
const payrollstatus = ref([]);
const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
const formData = ref({
  name:          "",
  branch_id:     null,
  position_id:   null,
  status_id:     1,
  office_id:     null,
  department_id: null,
  start_date:    "",
  end_date:      "",
});

const pagination = ref({
  page:      1,
  pageSize:  10,
  total:     0,
});

let searchTimer = null;

const totalBasic = computed(() =>
  payroll.value.reduce((s, r) => s + parseFloat(r.basic_salary || 0), 0).toFixed(2)
);
const totalDeduction = computed(() =>
  payroll.value.reduce((s, r) => s + parseFloat(r.total_deduction || 0), 0).toFixed(2)
);
const totalNet = computed(() =>
  payroll.value.reduce((s, r) => s + parseFloat(r.net_salary || 0), 0).toFixed(2)
);

function buildParams() {
  const p = {
    page:     pagination.value.page,
    pageSize: pagination.value.pageSize,
  };
  if (formData.value.name.trim())        p.name          = formData.value.name.trim();
  if (formData.value.branch_id)          p.branch_id     = formData.value.branch_id;
  if (formData.value.department_id)      p.department_id = formData.value.department_id;
  if (formData.value.position_id)        p.position_id   = formData.value.position_id;
  if (formData.value.office_id)          p.office_id     = formData.value.office_id;
  if (formData.value.status_id)          p.status_id     = formData.value.status_id;
  if (formData.value.start_date)         p.start_date    = formData.value.start_date;
  if (formData.value.end_date)           p.end_date      = formData.value.end_date;
  return p;
}

function getImage(row) {
  const file = row[0]?.profile_image;
  return file ? `https://7ml45f42-8080.asse.devtunnels.ms/profileimage/${file}` : "";
}

function getImageQR(row) {
  const file = row[0]?.qr_code_bank_account;
  return file ? `https://7ml45f42-8080.asse.devtunnels.ms/qrcodeimage/${file}` : "";
}

function statusTagType(status) {
  if (!status) return "info";
  const s = status.toUpperCase();
  if (s === "បានបេីក") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "កំពុងស្នេីរ")  return "warning";
  return "info";
}

function genderLabel(g) {
  return g === 1 ? "ប្រុស" : g === 2 ? "ស្រី" : "—";
}

async function loadpayroll(params = {}) {
  loading.value = true;
  try {
    const res = await fetchpayroll(params);
    payroll.value            = res.data.data;
    pagination.value.total   = res.data.pagination.totalCount;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Failed to load payroll");
  } finally {
    loading.value = false;
  }
}

async function loadLookup(fn, target) {
  try {
    const res = await fn();
    target.value = res.data.data;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Failed to load options");
  }
}


function onPageChange(newPage) {
  pagination.value.page = newPage;
  loadpayroll(buildParams());
}

function onSizeChange(newSize) {
  pagination.value.pageSize = newSize;
  pagination.value.page     = 1;
  loadpayroll(buildParams());
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(
      `ប្រាក់ខែសម្រាប់ ${row.employee_name_kh} ចំនួន ${row.net_salary} ${row.currency_name}?`,
      "បញ្ជាក់ការយល់ព្រម",
      { type: "warning", confirmButtonText: "អនុម័ត", cancelButtonText: "ចាកចេញ" }
    );
    // TODO: call your approve API here, e.g.: await approvePayroll(row.id)
    await approvepayroll(row.id)
    ElMessage.success("ប្រាក់ខែបានអនុម័តបានជោគជ័យ");
    loadpayroll(buildParams());
  } catch {
    // user cancelled — do nothing
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `លុបប្រាក់ខែសម្រាប់ ${row.employee_name_kh} ចំនួន ${row.net_salary} ${row.currency_name}?`,
      "បញ្ជាក់ការយល់ព្រម",
      { type: "warning", confirmButtonText: "លុប", cancelButtonText: "ចាកចេញ", icon: markRaw(Delete), }
    );
    await deletepayroll(row.id)
    ElMessage.success("ប្រាក់ខែបានលុបបានជោគជ័យ");
    loadpayroll(buildParams());
  } catch {
  }
}

function resetFilters() {
  formData.value = {
    name:          "",
    branch_id:     null,
    position_id:   null,
    status_id:     null,
    office_id:     null,
    department_id: null,
    start_date:    "",
    end_date:      "",
  };
  positions.value = [];
  pagination.value.page = 1;
  loadpayroll(buildParams());
}


onMounted(() => {
  loadpayroll(buildParams());
  loadLookup(fetchBranch,         branches);
  loadLookup(fetchDepartment,     departments);
  loadLookup(fetchOffice,         offices);
  loadLookup(fetchpayrollstatus,  payrollstatus);
});


watch(() => formData.value.name, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadpayroll(buildParams());
  }, 300);
});

watch(() => formData.value.branch_id, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});

watch(() => formData.value.department_id, async (newDeptId) => {
  positions.value            = [];
  formData.value.position_id = null;
  pagination.value.page      = 1;
  await loadpayroll(buildParams());
  if (newDeptId) {
    try {
      const res = await fetchPosition(newDeptId);
      positions.value = res.data.data;
    } catch {
      ElMessage.warning("No positions found for this department");
    }
  }
});

watch(() => formData.value.position_id, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});

watch(() => formData.value.office_id, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});

watch(() => formData.value.status_id, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});

watch(() => formData.value.start_date, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});

watch(() => formData.value.end_date, () => {
  pagination.value.page = 1;
  loadpayroll(buildParams());
});
</script>

<template>
  <div class="payroll-page">
    <!-- <el-row :gutter="12" class="summary-row">
      <el-col :span="6">
        <div class="stat-card">
          <p class="stat-label">បុគ្គលិកសរុប</p>
          <p class="stat-value">{{ pagination.total }} នាក់</p>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <p class="stat-label">ប្រាក់ដេីមសរុប</p>
          <p class="stat-value">{{ totalBasic }}</p>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card--danger">
          <p class="stat-label">ប្រាក់កាត់ពីបុគ្គលិកសរុប</p>
          <p class="stat-value">{{ totalDeduction }}</p>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card--success">
          <p class="stat-label">ប្រាក់ត្រូវបេីកសរុប</p>
          <p class="stat-value">{{ totalNet }}</p>
        </div>
      </el-col>
    </el-row> -->

    <el-card class="filter-card" shadow="never">
      <el-row :gutter="10">
        <!-- Name search -->
         <el-col>
          
         </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-input
            v-model="formData.name"
            placeholder="ស្វែងរក...."
            clearable
            prefix-icon="Search"
          />
        </el-col>

        <!-- Branch -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select
            v-model="formData.branch_id"
            placeholder="សាខា"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="b in branches"
              :key="b.id"
              :label="b.name"
              :value="b.id"
            />
          </el-select>
        </el-col>

        <!-- Department -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select
            v-model="formData.department_id"
            placeholder="នាយកដ្ឋាន"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="d in departments"
              :key="d.id"
              :label="d.display_name"
              :value="d.id"
            />
          </el-select>
        </el-col>

        <!-- Position (depends on department) -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select
            v-model="formData.position_id"
            placeholder="តួនាទី"
            clearable
            :disabled="!formData.department_id"
            style="width: 100%"
          >
            <el-option
              v-for="p in positions"
              :key="p.id"
              :label="p.display_name"
              :value="p.id"
            />
          </el-select>
        </el-col>

        <!-- Office -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select
            v-model="formData.office_id"
            placeholder="ការិយាល័យ"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="o in offices"
              :key="o.id"
              :label="o.name"
              :value="o.id"
            />
          </el-select>
        </el-col>

        <!-- Status -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select
            v-model="formData.status_id"
            placeholder="ស្ថានភាព"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="s in payrollstatus"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-col>

        <!-- Start date -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-date-picker
            v-model="formData.start_date"
            type="date"
            placeholder="ចាប់ពី"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-col>

        <!-- End date -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-date-picker
            v-model="formData.end_date"
            type="date"
            placeholder="រហូតដល់"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-col>

        <!-- Reset button -->
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-button @click="resetFilters" style="width: 100%">
            លុបការស្វែងរក
          </el-button>
        </el-col>
                <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-button @click="navigateTo('/payroll')" style="width: 100%">
            បេីកប្រាក់ខែថ្មី
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="payroll"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        empty-text="No payroll records found"
      >
                 <el-table-column label="QR" width="70" align="center" fixed>
          <template #default="{ row }">
            <el-image
              v-if="row.qr_code_bank_account"
              :src="getImageQR([row])"
              :preview-src-list="[getImageQR([row])]"
              style="width: 32px; height: 32px; border-radius: 4px;"
              fit="cover"
              preview-teleported
            />
            <span v-else class="amount amount--muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="បុគ្គលិក" min-width="130" fixed>
          <template #default="{ row }">
            <div class="emp-cell">
              <div class="emp-info">
                <el-text tag="b" style="color: black;">{{ row.employee_name_kh }}</el-text>
                <div class="emp-name-en">{{ row.employee_name_en }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ភេទ" width="80" align="center">
          <template #default="{ row }">
            <span>{{ genderLabel(row.employee_gender) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ប្រាក់ខែគោល" width="110" align="right">
          <template #default="{ row }">
            <span class="amount">{{ parseFloat(row.basic_salary).toFixed(2) }} {{ row.currency_name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="ពាក់កណ្ដាលខែ" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">{{ parseFloat(row.half_salary).toFixed(2) }} {{ row.currency_name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="កាត់ បសស" width="90" align="right">
          <template #default="{ row }">
            <span class="amount">{{ parseFloat(row.pensionfund).toFixed(2) }} {{ row.currency_name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="កាត់កម្ចី" width="110" align="right">
          <template #default="{ row }">
           <el-text tag="b" style="color: black;" >{{ row.loan_deduction }} {{ row.currency_name }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="ប្រាក់លេីកទឹកចិត្ត" width="120" align="right">
          <template #default="{ row }">
            <el-text v-if="row.is_bonus">{{ row.bonus_amount }} {{ row.currency_name }} <el-tag>{{ row.bonus_type_name }}</el-tag></el-text>
            <el-text v-else>គ្មាន</el-text>
          </template>
        </el-table-column>

        <el-table-column label="កាត់សរុប" width="115" align="right">
          <template #default="{ row }">
            <el-text>{{ row.total_deduction }} {{ row.currency_name }}</el-text>
          </template>
        </el-table-column>
  <el-table-column label="ថ្ងៃធ្វេីការ" width="90" align="center">
    <template #default="{row}">
      <el-text>{{ row.total_work_day }} ថ្ងៃ</el-text>
    </template>
  </el-table-column>
        <el-table-column label="ប្រាក់ខែទទួលបាន" width="130" align="right">
          <template #default="{ row }">
            <el-tag style="font-weight: bold;" size="large" type="success">{{ row.net_salary }} {{ row.currency_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="ស្ថានភាព" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status_name)" size="large">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="position_name"
          label="តួនាទី"
          min-width="170"
          show-overflow-tooltip
        />

        <el-table-column
          prop="office_name"
          label="ការិយាល័យ"
          min-width="140"
          show-overflow-tooltip
        />

        <el-table-column
          prop="branch_name"
          label="សាខា"
          min-width="150"
          show-overflow-tooltip
        />

        <el-table-column prop="payroll_date" label="ថ្ងៃទីបេីកប្រាក់ខែ" width="115" align="center" />

        



        <el-table-column label="ធនាគា" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="bank-cell">
              <div class="bank-name">{{ row.bank_name }}</div>
              <el-tag>{{ row.bank_account_number }}</el-tag>
            </div>
          </template>
        </el-table-column>



        <!-- Note -->
        <el-table-column label="សំគាល់" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="amount amount--muted">{{ row.note || '—' }}</span>
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column label="សកម្មភាព" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.show_approve_button"
              size="large"
              type="success"
             :icon="Check"
             circle
              @click="handleApprove(row)"
            >
            </el-button>
            <el-button
            v-if="row.show_approve_button"
            size="large"
            type="danger"
            :icon="Delete"
            circle 
            @click="handleDelete(row)"
            >

            </el-button>
            <span v-else class="amount amount--muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="pagination-row">
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
.payroll-page {
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* Summary cards */
.summary-row {
  margin-bottom: 0;
}
.stat-card {
  background: #f7f7f7;
  border-radius: 4px;
  padding: 14px 18px;
  border-color: #67c23a;
  border-width: 1px;
}

.stat-label {
  font-size: 16px;
  color: #000000;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

/* Filters */
.filter-card {
  border-radius: 4px;
}
.filter-card :deep(.el-card__body) {
  padding: 14px 16px;
}
.filter-card .el-row {
  row-gap: 10px;
}

/* Table card */
.table-card {
  border-radius: 5px;
}
.table-card :deep(.el-card__body) {
  padding: 0;
}

/* Employee cell */
.emp-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.emp-info {
  overflow: hidden;
  min-width: 0;
}
.emp-name-en {
  font-size: 13px;
  font-weight: 600;
  color: #6585c4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.emp-name-kh {
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Amount cells */
.amount {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.amount--bold    { font-weight: 700; color: #1a1a2e; }
.amount--danger  { color: #f56c6c; }
.amount--success { color: #67c23a; }
.amount--muted   { color: #c0c4cc; font-weight: 400; }

/* Sub labels */
.sub-label {
  font-size: 11px;
  color: #c0c4cc;
  line-height: 1.3;
}

/* Bank cell */
.bank-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

/* Pagination */
.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding: 14px 16px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>