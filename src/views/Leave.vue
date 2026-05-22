<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  createLeave,
  fetchLeave,
  fetchLeaveDurationUnit,
  fetchLeaveType,
  fetchStatusLeave,
  approveLeave,
  updateleave
} from "../services/leave";
import { fetchBranch } from "../services/branch";
import { getuser } from "../services/userservice";
import { fetchOffice } from "../services/office";
import { Search, Refresh, View ,Check,Edit} from "@element-plus/icons-vue";
import logo from "../assets/logo.png";
const imageUrl = new URL("@public/image.png", import.meta.url).href;

const loading = ref(false);
const leave = ref([]);
const leavetype = ref([]);
const statusleave = ref([]);
const branch = ref([]);
const user = ref([]);
const office = ref([]);
const leavedurationunit = ref([])
const previewVisible = ref(false);
const previewRow = ref(null);
const createVisible = ref(false);
const createLoading = ref(false);
const createFormRef = ref(null);
// leave
const approveVisible = ref(false);
const approveRow = ref(null);
const approveStatusId = ref(null);
const approveLoading = ref(false);

// edit leave
const editVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editRow = ref(null)

const editFormData = reactive({
  leave_type_id: null,
  start_date: '',
  end_date: '',
  back_date: '',
  description: '',
  approve_by: null,
  duration_value: null,
  duration_unit_id: null,
  branch_id: null
})

function openEdit(row) {
  editRow.value = row
  Object.assign(editFormData, {
    leave_type_id: row.leave_type_id,
    start_date: row.start_date,
    end_date: row.end_date,
    back_date: row.back_date,
    description: row.description,
    approve_by: row.approve_by_id,
    duration_value: row.duration_value,
    duration_unit_id: row.duration_unit_id,
    branch_id: row.branch_id
  })
  editVisible.value = true
}

function buildEditFormData() {
  const fd = new FormData()
  const scalars = ['start_date', 'end_date', 'back_date', 'description']
  scalars.forEach(k => {
    if (editFormData[k]) fd.append(k, editFormData[k])
  })
  const numerics = [
    ['leave_type_id', editFormData.leave_type_id],
    ['approve_by', editFormData.approve_by],
    ['duration_value', editFormData.duration_value],
    ['duration_unit_id', editFormData.duration_unit_id]
  ]
  numerics.forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, v)
  })
  return fd
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }
    try {
      editLoading.value = true
      const fd = buildEditFormData()
      const res = await updateleave(editRow.value.id, fd)
      if (res.status === 200 || res.status === 201) {
        ElMessage.success('កែប្រែបានជោគជ័យ!')
        editVisible.value = false
        loadLeave(buildParams())
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message
      ElMessage.error('កែប្រែមិនជោគជ័យ: ' + msg)
    } finally {
      editLoading.value = false
    }
  })
}

function openApprove(row) {
  approveRow.value = row;
  approveStatusId.value = row.status_leave_id ?? null;
  approveVisible.value = true;
}
const submitApprove = async () => {
  if (!approveStatusId.value) {
    ElMessage.warning('សូមជ្រើសស្ថានភាព!');
    return;
  }
  try {
    approveLoading.value = true;
    const fd = new FormData();
    fd.append('status_leave', approveStatusId.value);
    const res = await approveLeave(approveRow.value.id, fd);
    if (res.status === 200 || res.status === 201) {
      ElMessage.success('អនុម័តបានជោគជ័យ!');
      approveVisible.value = false;
      loadLeave(buildParams());
    } else {
      ElMessage.error('មានបញ្ហា: សូមពិនិត្យម្តងទៀត');
    }
  }catch (error) {
    const msg = error.response?.data?.error
    ElMessage.error('អនុម័តមិនជោគជ័យ: ' + msg);
}finally {
    approveLoading.value = false;
  }
};

function openPreview(row) {
  previewRow.value = row;
  previewVisible.value = true;
}
function openCreate() {
  createVisible.value = true;
}


function printPreview() {
  const printContent = document.getElementById("print-area").innerHTML;
  const originalBody = document.body.innerHTML;

  document.body.innerHTML = `
    <div style="background:white;">
      ${printContent}
    </div>
  `;

  window.print();
  document.body.innerHTML = originalBody;
  window.location.reload(); 
}

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
  end_date: '',
  search: "",
});

const formData = reactive({
  leave_type_id: null,
  start_date: '',
  end_date: '',
  back_date: '',
  description: '',
  approve_by: null,
  duration_value: null,
  duration_unit_id: null
})

