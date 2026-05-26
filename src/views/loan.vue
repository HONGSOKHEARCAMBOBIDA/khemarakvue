<script setup>
import { onMounted, reactive, ref, watch, computed,onUnmounted } from 'vue';
import { ElMessage,ElMessageBox  } from 'element-plus';
import { fetchloan, createloan,deleteloan } from '../services/loan';
import { fetchBranch } from '../services/branch';
import { fetchCurrency } from '../services/currency';
import { getuser } from '../services/userservice';
import { Search, Refresh,  View as IconView, Check, Edit, Plus, Close, Calendar, Money, User, Delete } from "@element-plus/icons-vue";
import { markRaw } from 'vue'
import { fetchRecieve } from '../services/recieve';
import { useAuthStore1 } from '../stores/user';
const recieveDialogVisible = ref(false);
const recieveLoading = ref(false);
const recieveData = ref([]);
const selectedLoanId = ref(null)

async function openRecieve(row) {
  selectedLoanId.value = row.id;
  recieveData.value = [];         
  recieveDialogVisible.value = true;
  recieveLoading.value = true;
  try {
    const res = await fetchRecieve(row.id);
    recieveData.value = res.data.data ?? [];
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Failed to load receives");
  } finally {
    recieveLoading.value = false;   
  }
}

const usestore = useAuthStore1()
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
const searchInputRef = ref(null)
const formDataParam = ref({
  search: "",
  employee_id: null,
  branch_id: null,
  status: null
});

const hasPermission = computed(() => {
  const permissions = usestore.permissions ?? []
  const allowed = ['add.loan']
  return permissions.some(p => allowed.includes(p.name))
})
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


const durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12];

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
  window.addEventListener('keydown', handleGlobalKeydown)
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(e) {
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault() 
    searchInputRef.value?.focus()
  }
  if (e.key === 'Escape') {
    resetFilters()
  }

  if (e.ctrlKey && e.key === '+') {
    e.preventDefault()
    openCreate()
  }
}
</script>

<template>
  <div class="loan-page">
    <div class="page-header">
    </div>
    <div class="filter-card">
      <el-input v-model="formDataParam.search" placeholder="ស្វែងរកដោយឈ្មោះ" class="filter-search" clearable size="large" ref="searchInputRef">
        <template #prefix><el-icon>
            <Search />
          </el-icon></template>
      </el-input>

      <el-select v-model="formDataParam.branch_id" placeholder="ជ្រេីសរេីសសាខា" clearable class="filter-select" size="large"
      style="width: 200px;"
      >
        <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
      </el-select>

      <el-select v-model="formDataParam.employee_id" placeholder="ជ្រេីសរេីសបុគ្គលិក" clearable class="filter-select"
        :disabled="!formDataParam.branch_id" size="large" style="width: 200px;">
        <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
      </el-select>

      <el-select v-model="formDataParam.status" placeholder="ជ្រេីសរេីសស្ថានភាពកម្ចី" clearable class="filter-select"
        style="width:200px" size="large">
        <el-option label="បង់ផ្ដាច់" :value="0" />
        <el-option label="កំពុងខ្ចី" :value="1" />
      </el-select>

      <el-button type="warning" plain :icon="Refresh" @click="resetFilters" size="large">លុបការស្វែងរក</el-button>
            <el-button type="primary" @click="openCreate" v-if="hasPermission" size="large">
        <el-icon>
          <Plus />
        </el-icon>
        បង្កេីតថ្មី
      </el-button>
    </div>
    <div class="table-card">
      <el-table :data="loans" v-loading="loading" row-key="id" :expand-row-keys="expandedRows.map(String)"
        class="loan-table">
        <template #empty>
          <el-empty description="គ្មានទិន្ន័យ"></el-empty>
        </template>
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

