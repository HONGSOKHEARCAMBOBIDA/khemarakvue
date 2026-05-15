<script setup>
import { onMounted, reactive, ref, watch, computed } from 'vue';
import { ElMessage,ElMessageBox  } from 'element-plus';
import { fetchloan, createloan,deleteloan } from '../services/loan';
import { fetchBranch } from '../services/branch';
import { fetchCurrency } from '../services/currency';
import { getuser } from '../services/userservice';
import { Search, Refresh,  View as IconView, Check, Edit, Plus, Close, Calendar, Money, User, Delete } from "@element-plus/icons-vue";
import { markRaw } from 'vue'
// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false);
const submitting = ref(false);
const loans = ref([]);
const branch = ref([]);
const user = ref([]);
const expandedRows = ref([]);
const drawerVisible = ref(false);
const drawerMode = ref('create'); // 'create' | 'view'
const selectedLoan = ref(null);
const currency = ref([]);
const formDataParam = ref({
  search: "",
  employee_id: null,
  branch_id: null,
  status: null
});

const pagination = ref({ page: 1, pageSize: 10, total: 0 });
let searchTimer = null;

const formData = reactive({
  employee_id: null,
  loan_amount: '',
  currency_id: null,
  loan_purpose: '',
  loan_duration: null,
  loan_start_date: '',
});

const formRef = ref(null);

const formRules = {
  employee_id:    [{ required: true, message: 'Employee is required', trigger: 'change' }],
  loan_amount:    [{ required: true, message: 'Loan amount is required', trigger: 'blur' }],
  currency_id:    [{ required: true, message: 'Currency is required', trigger: 'change' }],
  loan_duration:  [{ required: true, message: 'Duration is required', trigger: 'change' }],
  loan_start_date:[{ required: true, message: 'Start date is required', trigger: 'change' }],
};

const statusMap = {
  0: { label: 'Pending', color: '#f59e0b' },
  1: { label: 'Active', color: '#10b981' },
  2: { label: 'Closed', color: '#6b7280' },
  3: { label: 'Rejected', color: '#ef4444' },
};


const durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildParams() {
  const p = { page: pagination.value.page, pageSize: pagination.value.pageSize };
  const f = formDataParam.value;
  if (f.search?.trim()) p.search = f.search.trim();
  if (f.employee_id) p.employee_id = f.employee_id;
  if (f.branch_id) p.branch_id = f.branch_id;
  if (f.status !== null && f.status !== undefined && f.status !== '') p.status = f.status;
  return p;
}


// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadLoan(params = {}) {
  loading.value = true;
  try {
    const res = await fetchloan(params);
    loans.value = res.data.data;
    pagination.value.total = res.data.pagination.totalCount;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Failed to load loans");
  } finally {
    loading.value = false;
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `តើអ្នកចង់លុបកម្ចី ${row.employee_name} : ${Number(row.loan_amount).toLocaleString()} ${row.currency_code} មែនទេ?`,
      'បញ្ជាក់ការលុប',
      {
        confirmButtonText: 'លុប',
        cancelButtonText: 'បោះបង់',
        type: 'warning',
        icon: markRaw(Delete),
      }
    );
    await deleteloan(row.id);
    ElMessage.success('លុបកម្ចីបានជោគជ័យ');
    loadLoan(buildParams());
  } catch (e) {
    if (e === 'cancel') {
      ElMessage.info('ការលុបត្រូវបានបោះបង់');
    } else {
     const msg = e.response?.data?.error || e.response?.data?.message || e.message
      ElMessage.error(msg);
    }
  }
}

async function loadLookup(fn, target) {
  try {
    const res = await fn();
    target.value = res.data.data;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Load failed");
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function onPageChange(newPage) {
  pagination.value.page = newPage;
  loadLoan(buildParams());
}

function onSizeChange(newSize) {
  pagination.value.pageSize = newSize;
  pagination.value.page = 1;
  loadLoan(buildParams());
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function resetFilters() {
  formDataParam.value = { employee_id: null, branch_id: null, status: null, search: "" };
  user.value = [];
  pagination.value.page = 1;
  loadLoan(buildParams());
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function openCreate() {
  drawerMode.value = 'create';
  Object.assign(formData, {
    employee_id: null, loan_amount: '', currency_id: null,
    loan_purpose: '', loan_duration: null, loan_start_date: ''
  });
  drawerVisible.value = true;
}




function closeDrawer() {
  drawerVisible.value = false;
  selectedLoan.value = null;
}

async function submitCreate() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await createloan(formData);
      ElMessage.success("Loan created successfully");
      closeDrawer();
      loadLoan(buildParams());
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || e?.message || "Failed to create loan");
    } finally {
      submitting.value = false;
    }
  });
}