function buildFormData(){
  const fd = new FormData()

  const scalars = [
    'start_date','end_date','back_date','description'
  ]

  scalars.forEach(k => {
    if(formData[k] !== null && formData[k] !== undefined && formData[k] !== ''){
      fd.append(k,formData[k])
    }
  })

  const numerics = [
    ['leave_type_id',formData.leave_type_id],
    ['approve_by',formData.approve_by],
    ['duration_value',formData.duration_value],
    ['duration_unit_id',formData.duration_unit_id]
  ]

  numerics.forEach(([k,v])=>{
    if(v !== null && v !== undefined) fd.append(k,v)
  })

  return fd

}

const submitForm = async () => {
  if(!createFormRef.value) return
  await createFormRef.value.validate(async (valid)=>{
    if(!valid){
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }
    try{
      createLoading.value = true
      const fd = buildFormData()
      const res = await createLeave(fd)
      if(res.status === 200 || res.status === 201){
        ElMessage.success('បង្កើតអ្នកច្បាប់បានជោគជ័យ!')
        resetCreateForm()
        createVisible.value = false
        loadLeave(buildParams())

      }else{
        ElMessage.error('មានបញ្ហា៖ ' + (response.data?.message || 'សូមពិនិត្យម្តងទៀត'))
      }

    } catch (error) {
      ElMessage.error(
        'បង្កើតច្បាប់មិនជោគជ័យ៖ ' +
        (error.response?.data?.message || error.message)
      )
    } finally {
      createLoading.value = false
    }
  })
}

const resetCreateForm = () => {
  if(createFormRef.value) createFormRef.value.resetFields()
  Object.assign(formData,{
    leave_type_id: null,
    start_date: '',
    end_date: '',
    back_date: '',
    description: '',
    approve_by: null,
    duration_value: '',
    duration_unit_id: null
})

}

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
  loadLookup(fetchLeaveDurationUnit,leavedurationunit)
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
    formData.approve_by = null
    if (v) {
      try {
        user.value = (await getuser(v)).data.data;
      } catch {}
    }
    loadLeave(buildParams());
  },
);

watch(
  () => editFormData.branch_id,
  async (v) => {
    user.value = [];  
    if (v) {
      try {
        user.value = (await getuser(v)).data.data;
      } catch {}
    }
  }
)

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

const khmerMonths = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];
const toKhmerMonth = (dateStr) => {
  if (!dateStr) return "";
  const monthIndex = parseInt(dateStr.split("-")[1], 10) - 1;
  return khmerMonths[monthIndex] ?? "";
};
const toKhmerNumber = (num) => {
  if (num === null || num === undefined) return ''
  const map = { '0':'០','1':'១','2':'២','3':'៣','4':'៤','5':'៥','6':'៦','7':'៧','8':'៨','9':'៩' }
  return String(num).replace(/[0-9]/g, d => map[d])
}
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
<el-button type="primary" @click="openCreate">
  បង្កើតថ្មី