<el-table-column prop="code" label="លេខកូដកម្ចី" width="200">
  <template #default="{ row }">
    <el-link type="primary" @click="openRecieve(row)">
      {{ row.code }}
      <el-icon class="el-icon--right"><icon-view /></el-icon>
    </el-link>
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
      direction="rtl" size="820px" class="loan-drawer" :before-close="closeDrawer">
      <!-- Create Form -->
      <template v-if="drawerMode === 'create'">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="loan-form">

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="ជ្រេីសរេីសសាខា" prop="branch_id">
                <el-select v-model="formData.branch_id" placeholder="Select branch" filterable style="width:100%" size="large">
                  <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ជ្រេីសរេីសបុគ្គលិក" prop="employee_id">
                <el-select v-model="formData.employee_id" placeholder="Select employee" filterable style="width:100%"
                  :disabled="!formData.branch_id" size="large">
                  <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="14">
              <el-form-item label="ទំហំកម្ចី" prop="loan_amount">
                <el-input v-model="formData.loan_amount" placeholder="0.00" type="number" min="0" size="large">
                  <template #suffix><span class="input-suffix"></span></template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="រូបិយប័ណ្ណ" prop="currency_id">
                <el-select v-model="formData.currency_id" placeholder="Currency" style="width:100%" size="large">
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
              style="width:100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large"/>
          </el-form-item>





        </el-form>

        <div class="drawer-footer">
          <el-button @click="closeDrawer" size="large">ចាកចេញ</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCreate" size="large">
            បញ្ចូនទិន្ន័យ
          </el-button>
        </div>
      </template>

      <!-- View Mode -->

    </el-drawer>
   <el-dialog
  v-model="recieveDialogVisible"
  title="ប្រវត្តិទទួលប្រាក់"
  width="1000px"
  destroy-on-close
  class="recieve-dialog"
  @closed="recieveData = []; recieveLoading = false;"
>
  <div  v-loading="recieveLoading" style="min-height: 200px;">
    <div v-if="recieveData.length === 0" style="text-align:center; padding: 40px 0; color: #9ca3af;">
      មិនមានទិន្នន័យ
    </div>

    <div v-for="(r, index) in recieveData" :key="r.id" class="recieve-card">
      <div class="recieve-card-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="recieve-code">{{ r.code }}</span>
          <el-tag type="danger" size="small">{{ r.currency_code }}</el-tag>
        </div>
        <div style="display:flex; align-items:center; gap:16px; font-size:.82rem; color:#6b7280;">
         <el-icon style="color: red;" :size="20"><Calendar /></el-icon><el-text tag="b">{{  r.receive_date }}</el-text>
          <el-text type="primary" tag="b">ទទួលដោយ ៖ {{ r.recieve_by_name }}</el-text>
          <span class="recieve-total">{{ Number(r.total_receive).toLocaleString() }} {{ r.currency_code }}</span>
        </div>
      </div>

      <el-table :data="r.recieve_detaild" size="small" class="inner-table" style="margin-top:10px;" border>
        <el-table-column label="ល.រ" type="index" width="60" align="center"/>
        <el-table-column label="ប្រាក់ដើម" align="right" width="180">
          <template #default="{ row: d }">
            <el-text tag="b" style="color: black;" >{{Number(d.principal).toLocaleString()  }} {{ d.currency_name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="ការប្រាក់" align="right" width="180">
          <template #default="{ row: d }">
            <el-text tag="b" style="color: black;" >{{  Number(d.rate).toLocaleString() }} {{ d.currency_name }}</el-text>
          </template>
        </el-table-column>
          <el-table-column label="កាត់ក្នុងថ្ងៃបេីកប្រាក់ខែ" align="right" width="180">
          <template #default="{ row: d }">
            <el-text tag="b" style="color: black;" >{{  d.payroll_date }}</el-text>
          </template>
        </el-table-column>
               <el-table-column label="ប្រភេទប្រាក់ខែ" align="right" width="180">
          <template #default="{ row: d }">
            <el-text tag="b" style="color: black;" >{{  d.payroll_type }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="សរុប" align="right">
          <template #default="{ row: d }">
            <el-text tag="b" style="color: black;" >{{ Number(d.income).toLocaleString() }} {{ d.currency_name }}</el-text>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</el-dialog>
  </div>
</template>

<style scoped>
.loan-page {
  padding: 4px;
  min-height: 100vh;
  background: #f4f6fb;
}

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

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1f36;
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

.table-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.loan-table {
  width: 100%;
}

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

.emp-cell {
  display: flex;
  align-items: center;
  padding-top: 10px;
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

.date-range {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .78rem;
}

.dr-from {
  color: #4b5563;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: center;
}

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

.inner-table {
  border-radius: 0px;
  overflow: hidden;
}

:deep(.inner-table .el-table__header-wrapper th) {
  background: #f1f5ff !important;
  font-size: .76rem !important;
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

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

:deep(.el-table__expanded-cell .el-table__header-wrapper th) {
  background-color: #2980b9 !important;
  color: #ffffff !important;
}

.recieve-card {
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #fff;
}

.recieve-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.recieve-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .88rem;
  font-weight: 600;
  background: #3b813f;
  color: #ffffff;
  padding: 3px 8px;
}

.recieve-total {
  font-weight: 900;
  color: #1a1f36;
  font-size: .98rem;
}

:deep(.recieve-dialog .el-table__header-wrapper th) {
  background-color: #2980b9 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: .86rem !important;
}
</style>