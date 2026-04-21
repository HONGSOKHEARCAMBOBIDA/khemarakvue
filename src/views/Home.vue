<template>
  <EmployeeDetailDrawer v-model="drawerVisible" :employee="selectedEmployee" />
  <el-table :data="employees" style="width: 100%" v-loading="loading">
    <el-table-column type="expand" fixed>
      <template #default="scope">
        
        <div style="display: flex; ">
<el-button size="large" type="primary" plain :icon="View" @click="openDetail(scope.row)">
  មេីលលំអិត
</el-button>
          <el-button size="large" type="success" plain :icon="Edit">
            កែប្រែ
          </el-button>
          <el-button size="large" type="warning" plain :icon="Wallet">
            កែប្រែប្រាក់ខែ
          </el-button>
          <el-button size="large" type="success" plain :icon="Wallet">
            ដំឡេីងប្រាក់ខែ
          </el-button>
          <el-button size="large" type="primary" plain :icon="ArrowUp">
            វាយតម្លៃការងារ
          </el-button>
                    <el-button size="large"  plain :icon="Clock">
            ដូរវេនការងារ
          </el-button>
          <el-button size="large" type="danger"  plain :icon="Switch ">
            ដូរថ្ងៃសម្រាក
          </el-button>
        </div>
      </template>
    </el-table-column>
    
    <el-table-column label="រូបភាព" width="100" fixed>
      <template #default="{ row }">
        <el-image
          :src="getImage(row)"
          :preview-src-list="[getImage(row)]"
          preview-teleported
          style="width: 60px; height: 60px; border-radius: 50%; cursor: pointer"
          fit="cover"
        />
      </template>
    </el-table-column>
    <el-table-column label="រូបភាពQR" width="100" fixed>
      <template #default="{ row }">
        <el-image
          :src="getImageQR(row)"
          :preview-src-list="[getImageQR(row)]"
          preview-teleported
          style="width: 60px; height: 60px; border-radius: 10%; cursor: pointer"
          fit="cover"
        />
      </template>
    </el-table-column>
    <el-table-column label="ឈ្មោះ" width="130" fixed>
      
      <template #default="{ row }">
        <el-column>
 {{ row.employees?.[0]?.name_kh ?? "—" }}
 <el-text type="primary">{{ row.employees?.[0]?.name_en ?? "_" }}</el-text>
        </el-column>
       
      </template>
    </el-table-column>

    <el-table-column label="ភេទ" width="70">
      <template #default="{ row }">
        <el-tag type="primary">
        {{
          row.employees?.[0]?.gender === 1
            ? "ប្រុស"
            : row.employees?.[0]?.gender === 2
              ? "ស្រី"
              : "—"
        }}
        </el-tag>

      </template>
    </el-table-column>
    <el-table-column label="អត្តសញ្ញាណប័ណ្ណ" width="130">
      <template #default="{ row }">
        {{ row.employees?.[0]?.national_id_number ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="តួនាទី" width="150">
      <template #default="{ row }">
        <el-column>
<el-tag size="large">{{ row.employees?.[0]?.position_name ?? "—" }}</el-tag>
<el-text>
  
</el-text>
        </el-column>
        
      </template>
    </el-table-column>
    <el-table-column label="កម្រិតតួនាទី" width="100">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.position_level_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ថ្ងៃចូលធ្វេីការ" width="110">
      <template #default="{ row }">
        {{ row.employees?.[0]?.hire_date ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ថ្ងៃត្រូវវាយតម្លៃ" width="110">
      <template #default="{ row }">
        <el-tag
          :type="row.employees?.[0]?.is_promote ? 'success' : 'danger'"
          effect="light"
        >
          {{
            row.employees?.[0]?.promote_date
              ? row.employees[0].promote_date
              : "—"
          }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="ប្រភេទបុគ្គលិក" width="130">
      <template #default="{ row }">
        {{ row.employees?.[0]?.employee_type_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ស្ថិតក្នុងការិយាល័យ" width="150">
      <template #default="{ row }">
        {{ row.employees?.[0]?.office_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ថ្ងៃ-ខែ-ឆ្នាំ(កំណេីត)" width="150">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.dob ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ទីកន្លែង(កំណេីត)" width="320">
      <template #default="{ row }">
        <span>
          <el-text type="info">
            {{
              [
                row.employeeprofies?.[0]?.village_name_birth,
                row.employeeprofies?.[0]?.communce_name_birth,
                row.employeeprofies?.[0]?.district_name_birth,
              ].join(" / ")
            }}
          </el-text>
          <el-text type="primary">
            / {{ row.employeeprofies?.[0]?.province_name_birth || "—" }}
          </el-text>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="ទីកន្លែង(បច្ចុប្បន្ន)" width="320">
      <template #default="{ row }">
        <span>
          <el-text type="info">
            {{
              [
                row.employeeprofies?.[0]?.village_name_current,
                row.employeeprofies?.[0]?.communce_name_current,
                row.employeeprofies?.[0]?.district_name_current,
              ].join(" / ")
            }}
          </el-text>
          <el-text type="primary">
            / {{ row.employeeprofies?.[0]?.province_name_current || "—" }}
          </el-text>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="លេខទូរសព្ទគ្រូសារ" width="150">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.family_phone ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="កុងធនាគារ" width="90">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.bank_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="លេខកុងធនាគារ" width="120">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.bank_account_number ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="រាយការណ៍ជួន" width="120">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.report_to_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ឈ្មោះប្រពន្ធ" width="120">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.wife_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ឈ្មោះប្ដី" width="120">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.husban_name ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="កូនប្រុស" width="120">
      <template #default="{ row }">
        <el-tag size="large" type="primary">{{ row.employeeprofies?.[0]?.son_number ?? "—" }}</el-tag>        
      </template>
    </el-table-column>
    <el-table-column label="កូនស្រី" width="120">
      <template #default="{ row }">
        <el-tag size="large" type="warning"> {{ row.employeeprofies?.[0]?.daughter_number ?? "—" }}</el-tag>

      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchEmployee } from "../services/employee";
import { Delete, Edit, Search, Share, Upload,View,Wallet,ArrowUp,Clock,Switch} from '@element-plus/icons-vue'
import EmployeeDetailDrawer from "./EmployeeDetailDrawer.vue";
const loading = ref(false);
const employees = ref([]);
const drawerVisible = ref(false)
const selectedEmployee = ref(null)

function openDetail(row) {
  selectedEmployee.value = row
  drawerVisible.value = true
}
function getImage(row) {
  const file = row.employeeprofies?.[0]?.profile_image;
  if (!file) return "https://via.placeholder.com/40";
  return `http://localhost:8080/profileimage/${file}`;
}

function getImageQR(row) {
  const file = row.employeeprofies?.[0]?.qr_code_bank_account;
  if (!file) return "https://via.placeholder.com/40";
  return `http://localhost:8080/qrcodeimage/${file}`;
}

// Edit handler
function handleEdit(row) {
  console.log("Edit employee:", row);
  // Add your edit logic here
  ElMessage.info(`កែប្រែបុគ្គលិក: ${row.employees?.[0]?.name_kh || row.user_id}`);
}

// Delete handler with confirmation
function handleDelete(row) {
  ElMessageBox.confirm(
    `តើអ្នកពិតជាចង់លុបបុគ្គលិក ${row.employees?.[0]?.name_kh || row.user_id} មែនទេ?`,
    "បញ្ជាក់ការលុប",
    {
      confirmButtonText: "លុប",
      cancelButtonText: "បោះបង់",
      type: "warning",
    }
  ).then(async () => {
    try {
      // Add your delete API call here
      // await deleteEmployee(row.user_id);
      ElMessage.success("លុបបុគ្គលិកដោយជោគជ័យ!");
      // Reload data after delete
      await loadData(fetchEmployee, employees);
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || e?.message || "លុបមិនបានសម្រេច");
    }
  }).catch(() => {
    ElMessage.info("បានបោះបង់ការលុប");
  });
}

async function loadData(fn, target, params = {}) {
  loading.value = true;
  try {
    const res = await fn(params);
    target.value = res.data.data;
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || "Load failed");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData(fetchEmployee, employees);
});
</script>

<style scoped>
/* Optional: Add some styling for the expand row */
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
</style>