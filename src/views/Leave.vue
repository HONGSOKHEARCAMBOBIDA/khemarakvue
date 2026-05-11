<script setup>
import { onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchLeave,
  fetchLeaveDurationUnit,
  fetchLeaveType,
  fetchStatusLeave,
} from "../services/leave";
import { fetchBranch } from "../services/branch";
import { getuser } from "../services/userservice";
import { fetchOffice } from "../services/office";
import { Search, Refresh, View } from "@element-plus/icons-vue";
import logo from "../assets/logo.png";
const imageUrl = new URL("@public/image.png", import.meta.url).href;

const loading = ref(false);
const leave = ref([]);
const leavetype = ref([]);
const statusleave = ref([]);
const branch = ref([]);
const user = ref([]);
const office = ref([]);

// ── preview dialog ────────────────────────────────────────────────────────
const previewVisible = ref(false);
const previewRow = ref(null);

function openPreview(row) {
  previewRow.value = row;
  previewVisible.value = true;
}

function printPreview() {
  window.print();
}
// ─────────────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const formDataParam = ref({
  employee_id: null,
  branch_id: null,
  office_id: null,
  status_leave_id: null,
  leave_type_id: null,
  start_date: getToday(),
  end_date: getToday(),
  search: "",
});

const pagination = ref({ page: 1, pageSize: 10, total: 0 });
let searchTimer = null;

function buildParams() {
  const p = {
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
  };
  const f = formDataParam.value;
  if (f.search?.trim()) p.search = f.search.trim();
  if (f.start_date?.trim()) p.start_date = f.start_date.trim();
  if (f.end_date?.trim()) p.end_date = f.end_date.trim();
  if (f.employee_id) p.employee_id = f.employee_id;
  if (f.branch_id) p.branch_id = f.branch_id;
  if (f.office_id) p.office_id = f.office_id;
  if (f.status_leave_id) p.status_leave_id = f.status_leave_id;
  if (f.leave_type_id) p.leave_type_id = f.leave_type_id;
  return p;
}

async function loadLeave(params = {}) {
  loading.value = true;
  try {
    const res = await fetchLeave(params);
    leave.value = res.data.data;
    pagination.value.total = res.data.pagination.totalCount;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Load failed");
  } finally {
    loading.value = false;
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

function onPageChange(newPage) {
  pagination.value.page = newPage;
  loadLeave(buildParams());
}
function onSizeChange(newSize) {
  pagination.value.pageSize = newSize;
  pagination.value.page = 1;
  loadLeave(buildParams());
}

function resetFilters() {
  formDataParam.value = {
    employee_id: null,
    branch_id: null,
    office_id: null,
    status_leave_id: null,
    leave_type_id: null,
    start_date: getToday(),
    end_date: getToday(),
    search: "",
  };
  user.value = [];
  pagination.value.page = 1;
  loadLeave(buildParams());
}

function statusType(id) {
  const map = { 1: "warning", 2: "success", 3: "danger", 4: "info" };
  return map[id] ?? "info";
}

onMounted(() => {
  loadLeave(buildParams());
  loadLookup(fetchBranch, branch);
  loadLookup(fetchLeaveType, leavetype);
  loadLookup(fetchStatusLeave, statusleave);
  loadLookup(fetchOffice, office);
});

watch(
  () => formDataParam.value.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      pagination.value.page = 1;
      loadLeave(buildParams());
    }, 300);
  },
);

watch(
  () => formDataParam.value.branch_id,
  async (v) => {
    pagination.value.page = 1;
    user.value = [];
    formDataParam.value.employee_id = null;
    if (v) {
      try {
        user.value = (await getuser(v)).data.data;
      } catch {}
    }
    loadLeave(buildParams());
  },
);

watch(
  () => formDataParam.value.employee_id,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);
watch(
  () => formDataParam.value.office_id,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);
watch(
  () => formDataParam.value.status_leave_id,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);
watch(
  () => formDataParam.value.leave_type_id,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);
watch(
  () => formDataParam.value.start_date,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);
watch(
  () => formDataParam.value.end_date,
  () => {
    pagination.value.page = 1;
    loadLeave(buildParams());
  },
);

// ── phone helpers ─────────────────────────────────────────────────────────
const formDataPhone = (phone) => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9 || cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3");
  }
  return phone;
};

