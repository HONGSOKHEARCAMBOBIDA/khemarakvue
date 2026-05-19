<script setup>
'use strict'
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchdrafpayroll, fetchpayrolltype ,createpayroll} from '../services/payroll';
import { fetchBranch } from '../services/branch';
import { fetchCurrency } from '../services/currency';
import { Search, Refresh,  View as IconView, Check, Edit, Plus, Close, Calendar, Money, User, Delete,ChatDotRound  } from "@element-plus/icons-vue";
import { computed } from 'vue';
import { fetechbonustype } from '../services/bonus';
const loading = ref(false);
const payrolldraft = ref([]);
const payrolltype = ref([]);
const branch = ref([]);
const currency = ref([]);
const bonustype = ref([]);
const tableRef = ref(null)
const selectedRows = ref([])

function handleSelectionChange(rows){
  selectedRows.value = rows;
}

async function handleSubmit() {
  if(selectedRows.length === 0){
    ElMessage.warning('សូមជ្រើសរើសបុគ្គលិកយ៉ាងហោចណាស់មួយ');
    return
  }
  const payload = selectedRows.value.map(row => ({
    employee_id:     row.employee_id,
    salary_id:       row.salary_id,
    branch_id:       row.branch_id,
    payroll_type_id: Number(formDataParam.value.payroll),
    basic_salary:    Number(row.base_salary)      || 0,
    half_salary:     gethalfSalary(row),
    pension_fund:    Number(row.pensionfund)       || 0,
    total_work_day:  Number(row.total_work_day)    || 0,
    payroll_date:    row.payroll_date              || new Date().toISOString().slice(0, 10),
    loan_deduction:  Number(row.loan_deduction)    || 0,
    loan_id:         Number(row.loan_id)           || 0,
    is_bonus:        row.is_bonus                  || false,
    bonus_type:      Number(row.bonus_type)        || 0,
    bonus_amount:    Number(row.bonus_amount)      || 0,
    total_deduction: getDeduction(row),
    net_salary:      getNetSalary(row),
    currency_id:     Number(formDataParam.value.currency),
    note:            row.comment                   || '',
    comment:         row.comment                   || '',
  }));
  loading.value = true;
  try{
    await createpayroll(payload);
    ElMessage.success(`បានបញ្ជូនប្រាក់ខែសម្រាប់ ${payload.length} នាក់`);
     tableRef.value?.clearSelection();
     selectedRows.value = [];
  }catch(e){
ElMessage.error(e?.response?.data?.message || e?.message || 'Submit failed');

  } finally{
    loading.value = false;
  }

}
const formDataParam = ref({
  currency: null,
  branch: null,
  payroll: null,
});

function buildParams() {
  const p = {};
  const f = formDataParam.value;
  if (f.currency) p.currency = f.currency;
  if (f.branch)   p.branch   = f.branch;
  if (f.payroll)  p.payroll  = f.payroll;
  return p;
}

async function loadpayrolldraft() {
  const params = buildParams();
  if (!params.currency || !params.branch || !params.payroll) {
    ElMessage.warning('សូមជ្រើសរើសសាខា រូបិយប័ណ្ណ និងប្រភេទប្រាក់ខែ');
    return;
  }
  loading.value = true;
  try {
    const res = await fetchdrafpayroll(params);
    payrolldraft.value = res.data.data;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Failed to load payroll');
  } finally {
    loading.value = false;
  }
}

async function loadLookup(fn, target) {
  try {
    const res = await fn();
    target.value = res.data.data;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Load failed');
  }
}

function handleReset() {
  formDataParam.value = { currency: null, branch: null, payroll: null };
  payrolldraft.value = [];
}

onMounted(() => {
  loadLookup(fetchpayrolltype, payrolltype);
  loadLookup(fetchBranch,      branch);
  loadLookup(fetchCurrency,    currency);
  loadLookup(fetechbonustype,bonustype);
});


const formatMoney = (value) => {
  return (Math.round(value * 100) / 100).toFixed(2);
};

const gethalfSalary = (row) => {
  const workday = Number(row.total_work_day) || 0;
  const dailyrate = Number(row.daily_rate) || 0;
  return workday * dailyrate;
}

const getDeduction = (row) => {
  const pension = Number(row.pensionfund) || 0;
  const loan    = Number(row.loan_deduction) || 0;
  return pension + loan;
};

const getNetSalary = (row) => {
  
  const half    = gethalfSalary(row)
  const pension = Number(row.pensionfund) || 0;
  const loan    = Number(row.loan_deduction) || 0;
  const bonus   = row.is_bonus ? (Number(row.bonus_amount) || 0) : 0;
  return half - pension - loan + bonus;
};