// ─── Row expand ───────────────────────────────────────────────────────────────
function toggleExpand(row) {
  const idx = expandedRows.value.indexOf(row.id);
  if (idx === -1) expandedRows.value.push(row.id);
  else expandedRows.value.splice(idx, 1);
}

function isExpanded(row) {
  return expandedRows.value.includes(row.id);
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(() => formDataParam.value.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadLoan(buildParams());
  }, 300);
});

watch(() => formDataParam.value.branch_id, async (v) => {
  pagination.value.page = 1;
  user.value = [];
  formDataParam.value.employee_id = null;
  if (v) {
    try { user.value = (await getuser(v)).data.data; } catch { }
  }
  loadLoan(buildParams());
});

watch(() => formDataParam.value.status, () => {
  pagination.value.page = 1;
  loadLoan(buildParams());
});

watch(() => formDataParam.value.employee_id, () => {
  pagination.value.page = 1;
  loadLoan(buildParams())
})

watch(() => formData.branch_id, async (v) => {
  formData.employee_id = null;
  formData.approve_by = null;
  user.value = [];
  if (v) {
    try { user.value = (await getuser(v)).data.data; } catch { }
  }
});



onMounted(() => {
  loadLookup(fetchBranch, branch);
  loadLoan(buildParams());
  loadLookup(fetchCurrency, currency)
});
</script>