</el-button>
      </div>
    </el-card>

    <!-- ── table ── -->
    <el-card class="table-card" shadow="never">
    <div style="overflow-x: auto;">
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
          
        />

        <el-table-column label="លេខកូដ" min-width="130" >
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_code }}</div>
          </template>
        </el-table-column>

        <el-table-column label="បុគ្គលិក" min-width="140" >
          <template #default="{ row }">
            <div class="emp-name-kh">{{ row.employee_name_kh }}</div>
            <el-text type="success" size="small">{{
              row.employee_name_en
            }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="លេខទូរសព្ទ" min-width="170" >
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

        <el-table-column label="ភេទ" min-width="70"  align="center">
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

        <el-table-column label="សុំច្បាប់" min-width="90" align="center">
          <template #default="{ row }">
            <el-text
              >{{ row.duration_value }} {{ row.duration_unit_name_kh }}</el-text
            >
          </template>
        </el-table-column>

        <el-table-column label="រយៈពេល" min-width="170" align="center">
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
          width="120"
          align="center"
          
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
  :disabled="row.status_leave_id === 1 || row.status_leave_id === 3"
/>
            </el-tooltip>
                <el-tooltip content="កែប្រែ" placement="top">
      <el-button
        type="warning"
        :icon="Edit"
        circle
        size="small"
        plain
        style="margin-left:6px"
        :disabled="row.status_leave_id !== 1"
        @click="openEdit(row)"
      />
    </el-tooltip>
            <el-tooltip content="អនុម័ត" placement="top">
      <el-button
        type="success"
        circle
        size="small"
        plain
        style="margin-left:6px"
        @click="openApprove(row)"
      >
        <el-icon><Check /></el-icon>
      </el-button>
    </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <span>មើលលម្អិតច្បាប់</span>
<el-row>
            <el-button
            type="primary"
            size="small"
            @click="printPreview"
            style="margin-left: 12px"
          >
             បោះពុម្ព
          </el-button>
          <el-button
            type="danger"
            size="small"
           @click="previewVisible = false"
            style="margin-left: 12px"
            plain
          >
             ចាកចេញ
          </el-button>
          
</el-row>
        </div>
      </template>

      <div class="a4-wrapper" id="print-area">
        <div class="a4-page" v-if="previewRow">
          <div class="doc-header">
            <div class="pt-7">
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
              <div class="pl-28">
                <img src="/image.png" alt="Logo" width="100" height="100" />
              </div>
            </div>
            <div class="pr-20 pl-20"></div>
          </div>

          <div class="text-center p-3">
            <el-text class="doc-company-kh1"> ពាក្យសុំអនុញ្ញាតច្បាប់ </el-text>
          </div>

          <div class="pl-10">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >គោត្តនាម-នាមខ្លួន.............{{
                previewRow.employee_name_kh
              }}...............អក្សរឡាតាំង..........{{
                previewRow.employee_name_en
              }}...........ភេទ........{{
                previewRow.employee_gender == 1
                  ? "ប្រុស"
                  : previewRow.employee_gender == 2
                    ? "ស្រី"
                    : "មិនកំណត់"
              }}......</el-text
            >
          </div>

          <div class="pt-3">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >ID.......{{
                previewRow.employee_code
              }}........ជាបុគ្គលិកការិយាល័យ..........{{
                previewRow.office_name
              }}...........មុខតំណែង........{{
                previewRow.position_name
              }}......</el-text
            >
          </div>

          <div class="pt-3">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >នៃសាកលវិទ្យាល័យខេមរៈ សាខាខេត្តបាត់ដំបង។</el-text
            >
          </div>

          <div class="text-center p-3">
            <el-text class="doc-company-kh1" tag="ins"> សូមគោរពជូន </el-text>
          </div>
          <div class="text-center">
            <el-text class="doc-company-kh1">
              លោកស្រីនាយិកាប្រតិបត្តិ នៃសាកលវិទ្យាល័យខេមរៈ សាខាខេត្តបាត់ដំបង
            </el-text>
          </div>
          <div class="text-start pt-3 flex gap-2">
            <el-text class="doc-company-kh1"> តាមរយៈ ៖ </el-text>
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >ការិយាល័យរដ្ឋបាល និងធនធានមនុស្ស</el-text
            >
          </div>
          <div class="text-start pt-3 flex gap-2">
            <el-text class="doc-company-kh1"> កម្មវត្ថុ ៖ </el-text>
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >សុំអនុញ្ញាតច្បាប់ឈប់សម្រាកចំនួន......{{
                toKhmerNumber(previewRow.duration_value)
              }}
              {{ previewRow.duration_unit_name_kh }}......គិតចាប់ពីថ្ងៃទី....{{
                toKhmerNumber(previewRow.start_date.split("-")[2])
              }}.......ខែ.....{{ toKhmerMonth(previewRow.start_date) }}.......
              ឆ្នាំ.....{{
                toKhmerNumber(previewRow.start_date.split("-")[0])
              }}....</el-text>
            
          </div>
          <div class="pl-14 pt-3">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >រហូតដល់ថ្ងៃទី....{{
                toKhmerNumber(previewRow.end_date.split("-")[2])
              }}.......ខែ.....{{ toKhmerMonth(previewRow.end_date) }}.......
              ឆ្នាំ.....{{
               toKhmerNumber( previewRow.end_date.split("-")[0])
              }}។</el-text>
          </div>
          <div class="text-start pt-3 flex gap-2">
            <el-text class="doc-company-kh1"> មូលហេតុ ៖ </el-text>
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >................................................................{{
                previewRow.description
              }}....................................................................</el-text
            >
          </div>
          <div class="pl-10 pt-3">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >ខ្ញុំបាទ/នាងខ្ញុំសូមសន្យាថានឹងចូលមកធ្វេីការវិញនៅថ្ងៃទី.....{{
               toKhmerNumber( previewRow.back_date.split("-")[2])
              }}.......ខែ.....{{
                toKhmerMonth(previewRow.back_date)
              }}......ឆ្នាំ.....{{
                toKhmerNumber(previewRow.back_date.split("-")[0])
              }}....ជាកំណត់។</el-text
            >
          </div>
          <div class="pl-10 pt-3">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >អាស្រ័យហេតុដូចបានជម្រាបជូនខាងលេី
              សូមលោកស្រីនាយិកាប្រតិបត្តិមេត្តាអនុញ្ញាតច្បាប់ឲ្យខ្ញុំបាទ/នាងខ្ញុំ</el-text
            >
          </div>

          <div class="text-start pt-5 flex gap-2">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
            >
              បានឈប់សម្រាកដោយក្ដីអនុគ្រោះ។
            </el-text>
          </div>

          <div class="pl-10 pt-6">
            <el-text
              style="white-space: nowrap; color: black; display: inline-block"
              >សូមលោកស្រីនាយិកាប្រតិបត្តិ
              មេត្តាទទួលនូវការគោរពពីខ្ញុំបាទ/នាងខ្ញុំ។</el-text
            >
          </div>

          <div class="pt-6 flex justify-end">
            <el-text style="white-space: nowrap; color: black">
              បាត់ដំបង ថ្ងៃទី.........ខែ..........ឆ្នាំ...........
            </el-text>
          </div>

          <div class="pt-3 pr-10 flex justify-end gap-2">
            <el-text class="doc-company-kh1"> ហត្ថលេខា និងឈ្មោះ </el-text>
          </div>

          <div v-if="previewRow.office_id == 2" class="pl-40 pt-6 pb-4">
  <el-text style="white-space: nowrap; color: black; display: inline-block">
    បានឃើញ និងបញ្ជាក់ថា...........................................
  </el-text>
  <div class="pt-3">
    <el-text style="white-space: nowrap; color: black">
      បាត់ដំបង ថ្ងៃទី.........ខែ..........ឆ្នាំ...........
    </el-text>
    <div class="pt-3">
      <el-text class="doc-company-kh1">ប្រធានការិយាល័យរដ្ឋបាលនិងធនធានមនុស្ស</el-text>
    </div>
  </div>
</div>

<div v-else-if="previewRow.office_id == 1 || previewRow.office_id == 3" >
  <div class="pl-1 pt-5">
  <el-text style="white-space: nowrap; color: black; display: inline-block">
    បានឃើញ និងបញ្ជាក់ថា...........................................
  </el-text>
  <div class="pt-3">
    <el-text style="white-space: nowrap; color: black">
      បាត់ដំបង ថ្ងៃទី..................ខែ..................ឆ្នាំ.............
    </el-text>
    <div class="pt-3 pl-14">
      <el-text class="doc-company-kh1">ប្រធានការិយាល័យសិក្សា</el-text>
    </div>
  </div>
  </div>

  <div class="flex flex-col justify-end  pr-10">
<div class="flex justify-end">
    <el-text style="white-space: nowrap; color: black;">
    បានឃើញ និងបញ្ជូនជូននាយិកា......................................
  </el-text>
</div>
<div class="flex justify-end">
    <el-text style="white-space: nowrap; color: black" class="pt-3">
    បាត់ដំបង ថ្ងៃទី..................ខែ..................ឆ្នាំ.............
  </el-text>
</div>
<div class="flex justify-end">
    <el-text class="doc-company-kh1 pt-3">ប្រធានការិយាល័យរដ្ឋបាល</el-text>
</div>
</div>
</div>



          
          <div class="pl-10 pt-1">
            <el-text style="white-space: nowrap; color: black"
              >បានឃេីញ និងឯកភាព</el-text
            >
          </div>
          <div class="pl-12 pt-3">
            <el-text class="doc-company-kh1"> នាយិកាប្រតិបត្តិ </el-text>
          </div>
          <!-- ── footer ── -->
          <div class="doc-footer">
            <div class="footer-note">
              អាសយដ្ឋាន៖ ភូមិកម្មករ សង្កាត់ស្វាយប៉ោ ក្រុងបាត់ដំបង ខេត្តបាត់ដំបង
              ទូរសព្ទទំនាក់ទំនង៖ ០១២ ៨២៥ ២៥៦ / ០៩៨ ៨២៥ ២៥៦
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
<el-dialog
  v-model="createVisible"
  title="បង្កើតច្បាប់ឈប់សម្រាក"
  width="560px"
  destroy-on-close
  @close="resetForm"
>
  <el-form
    ref="createFormRef"
    :model="formData"
    label-position="top"
    label-width="auto"
  >
    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item
          label="ប្រភេទច្បាប់"
          prop="leave_type_id"
          :rules="[{ required: true, message: 'សូមជ្រើសប្រភេទច្បាប់' }]"
        >
          <el-select v-model="formData.leave_type_id" placeholder="ជ្រើសប្រភេទ" style="width:100%">
            <el-option v-for="lt in leavetype" :key="lt.id" :label="lt.name" :value="lt.id" />
          </el-select>
        </el-form-item>
      </el-col>
       <el-col :span="8">
        <el-form-item label="សាខា">
          <el-select v-model="formDataParam.branch_id" placeholder="ជ្រើសសាខា" clearable style="width:100%">
            <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="អនុម័តដោយ" prop="approve_by">
          <el-select v-model="formData.approve_by" placeholder="ជ្រើសអ្នកអនុម័ត" clearable style="width:100%">
            <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item
          label="ថ្ងៃចាប់ផ្ដើម"
          prop="start_date"
          :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃចាប់ផ្ដើម' }]"
        >
          <el-date-picker
            v-model="formData.start_date"
            type="date"
            placeholder="ថ្ងៃចាប់ផ្ដើម"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="ថ្ងៃបញ្ចប់"
          prop="end_date"
          :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃបញ្ចប់' }]"
        >
          <el-date-picker
            v-model="formData.end_date"
            type="date"
            placeholder="ថ្ងៃបញ្ចប់"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item
      label="ថ្ងៃត្រឡប់មកវិញ"
      prop="back_date"
      :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃត្រឡប់' }]"
    >
      <el-date-picker
        v-model="formData.back_date"
        type="date"
        placeholder="ថ្ងៃត្រឡប់មកវិញ"
        value-format="YYYY-MM-DD"
        style="width:100%"
      />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item
          label="រយៈពេល"
          prop="duration_value"
          :rules="[{ required: true, message: 'សូមបញ្ចូលរយៈពេល' }]"
        >
          <el-input-number
            v-model="formData.duration_value"
            :min="0.5"
            :step="0.5"
            :precision="1"
            placeholder="ចំនួន"
            style="width:100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="ឯកតារយៈពេល"
          prop="duration_unit_id"
          :rules="[{ required: true, message: 'សូមជ្រើសឯកតា' }]"
        >
          <el-select v-model="formData.duration_unit_id" placeholder="ជ្រើស" style="width:100%">
            <el-option
              v-for="u in leavedurationunit"
              :key="u.id"
              :label="u.name_km"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="មូលហេតុ" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        placeholder="ពិពណ៌នាមូលហេតុ..."
      />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="createVisible = false">បោះបង់</el-button>
    <el-button type="success" :loading="createLoading" @click="submitForm">
      រក្សាទុក
    </el-button>
  </template>
</el-dialog>
<el-dialog
  v-model="approveVisible"
  title="អនុម័តច្បាប់ឈប់សម្រាក"
  width="700px"
  destroy-on-close
>
  <div v-if="approveRow" style="margin-bottom:16px">
    <el-descriptions :column="1" border size="small">
      <el-descriptions-item label="បុគ្គលិក">
        {{ approveRow.employee_name_kh }}
      </el-descriptions-item>
      <el-descriptions-item label="ប្រភេទច្បាប់">
        {{ approveRow.leave_type_name }}
      </el-descriptions-item>
      <el-descriptions-item label="រយៈពេល">
        {{ approveRow.duration_value }} {{ approveRow.duration_unit_name_kh }} ចាប់តាំងពី {{ approveRow.start_date }} រហូតដល់ {{ approveRow.end_date }}
      </el-descriptions-item>
      <el-descriptions-item label="ថ្ងៃចូលធ្វេីការវិញ">
        {{ approveRow.back_date }}
      </el-descriptions-item>
      <el-descriptions-item label="មូលហេតុ">
        {{ approveRow.description }}
      </el-descriptions-item>
    </el-descriptions>
  </div>

  <el-form label-position="top">
    <el-form-item label="ជ្រើសស្ថានភាព" required>
      <el-select
        v-model="approveStatusId"
        placeholder="ស្ថានភាព"
        style="width:100%"
      >
        <el-option
          v-for="st in statusleave"
          :key="st.id"
          :label="st.name"
          :value="st.id"
        />
      </el-select>
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="approveVisible = false">បោះបង់</el-button>
    <el-button
      type="success"
      :loading="approveLoading"
      @click="submitApprove"
    >
      អនុម័ត
    </el-button>
  </template>
</el-dialog>
<el-dialog
  v-model="editVisible"
  title="កែប្រែច្បាប់ឈប់សម្រាក"
  width="660px"
  destroy-on-close
>
  <el-form
    ref="editFormRef"
    :model="editFormData"
    label-position="top"
  >
    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item
          label="ប្រភេទច្បាប់"
          prop="leave_type_id"
          :rules="[{ required: true, message: 'សូមជ្រើសប្រភេទច្បាប់' }]"
        >
          <el-select v-model="editFormData.leave_type_id" style="width:100%">
            <el-option v-for="lt in leavetype" :key="lt.id" :label="lt.name" :value="lt.id" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="សាខា">
          <el-select v-model="editFormData.branch_id" placeholder="ជ្រើសសាខា" clearable style="width:100%">
            <el-option v-for="b in branch" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="អនុម័តដោយ" prop="approve_by">
          <el-select v-model="editFormData.approve_by" clearable style="width:100%">
            <el-option v-for="u in user" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item
          label="ថ្ងៃចាប់ផ្ដើម"
          prop="start_date"
          :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃចាប់ផ្ដើម' }]"
        >
          <el-date-picker v-model="editFormData.start_date" type="date"
            value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="ថ្ងៃបញ្ចប់"
          prop="end_date"
          :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃបញ្ចប់' }]"
        >
          <el-date-picker v-model="editFormData.end_date" type="date"
            value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item
      label="ថ្ងៃត្រឡប់មកវិញ"
      prop="back_date"
      :rules="[{ required: true, message: 'សូមបញ្ចូលថ្ងៃត្រឡប់' }]"
    >
      <el-date-picker v-model="editFormData.back_date" type="date"
        value-format="YYYY-MM-DD" style="width:100%" />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item
          label="រយៈពេល"
          prop="duration_value"
          :rules="[{ required: true, message: 'សូមបញ្ចូលរយៈពេល' }]"
        >
          <el-input-number v-model="editFormData.duration_value"
            :min="0.5" :step="0.5" :precision="1" style="width:100%" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="ឯកតារយៈពេល"
          prop="duration_unit_id"
          :rules="[{ required: true, message: 'សូមជ្រើសឯកតា' }]"
        >
          <el-select v-model="editFormData.duration_unit_id" style="width:100%">
            <el-option v-for="u in leavedurationunit" :key="u.id"
              :label="u.name_km" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="មូលហេតុ">
      <el-input v-model="editFormData.description" type="textarea" :rows="3" />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="editVisible = false">បោះបង់</el-button>
    <el-button type="warning" :loading="editLoading" @click="submitEdit">
      រក្សាទុក
    </el-button>
  </template>
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
  gap: 8px;
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

.dialog-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  justify-content: space-between;
}