const getProvider = (phone) => {
  if (!phone) return "Unknown";
  const c = phone.replace(/\D/g, "");
  if (
    ["010", "015", "016", "069", "070", "081", "086", "093", "096", "098"].some(
      (p) => c.startsWith(p),
    )
  )
    return "Smart";
  if (
    [
      "011",
      "012",
      "014",
      "017",
      "061",
      "076",
      "078",
      "079",
      "089",
      "092",
      "095",
    ].some((p) => c.startsWith(p))
  )
    return "Cellcard";
  if (
    [
      "031",
      "036",
      "038",
      "039",
      "071",
      "085",
      "087",
      "088",
      "090",
      "097",
      "099",
    ].some((p) => c.startsWith(p))
  )
    return "Metfone";
  if (["066", "068", "077"].some((p) => c.startsWith(p))) return "Seatel";
  if (c.startsWith("018")) return "Cootel";
  return "Other";
};

const getProviderType = (phone) => {
  const map = { Smart: "success", Cellcard: "danger", Metfone: "primary" };
  return map[getProvider(phone)] ?? "info";
};
</script>

<template>
  <div class="leave-page">
    <!-- ── page header ── -->
    <div class="page-header">
      <div class="header-left">
        <el-text size="large">ការគ្រប់គ្រងច្បាប់ឈប់សម្រាក</el-text>
      </div>
      <el-button
        :icon="Refresh"
        circle
        plain
        @click="resetFilters"
        title="Reset filters"
      />
    </div>

    <!-- ── filters ── -->
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
          style="width: 100%"
        />
        <el-date-picker
          v-model="formDataParam.end_date"
          type="date"
          placeholder="ថ្ងៃបញ្ចប់"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
        <el-select
          v-model="formDataParam.branch_id"
          placeholder="សាខា"
          clearable
          filterable
          style="width: 100%"
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
          style="width: 100%"
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
          style="width: 100%"
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
          style="width: 100%"
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
          style="width: 100%"
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

    <!-- ── table ── -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="leave"
        v-loading="loading"
        stripe
        border
        row-key="id"
        style="width: 100%"
        empty-text="គ្មានទិន្នន័យ"
      >
        <el-table-column
          type="index"
          label="ល.រ"
          width="55"
          align="center"
          fixed
        />

        <el-table-column label="លេខកូដ" min-width="130" fixed>
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_code }}</div>
          </template>
        </el-table-column>

        <el-table-column label="បុគ្គលិក" min-width="170" fixed>
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_name_kh }}</div>
            <el-text type="success" size="small">{{
              row.employee_name_en
            }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="លេខទូរសព្ទ" min-width="170" fixed>
          <template #default="{ row }">
            <span class="fw-bold">{{ formDataPhone(row.employee_phone) }}</span>
            <el-tag
              size="small"
              :type="getProviderType(row.employee_phone)"
              effect="light"
              style="margin-left: 6px"
            >
              {{ getProvider(row.employee_phone) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="ភេទ" min-width="70" fixed align="center">
          <template #default="{ row }">
            <el-tag type="primary">
              {{
                row.employee_gender === 1
                  ? "ប្រុស"
                  : row.employee_gender === 2
                    ? "ស្រី"
                    : "—"
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="មុខតំណែង / ការិយាល័យ"
          min-width="180"
          align="center"
        >
          <template #default="{ row }">
            <div class="two-line">
              <el-text type="primary" size="small">{{
                row.position_name
              }}</el-text>
              <el-text type="warning" size="small">{{
                row.office_name
              }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ប្រភេទច្បាប់" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary" effect="light" size="large">{{
              row.leave_type_name
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="សុំច្បាប់" min-width="70" align="center">
          <template #default="{ row }">
            <el-text
              >{{ row.duration_value }} {{ row.duration_unit_name_kh }}</el-text
            >
          </template>
        </el-table-column>

        <el-table-column label="រយៈពេល" min-width="150" align="center">
          <template #default="{ row }">
            <div class="two-line center">
              <span class="line-main">{{ row.duration_display }}</span>
              <el-text type="primary" size="small"
                >{{ row.start_date }} → {{ row.end_date }}</el-text
              >
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ការកាត់ប្រាក់" min-width="150" align="center">
          <template #default="{ row }">
            <div class="two-line">
              <span class="line-main">{{ row.deduct_type_name }}</span>
              <el-tag size="small" effect="plain">{{
                row.deduct_type_code
              }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="branch_name"
          label="សាខា"
          min-width="130"
          align="center"
        />

        <el-table-column label="មូលហេតុ" min-width="140" align="center">
          <template #default="{ row }">
            <el-text>{{ row.description || "—" }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="អនុម័តដោយ" min-width="130" align="center">
          <template #default="{ row }">
            <span>{{ row.approve_by_name || "—" }}</span>
          </template>
        </el-table-column>

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

        <!-- ── action column ── -->
        <el-table-column
          label="សកម្មភាព"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-tooltip content="មើលលម្អិត" placement="top">
              <el-button
                type="primary"
                :icon="View"
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

    <el-dialog
      v-model="previewVisible"
      width="900px"
      top="30px"
      destroy-on-close
      class="preview-dialog"
      :show-close="true"
    >
      <template #header>
        <div class="dialog-header">
          <span>មើលលម្អិតច្បាប់ឈប់សម្រាក</span>
          <el-button
            type="primary"
            size="small"
            @click="printPreview"
            style="margin-left: 12px"
          >
            🖨 បោះពុម្ព
          </el-button>
        </div>
      </template>

      <div class="a4-wrapper" id="print-area">
        <div class="a4-page" v-if="previewRow">
          <div class="doc-header">
            <div class="doc-logo-area">
              <div>
                <div class="pl-7">
                  <el-image
                  :src="logo"
                  style="width: 80px; height: 80px"
                  fit="cover"
                />
                </div>
         <div class="flex flex-col">
  <el-text class="doc-company-kh1">សាកលវិទ្យាល័យខេមរៈ</el-text>
  <el-text class="doc-company-kh2">KEHMARAK UNIVERSITY</el-text>
</div>
              </div>
            </div>

              <div class="doc-title-area">
              <div class="doc-company-kh">ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div class="doc-title-main">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              <div class="logo-center">
                <img src="/image.png" alt="Logo" width="100" height="100" />
              </div>
            </div>
            <div class="pr-20 pl-20">

            </div>

          </div>

         <div class="text-center p-3">
  <el-text class="doc-company-kh1">
    ពាក្យសុំអនុញ្ញាតច្បាប់
  </el-text>
</div>

         


<div class="pl-10 ">
            <el-text  style="white-space: nowrap; color: black; display: inline-block;">គោត្តនាម-នាមខ្លួន.............{{ previewRow.employee_name_kh }}...............អក្សរឡាតាំង..........{{ previewRow.employee_name_en }}...........ភេទ........{{
    previewRow.employee_gender == 1
      ? "ប្រុស"
      : previewRow.employee_gender == 2
      ? "ស្រី"
      : "មិនកំណត់"
  }}......</el-text>
</div>

<div class="pt-3">
            <el-text  style="white-space: nowrap; color: black; display: inline-block;">ID.......{{ previewRow.employee_code }}........ជាបុគ្គលិកការិយាល័យ..........{{ previewRow.office_name }}...........មុខតំណែង........{{
    previewRow.position_name
  }}......</el-text>
</div>

<div class="pt-3">
            <el-text  style="white-space: nowrap; color: black; display: inline-block;">នៃសាកលវិទ្យាល័យខេមរៈ សាខាខេត្តបាត់ដំបង។</el-text>
</div>

         <div class="text-center p-3">
  <el-text class="doc-company-kh1" tag="ins">
    សូមគោរពជូន
  </el-text>
</div>
       <div class="text-center">
  <el-text class="doc-company-kh1" >
    លោកស្រីនាយិកាប្រតិបត្តិ នៃសាកលវិទ្យាល័យខេមរៈ សាខាខេត្តបាត់ដំបង
  </el-text>
</div>
<div class="text-start pt-3 flex gap-2">
  <el-text class="doc-company-kh1" >
   តាមរយៈ ៖ 
  </el-text>
            <el-text  style="white-space: nowrap; color: black; display: inline-block;">ការិយាល័យរដ្ឋបាល និងធនធានមនុស្ស</el-text>

</div>
<div class="text-start pt-3 flex gap-2">
  <el-text class="doc-company-kh1" >
   កម្មវត្ថុ ៖ 
  </el-text>
            <el-text  style="white-space: nowrap; color: black; display: inline-block;">សុំអនុញ្ញាតច្បាប់ឈប់សម្រាកចំនួន......{{ previewRow.duration_value}} {{ previewRow.duration_unit_name_kh }}......គិតចាប់ពីថ្ងៃទី....{{ previewRow.start_date.split('-')[2] }}.......ខែ.....{{ previewRow.start_date.split('-')[1] }}.......
ឆ្នាំ.....{{ previewRow.start_date.split('-')[0] }}..............</el-text>

</div>


          <!-- ── footer ── -->
          <div class="doc-footer">
            <div class="footer-note">
              ឯកសារនេះបានបង្កើតដោយប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្ស
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Moul&display=swap");
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
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 3px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 5px;
}

.table-card {
  border-radius: 3px;
}

.emp-name-kh {
  font-size: 13px;
  font-weight: 600;
  color: #1d2939;
}

.two-line {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.two-line.center {
  align-items: center;
}
.line-main {
  font-size: 13px;
  color: #344054;
  font-weight: 500;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

:deep(.el-table__header-wrapper th) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

/* ── Dialog header ── */
.dialog-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

/* ── A4 wrapper (scrollable area inside dialog) ── */
.a4-wrapper {
  background: #e8e8e8;
  padding: 24px;
  display: flex;
  justify-content: center;
  min-height: 500px;
}

/* ── A4 page itself ── */
.a4-page {
  width: 794px; /* A4 at 96dpi */
  min-height: 1123px;
  background: #ffffff;
  padding: 48px 56px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  font-size: 13px;
  color: #1a1a2e;
  box-sizing: border-box;
  position: relative;
}

/* ── Document header ── */
.doc-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 12px;
}

.doc-logo-placeholder {
  width: 72px;
  height: 72px;
  border: 2px dashed #c0c0c0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 11px;
  flex-shrink: 0;
}

.doc-title-area {
  flex: 1;
  text-align: center;
}
.doc-company-kh {
  font-size: 19px;
  color: #000000;
  margin-bottom: 4px;
  font-family: "Moul", serif;
  font-weight: 100;
}
.doc-company-kh1 {
  font-size: 13px;
  color: #000000;
  margin-bottom: 4px;
  font-family: "Moul", serif;
  font-weight: 100;
}
.doc-company-kh2 {
  font-size: 10px;
  color: #000000;
  margin-bottom: 4px;
  font-family: "Moul", serif;
}
.doc-title-main {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
  font-family: "Moul", serif;
  font-weight: 100;
}
.doc-title-en {
  font-size: 13px;
  color: #666;
  letter-spacing: 2px;
  margin-top: 4px;
}

.doc-ref-area {
  text-align: right;
  font-size: 12px;
  color: #555;
  flex-shrink: 0;
  min-width: 120px;
}
.ref-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

/* ── Divider ── */
.doc-divider {
  height: 3px;
  background: linear-gradient(to right, #1a3a6b, #409eff, #1a3a6b);
  margin: 12px 0 16px;
  border-radius: 2px;
}

/* ── Status bar ── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.status-label {
  font-size: 13px;
  font-weight: 600;
}
.status-badge {
  padding: 3px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}
.status-1 {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}
.status-2 {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}
.status-3 {
  background: #fee2e2;
  color: #991b1b;
  border-color: #f87171;
}
.status-4 {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #818cf8;
}

/* ── Section title ── */
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a3a6b;
  background: #eef4ff;
  border-left: 4px solid #409eff;
  padding: 5px 10px;
  margin: 16px 0 10px;
  border-radius: 0 4px 4px 0;
}

/* ── Info grid ── */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #dce3f0;
  border-top: none;
  &:first-child {
    border-top: 1px solid #dce3f0;
  }
}
.info-row:first-child {
  border-top: 1px solid #dce3f0;
}

.info-cell {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-right: 1px solid #dce3f0;
}
.info-cell:last-child {
  border-right: none;
}

.info-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 3px;
  font-weight: 500;
}
.info-value {
  font-size: 13px;
  color: #1a1a2e;
  font-weight: 600;
}
.info-value.highlight {
  color: #1a3a6b;
}

/* ── Reason box ── */
.reason-box {
  border: 1px solid #dce3f0;
  border-radius: 4px;
  padding: 12px 14px;
  min-height: 64px;
  font-size: 13px;
  line-height: 1.8;
  color: #333;
  background: #fafbff;
}

/* ── Approval grid ── */
.approval-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid #dce3f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}
.approval-cell {
  padding: 12px;
  text-align: center;
  border-right: 1px solid #dce3f0;
}
.approval-cell:last-child {
  border-right: none;
}

.approval-label {
  font-size: 12px;
  font-weight: 700;
  color: #1a3a6b;
  margin-bottom: 8px;
}
.approval-sign-area {
  height: 70px;
  border-bottom: 1px dashed #bbb;
  margin-bottom: 8px;
}
.approval-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
}
.approval-date {
  font-size: 11px;
  color: #888;
}

/* ── Footer ── */
.doc-footer {
  position: absolute;
  bottom: 32px;
  left: 56px;
  right: 56px;
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
  text-align: center;
}
.footer-note {
  font-size: 10px;
  color: #aaa;
}

.logo-center img {
  margin: 0 auto;
}

/* ── Print styles ── */
@media print {
  .leave-page {
    display: none;
  }
  .preview-dialog {
    display: none;
  }
  .a4-wrapper {
    padding: 0;
    background: none;
  }
  .a4-page {
    box-shadow: none;
    margin: 0;
  }

  #print-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
    background: white;
  }
}
</style>