<template>
  <div class="loan-page">
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">គ្រប់គ្រងកម្ចី</h1>
        </div>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon>
          <Plus />
        </el-icon>
        បង្កេីតថ្មី
      </el-button>
    </div>
    <div class="filter-card">
      <el-input v-model="formDataParam.search" placeholder="ស្វែងរកដោយឈ្មោះ......" class="filter-search" clearable>
        <template #prefix><el-icon>
            <Search />
          </el-icon></template>
      </el-input>

      <el-select v-model="formDataParam.branch_id" placeholder="Branch" clearable class="filter-select">
        <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
      </el-select>

      <el-select v-model="formDataParam.employee_id" placeholder="Employee" clearable class="filter-select"
        :disabled="!formDataParam.branch_id">
        <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
      </el-select>

      <el-select v-model="formDataParam.status" placeholder="Status" clearable class="filter-select"
        style="width:130px">
        <el-option label="បង់ផ្ដាច់" :value="0" />
        <el-option label="កំពុងខ្ចី" :value="1" />
      </el-select>

      <el-button type="warning" plain :icon="Refresh" @click="resetFilters">លុបការស្វែងរក</el-button>
    </div>

    <!-- ── Table ──────────────────────────────────────────────────────── -->
    <div class="table-card">
      <el-table :data="loans" v-loading="loading" row-key="id" :expand-row-keys="expandedRows.map(String)"
        class="loan-table">
        <!-- Expand -->
        <el-table-column type="expand" width="40">
          <template #default="{ row }">
            <div class="schedule-expand">
              <div class="schedule-header">
                <span class="schedule-title">តារាំងបង់ប្រាក់</span>
                <el-tag type="danger" size="small">{{ row.currency_code }}</el-tag>
              </div>

              <el-table :data="row.schedule" class="inner-table" size="small">
                <el-table-column label="ល.រ" type="index" width="120" />
                <el-table-column prop="payment_date" label="ថ្ងៃត្រូវបង់ប្រាក់" width="200" />
                <el-table-column prop="paid_date" label="ថ្ងៃបានបង់ប្រាក់" width="200">
                  <template #default="{ row: s }">
                    <span :class="s.paid_date ? 'date-paid' : 'date-empty'">{{ s.paid_date || '—' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="principle_amount" label="ប្រាក់ដើមត្រូវបង់" align="right" width="220">
                  <template #default="{ row: s }">
                    <span class="amt">{{ Number(s.principle_amount).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="rate_amount" label="ការប្រាក់ត្រូវបង់" align="right" width="210">
                  <template #default="{ row: s }">
                    <span class="amt">{{ Number(s.rate_amount).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="income_amount" label="ទឹកប្រាក់សរុបត្រូវបង់" align="right" width="210">
                  <template #default="{ row: s }">
                    <span class="amt">{{ Number(s.income_amount).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="principle_paid" label="ប្រាក់ដេីមបានបង់" align="right" width="220">
                  <template #default="{ row: s }">

                    <span class="amt">{{ Number(s.principle_paid).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="rate_paid" label="ការប្រាក់បានបង់" align="right" width="220">
                  <template #default="{ row: s }">

                    <span class="amt">{{ Number(s.rate_paid).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="income_paid" label="ប្រាក់សរុបបានបង់" align="right" width="220">
                  <template #default="{ row: s }">

                    <span class="amt">{{ Number(s.income_paid).toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="ស្ថានភាព" width="150" align="center">
                  <template #default="{ row: s }">
                    <el-tag :type="s.status === 1 ? 'warning' : 'success'">{{ s.status === 1 ? 'មិនទាន់បង់' :
                      'បានបង់រូចរាល់' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="code" label="លេខកូដកម្ចី" width="200" border>
          <template #default="{ row }">
            <el-link>{{ row.code }}<el-icon class="el-icon--right"><icon-view /></el-icon></el-link>
          </template>
        </el-table-column>

        <el-table-column label="ឈ្មោះបុគ្គលិក" width="200">
          <template #default="{ row }">
            <div class="emp-cell">
              <div>
                <div class="emp-name">{{ row.employee_name }}</div>
                <div class="emp-meta">{{ row.employee_code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="លេខទូរសព្ទ" width="180" align="center">
          <template #default="{ row }">
            <el-text>{{ row.employee_contact }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="ឈ្មោះអ្នកអនុម័ត" width="180" align="center">
          <template #default="{ row }">
            <el-text>{{ row.approve_by_name }}</el-text>
          </template>
        </el-table-column>
        <!-- Amount -->
        <el-table-column label="ទំហំកម្ចី" width="180" align="center">
          <template #default="{ row }">
            <div class="amount-cell">
              <span class="amount">{{ Number(row.loan_amount).toLocaleString() }}</span>
              <el-tag type="danger">{{ row.currency_code }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="វគ្គកម្ចី" width="150" align="center">
          <template #default="{ row }">
            <el-text>{{ row.number_of_loan }}</el-text>
          </template>
        </el-table-column>

        <!-- Branch -->
        <el-table-column prop="branch_name" label="សាខា" width="220" align="center">
          <template #default="{ row }">
            <el-text tag="b" >{{ row.branch_name }}</el-text>
          </template>
        </el-table-column>



        <!-- Duration -->
        <el-table-column label="រយៈពេលកម្ចី" width="150" align="center">
          <template #default="{ row }">
            <el-text tag="b" >{{ row.loan_duration }} ខែ</el-text>
          </template>
        </el-table-column>

        <!-- Dates -->
        <el-table-column label="ថ្ងៃអនុម័ត" width="120">
          <template #default="{ row }">
            <div class="date-range">
              <span class="dr-from">{{ row.loan_start_date }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="គោលបំណង" width="210">
          <template #default="{ row }">
            <div class="">
              <span class="dr-from">{{ row.loan_purpose }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="ស្ថានភាព" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.loan_status === 1 ? 'warning' : 'success'">
              {{ row.loan_status === 1 ? 'កំពុងខ្ចី' : 'បានបង់ផ្ដាច់' }}
            </el-tag>
          </template>
        </el-table-column>
        >

        <!-- Actions -->
        <el-table-column label="សកម្មភាព" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="Delete" placement="top">

  <el-button type="danger" :icon="Delete" circle @click="handleDelete(row)" ></el-button>
</el-tooltip>
              <el-tooltip content="Schedule" placement="top">
                <el-button type="success" :icon="Calendar" circle @click="toggleExpand(row)"></el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <span class="total-info">{{ pagination.total }} records</span>
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="pagination.total" layout="sizes, prev, pager, next"
          @current-change="onPageChange" @size-change="onSizeChange" background />
      </div>
    </div>

    <!-- ── Create Drawer ──────────────────────────────────────────────── -->
    <el-drawer v-model="drawerVisible" :title="drawerMode === 'create' ? 'បង្កេីតកម្ចីថ្មី' : 'កម្ចីលំអិត'"
      direction="rtl" size="520px" class="loan-drawer" :before-close="closeDrawer">
      <!-- Create Form -->
      <template v-if="drawerMode === 'create'">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="loan-form">

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="ជ្រេីសរេីសសាខា" prop="branch_id">
                <el-select v-model="formData.branch_id" placeholder="Select branch" filterable style="width:100%">
                  <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ជ្រេីសរេីសបុគ្គលិក" prop="employee_id">
                <el-select v-model="formData.employee_id" placeholder="Select employee" filterable style="width:100%"
                  :disabled="!formData.branch_id">
                  <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="14">
              <el-form-item label="ទំហំកម្ចី" prop="loan_amount">
                <el-input v-model="formData.loan_amount" placeholder="0.00" type="number" min="0">
                  <template #suffix><span class="input-suffix"></span></template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="រូបិយប័ណ្ណ" prop="currency_id">
                <el-select v-model="formData.currency_id" placeholder="Currency" style="width:100%">
                  <el-option v-for="c in currency" :key="c.id" :label="c.name" :value="c.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="រយៈពេលគិតជាខែ" prop="loan_duration">
            <div class="duration-pills">
              <button v-for="d in durationOptions" :key="d" type="button" class="dur-pill"
                :class="{ active: formData.loan_duration === d }" @click="formData.loan_duration = d">{{ d }}
                ខែ</button>
            </div>
          </el-form-item>

          <el-form-item label="គោលបំណងកម្ចី">
            <el-input v-model="formData.loan_purpose" type="textarea" :rows="3"
              placeholder="Describe the purpose of this loan…" />
          </el-form-item>






          <el-form-item label="ថ្ងៃចាប់ផ្ដេីមកម្ចី" prop="loan_start_date">
            <el-date-picker v-model="formData.loan_start_date" type="date" placeholder="Pick start date"
              style="width:100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>





        </el-form>

        <div class="drawer-footer">
          <el-button @click="closeDrawer">ចាកចេញ</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCreate">
            បញ្ចូនទិន្ន័យ
          </el-button>
        </div>
      </template>

      <!-- View Mode -->

    </el-drawer>
  </div>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────────────────────── */
.loan-page {
  padding: 14px;
  min-height: 100vh;
  background: #f4f6fb;

}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b5bdb, #4c6ef5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(59, 91, 219, .3);
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1f36;
  margin: 0;
}

.page-sub {
  font-size: .82rem;
  color: #6b7280;
  margin: 0;
}


.filter-card {
  background: #fff;
  border-radius: 4px;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.filter-search {
  width: 240px;
}

.filter-select {
  width: 180px;
}


/* ── Table Card ──────────────────────────────────────────────────────────────── */
.table-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.loan-table {
  width: 100%;
}

/* Table row stripe */
:deep(.el-table__row:nth-child(even)) {
  background: #f9fafb;
}

:deep(.el-table th) {
  background: #f1f5ff !important;
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: .8rem !important;
}

:deep(.el-table td) {
  padding: 12px 10px !important;
  vertical-align: middle !important;
}

/* ── Cell Styles ─────────────────────────────────────────────────────────────── */
.loan-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .78rem;
  font-weight: 600;
  background: #eff2ff;
  color: #3b5bdb;
  padding: 3px 8px;
  border-radius: 6px;
}

.emp-cell {
  display: flex;
  align-items: center;
  padding-top: 10px;
}

.emp-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #748ffc, #3b5bdb);
  color: #fff;
  font-weight: 700;
  font-size: .88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emp-name {
  font-weight: 600;
  font-size: .87rem;
  color: #1a1f36;
  line-height: 1.2;
}

.emp-meta {
  font-size: .74rem;
  color: #9ca3af;
}

.branch-tag {
  background: #f0fdf4;
  color: #15803d;
  font-size: .78rem;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
}

.amount-cell {
  display: flex;
  align-items: baseline;
  gap: 4px;
  justify-content: flex-end;
}

.amount {
  font-weight: 700;
  font-size: .9rem;
  color: #1a1f36;
}

.currency {
  font-size: .73rem;
  color: #9ca3af;
  font-weight: 600;
}

.duration-badge {
  background: #faf5ff;
  color: #7c3aed;
  font-size: .78rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .78rem;
}

.dr-from,
.dr-to {
  color: #4b5563;
}

.status-pill {
  font-size: .75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.approver {
  font-size: .83rem;
  color: #374151;
}

/* ── Action Buttons ──────────────────────────────────────────────────────────── */
.action-btns {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .12s, box-shadow .12s;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, .12);
}

.action-btn.view {
  background: #eff2ff;
  color: #3b5bdb;
}

.action-btn.expand {
  background: #ecfdf5;
  color: #059669;
}

/* ── Expand Schedule ─────────────────────────────────────────────────────────── */
.schedule-expand {
  padding: 16px 24px 20px;
  background: #f8fafc;
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.schedule-title {
  font-weight: 700;
  font-size: .9rem;
  color: #1a1f36;
}

.schedule-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-label {
  font-size: .78rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b5bdb, #748ffc);
  border-radius: 99px;
  transition: width .4s;
}

.inner-table {
  border-radius: 0px;
  overflow: hidden;
}

:deep(.inner-table .el-table__header-wrapper th) {
  background: #f1f5ff !important;
  font-size: .76rem !important;
}

.schedule-badge {
  font-size: .72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.date-paid {
  color: #059669;
  font-weight: 500;
}

.date-empty {
  color: #d1d5db;
}

.amt {
  font-family: 'JetBrains Mono', monospace;
  font-size: .8rem;
}

.schedule-summary {
  display: flex;
  gap: 32px;
  margin-top: 14px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: .73rem;
  color: #9ca3af;
  font-weight: 500;
}

.summary-value {
  font-size: .9rem;
  font-weight: 700;
  color: #1a1f36;
  font-family: 'JetBrains Mono', monospace;
}

.summary-value.paid {
  color: #059669;
}

/* ── Pagination ──────────────────────────────────────────────────────────────── */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #f1f5ff;
}

.total-info {
  font-size: .8rem;
  color: #9ca3af;
  font-weight: 500;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #3b5bdb !important;
}

/* ── Drawer ──────────────────────────────────────────────────────────────────── */
:deep(.loan-drawer .el-drawer__header) {
  font-weight: 700 !important;
  font-size: 1rem !important;
  border-bottom: 1px solid #f1f5ff;
  padding-bottom: 16px;
}

:deep(.loan-drawer .el-drawer__body) {
  padding: 20px 24px;
  overflow-y: auto;
}

.form-section-title {
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #9ca3af;
  margin: 20px 0 12px;
}

.form-section-title:first-child {
  margin-top: 0;
}

:deep(.loan-form .el-form-item__label) {
  font-weight: 600;
  font-size: .83rem;
  color: #374151;
}

:deep(.loan-form .el-input__wrapper),
:deep(.loan-form .el-textarea__inner),
:deep(.loan-form .el-select .el-input__wrapper) {
  border-radius: 4px !important;
}

.duration-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dur-pill {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all .15s;
}

.dur-pill.active {
  background: #eff2ff;
  border-color: #3b5bdb;
  color: #3b5bdb;
}

.dur-pill:hover {
  border-color: #748ffc;
  color: #3b5bdb;
}

.input-suffix {
  font-size: .75rem;
  color: #9ca3af;
}

.drawer-footer {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid #f1f5ff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-submit {
  background: linear-gradient(135deg, #3b5bdb, #4c6ef5) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}

/* ── View Mode ───────────────────────────────────────────────────────────────── */
.view-loan {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .85rem;
  font-weight: 700;
  background: #eff2ff;
  color: #3b5bdb;
  padding: 4px 10px;
  border-radius: 8px;
}

.view-amount-hero {
  background: linear-gradient(135deg, #3b5bdb, #4c6ef5);
  border-radius: 4px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #fff;
}

.hero-label {
  font-size: .95rem;
  opacity: .8;
  font-weight: 500;
}

.hero-amount {
  font-size: 1.8rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
}

.hero-cur {
  font-size: 1rem;
  opacity: .7;
}

.hero-dur {
  font-size: .88rem;
  opacity: .75;
}

.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.view-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.view-field.full {
  grid-column: 1 / -1;
}

.vf-label {
  font-size: .72rem;
  color: #dd7825;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.vf-value {
  font-size: .88rem;
  color: #1a1f36;
  font-weight: 500;
}

.view-section-title {
  font-size: .85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #073a91;
  margin-top: 8px;
}

.view-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.vp-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.vp-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b5bdb, #748ffc);
  border-radius: 99px;
  transition: width .4s;
}

.vp-label {
  font-size: .78rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.view-schedule-table {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

:deep(.el-table__expanded-cell .el-table__header-wrapper th) {
  background-color: #2980b9 !important;
  color: #ffffff !important;
}
.action-btn.delete {
  background: #fff1f2;
  color: #ef4444;
}
</style>