.a4-wrapper {
  background: #2980b9;
  padding: 24px;
  display: flex;
  justify-content: center;
  min-height: 500px;
}

.a4-page {
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  padding: 48px 56px;
  font-size: 13px;
  color: #1a1a2e;
  box-sizing: border-box;
  position: relative;
}

.doc-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 12px;
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
.doc-footer {
  position: absolute;
  bottom: 42px;
  left: 56px;
  right: 56px;
  padding-top: 8px;
  text-align: center;
}
.footer-note {
  font-size: 12px;
  color: #000000;
}
@media print {
  @page {
    size: A4;
   margin: 0.8cm;
  }
  body * {
    visibility: hidden !important;
    margin: 0;
  }

  #print-area .a4-page,
  #print-area .a4-page * {
    visibility: visible !important;
  }

  #print-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
  }
}
@media (max-width: 768px) {
  .leave-page {
    padding: 10px;
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .table-card {
    overflow-x: auto;
  }

  :deep(.el-table) {
    min-width: 900px;
  }

  .pagination-wrap {
    justify-content: center;
    flex-wrap: wrap;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  .a4-wrapper {
    padding: 8px;
  }

  .a4-page {
    width: 100%;
    min-width: 0;
    padding: 24px 16px;
    font-size: 11px;
  }
}
@media (max-width: 480px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
