<template>
  <el-table :data="employees" style="width: 100%" v-loading="loading">
    <el-table-column fixed prop="user_id" label="សកម្មភាព" width="85" />
    <el-table-column label="រូបភាព" width="100">
  <template #default="{ row }">
    <el-image
      :src="getImage(row)"
      style="width: 40px; height: 40px; border-radius: 50%"
      fit="cover"
    />
  </template>
</el-table-column>
    <el-table-column label="ឈ្មោះខែ្មរ" width="150">
      <template #default="{ row }">
        {{ row.employees?.[0]?.name_kh ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="ឈ្មោះអង់គ្លេស" width="150">
      <template #default="{ row }">
        {{ row.employees?.[0]?.name_en ?? "—" }}
      </template>
    </el-table-column>
<el-table-column label="ភេទ" width="70">
  <template #default="{ row }">
    {{
      row.employees?.[0]?.gender === 1
        ? "ប្រុស"
        : row.employees?.[0]?.gender === 2
        ? "ស្រី"
        : "—"
    }}
  </template>
</el-table-column>
    <el-table-column label="អត្តសញ្ញាណប័ណ្ណ" width="130">
      <template #default="{ row }">
        {{ row.employees?.[0]?.national_id_number ?? "—" }}
      </template>
    </el-table-column>
    <el-table-column label="តួនាទី" width="150">
      <template #default="{ row }">
        {{ row.employees?.[0]?.position_name ?? "—" }}
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
          row.employeeprofies?.[0]?.district_name_birth
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
          row.employeeprofies?.[0]?.district_name_current
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
        <el-table-column label="រូបភាពQR" width="100">
  <template #default="{ row }">
    <el-image
      :src="getImageQR(row)"
      style="width: 40px; height: 40px; border-radius: 10%"
      fit="cover"
    />
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
        {{ row.employeeprofies?.[0]?.son_number ?? "—" }}
      </template>
    </el-table-column>
      <el-table-column label="កូនស្រី" width="120">
      <template #default="{ row }">
        {{ row.employeeprofies?.[0]?.daughter_number ?? "—" }}
      </template>
    </el-table-column>

  </el-table>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { fetchEmployee } from "../services/employee";

const loading = ref(false);
const employees = ref([]);
function getImage(row) {
  const file = row.employeeprofies?.[0]?.profile_image
  if (!file) return "https://via.placeholder.com/40"

  return `http://localhost:8080/profileimage/${file}`
}
function getImageQR(row) {
  const file = row.employeeprofies?.[0]?.qr_code_bank_account
  if (!file) return "https://via.placeholder.com/40"

  return `http://localhost:8080/qrcodeimage/${file}`
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