const totals = computed(() => {
  const sum = (key) => payrolldraft.value.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  return {
    base_salary:     sum('base_salary'),
    half_salary:     payrolldraft.value.reduce((acc,row) => acc + gethalfSalary(row),0),
    total_deduction: payrolldraft.value.reduce((acc, row) => acc + getDeduction(row), 0),
    total_bonus:     payrolldraft.value.reduce((acc, row) => acc + (row.is_bonus ? (Number(row.bonus_amount) || Number(row.bonus_amount)) : 0), 0), // NEW
    net_salary:      payrolldraft.value.reduce((acc, row) => acc + getNetSalary(row), 0),
  };
});
</script>

<template>
  <div class="payroll-draft-page">
    <el-card class="filter-card" shadow="never">
      <el-form :model="formDataParam" inline label-position="top" class="filter-form">

        <el-form-item label="សាខា" class="filter-item">
          <el-select
            v-model="formDataParam.branch"
            placeholder="ជ្រើសរើសសាខា"
            clearable
            filterable
            style="width: 250px"
          >
            <el-option
              v-for="b in branch"
              :key="b.id"
              :label="b.name"
              :value="b.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="រូបិយប័ណ្ណ" class="filter-item">
          <el-select
            v-model="formDataParam.currency"
            placeholder="ជ្រើសរើសរូបិយប័ណ្ណ"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="c in currency"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="ប្រភេទប្រាក់ខែ" class="filter-item">
          <el-select
            v-model="formDataParam.payroll"
            placeholder="ជ្រើសរើសប្រភេទ"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="pt in payrolltype"
              :key="pt.id"
              :label="pt.name"
              :value="pt.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label=" " class="filter-item filter-item--actions">
          <el-button type="primary" :loading="loading" @click="loadpayrolldraft">
            <el-icon><Search /></el-icon>&nbsp;ស្វែងរក
          </el-button>
          <el-button @click="handleReset" type="warning" plain>
            <el-icon><Refresh /></el-icon>&nbsp;លុបការស្វែងរក
          </el-button>
        </el-form-item>

      </el-form>
    </el-card>
    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-empty
        v-if="!loading && (!payrolldraft || payrolldraft.length === 0)"
        description="មិនទាន់មានទិន្នន័យ "
        :image-size="120"
      />

      <template v-else>
        <div style="display:flex; justify-content:flex-end; margin-bottom:10px; gap:8px;">
  <el-text type="info" style="align-self:center;">
    បានជ្រើសរើស {{ selectedRows.length }} នាក់
  </el-text>
  <el-button
    type="success"
    :disabled="selectedRows.length === 0"
    :loading="loading"
    @click="handleSubmit"
  >
    <el-icon><Check /></el-icon>&nbsp;បញ្ជូនប្រាក់ខែ
  </el-button>
</div>
        <el-table
          ref="tableRef"
          :data="payrolldraft"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          show-summary
          :summary-method="() => []"
        >
        <el-table-column type="selection" width="55" />
          <el-table-column label="ឈ្មោះបុគ្គលិក" width="150" fixed="left">
            <template #default="{ row }">
                <div>
                  <el-text tag="b" style="color: black;">{{ row.employee_name }}</el-text>
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="branch_name" label="សាខា" width="170">
            <template #default="{ row }">
              <el-tag size="large" type="primary" effect="plain">{{ row.branch_name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="ប្រាក់ខែគោល" width="110" align="center">
            <template #default="{ row }">
              <el-text type="primary" tag="b">{{ row.base_salary }} {{ row.currency_symbol }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="ប្រាក់ជូលប្រចាំថ្ងៃ" width="120" align="center">
            <template #default="{ row }">
              <el-text tag="b" style="color: black;">{{ row.daily_rate }} {{ row.currency_symbol }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="ថ្ងៃធ្វេីការ" width="80" align="center">
            <template #default="{row}">
<el-input
  v-model="row.total_work_day"
  :rows="1"
  :autosize="{ minRows: 1, maxRows: 3 }"
/>
            </template>
          </el-table-column>
          <el-table-column label="ពាក់កណ្ដាល" width="110" align="center">
            <template #default="{ row }">
              <el-text tag="b" style="color: black;">{{ formatMoney(gethalfSalary(row)) }} {{ row.currency_symbol }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="កាត់ បសស" width="170" align="center">
            <template #default="{ row }">
              <el-input 
              v-model="row.pensionfund"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 3 }"
              size="large"
             > 
              <template #append>{{ row.currency_symbol }}</template>
             </el-input>
             
            </template>
          </el-table-column>
          <el-table-column label="កាត់កម្ចី" width="170" align="center">
           
           <template #default="{ row }">
              <el-input 
              v-model="row.loan_deduction"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 3 }"
              size="large"
             >
              <template #append>{{ row.currency_symbol }}</template>
             </el-input> 
            </template>
          </el-table-column>
          <el-table-column label="កាត់សរុប" width="110" align="center">
            <template #default="{row}">
              <el-text tag="b" type="danger">
                {{ formatMoney(getDeduction(row)) }} {{ row.currency_symbol }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column label="មានប្រាក់រង្វាន់" width="110" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.is_bonus"
                active-color="#409eff"
                inactive-color="#dcdfe6"
              />
            </template>
          </el-table-column>
 
          <el-table-column label="ប្រភេទប្រាក់រង្វាន់" width="180" align="center">
            <template #default="{ row }">
              <el-select
                v-model="row.bonus_type"
                placeholder="រើសប្រភេទ"
                clearable
                :disabled="!row.is_bonus"
                style="width: 100%"
              >
                <el-option
                  v-for="bt in bonustype"
                  :key="bt.id"
                  :label="bt.name"
                  :value="bt.id"
                />
              </el-select>
            </template>
          </el-table-column>
 
          <el-table-column label="ចំនួនប្រាក់រង្វាន់" width="185" align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.bonus_amount"
                :rows="1"
                :autosize="{ minRows: 1, maxRows: 3 }"
                :disabled="!row.bonus_type"
                size="large"
                type="number"
                min="0"
              >
                <template #append>{{ row.currency_symbol }}</template>
              </el-input>
            </template>
          </el-table-column>
<el-table-column label="ប្រាក់ខែត្រូវបេីក" min-width="140" align="center" fixed="right">
  <template #default="{ row }">
    <el-text tag="b" type="success" style="font-size: 14px;">
      {{ formatMoney(getNetSalary(row)) }} {{ row.currency_symbol }}
    </el-text>
  </template>
</el-table-column>
   <el-table-column label="ផ្សេងៗ" width="150" align="center">
  <template #default="{ row }">
    <el-input
      v-model="row.comment"
      type="textarea"
      :rows="1"
      :autosize="{ minRows: 1, maxRows: 3 }"
      placeholder="បញ្ចូលមតិ..."
      size="small"
    />
  </template>
</el-table-column>
        </el-table>
        <div class="totals-row">
          <span class="totals-row__label">សរុប</span>
          <div class="totals-row__cells">
            <div class="totals-cell">
              <el-text tag="b" style="color:black;">ប្រាក់ខែគោល</el-text>
              <div class="totals-cell__val" >{{ (totals.base_salary) }} {{ payrolldraft[0].currency_symbol }}</div>
              <template>
                
              </template>
            </div>
            <div class="totals-cell">
              <el-text tag="b" style="color:black;">ប្រាក់ខែពាក់កណ្ដាល</el-text>
              <div class="totals-cell__val totals-cell__val--blue">{{ (totals.half_salary.toFixed(2)) }} {{ payrolldraft[0].currency_symbol }}</div>
            </div>
            <div class="totals-cell">
              <el-text tag="b" style="color:black;">កាត់សរុប</el-text>
              <div class="totals-cell__val totals-cell__val--warn">{{ (totals.total_deduction.toFixed(2)) }} {{ payrolldraft[0].currency_symbol }}</div>
            </div>
            <div class="">
              <el-text tag="b" style="color:black;">ប្រាក់ខែត្រូវបេីកសរុប</el-text>
              <div class="totals-cell__val totals-cell__val--net">{{ (totals.net_salary.toFixed(2)) }} {{ payrolldraft[0].currency_symbol }}</div>
            </div>
          </div>
        </div>
        <div class="row-count">
          <el-text tag="b" style="color: black;"> សរុបបុគ្គលិក: {{ payrolldraft.length }} នាក់</el-text>
        </div>
      </template>
    </el-card>

  </div>
</template>

<style scoped>
.payroll-draft-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-header__icon {
  font-size: 28px;
  line-height: 1;
}
.page-header__title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d2939;
}
.page-header__title p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.filter-card {
  border: 1px solid #e5e7eb;
}
.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  align-items: flex-end;
}
.filter-item {
  margin-bottom: 0 !important;
}


.table-card {
  border: 1px solid #e5e7eb;
  overflow: hidden;
}



.emp-meta {
  font-size: 11px;
  color: #9ca3af;
}


.totals-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 12px 16px;
  background: #f7f8f8;
  border: 1px solid #e5e7eb;
  gap: 16px;
  flex-wrap: wrap;
}
.totals-row__label {
  font-weight: 900;
  font-size: 20px;
  color: #0a0a0a;
  white-space: nowrap;
}
.totals-row__cells {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.totals-cell {
  text-align: right;
}
.totals-cell--highlight {
  padding: 6px 12px;
  background: #ecfdf5;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
}
.totals-cell__label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
}
.totals-cell__val {
  font-weight: 700;
  font-size: 18px;
  color: #111827;
  font-variant-numeric: tabular-nums;
}
.totals-cell__val--blue { color: #2563eb; }
.totals-cell__val--warn { color: #d97706; }
.totals-cell__val--net  { color: #059669; font-size: 16px; }

.row-count {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}
:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}
</style>