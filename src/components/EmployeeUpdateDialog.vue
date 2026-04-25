<!-- EmployeeUpdateDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    title="កែប្រែព័ត៌មានបុគ្គលិក"
    width="1400px"
    destroy-on-close
  >

<div  class="pb-4" style="display:flex; justify-content:space-between; align-items:center">
  <div>
    <el-button @click="visible = false" size="large">បោះបង់</el-button>
    <el-button type="primary" @click="submitUpdate" :loading="submitting" size="large">រក្សាទុក</el-button>
  </div>

  <el-tag v-if="!formData.is_promote" type="danger" size="large" effect="dark">មិនទាន់វាយតម្លៃ</el-tag>
  <el-tag v-else type="success" size="large" effect="dark">បុគ្គលិកបានវាយតម្លៃរួចហើយ</el-tag>
</div>

    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="220px"
      label-position="right"
    >
      <!-- Profile Image -->
      <el-divider content-position="left">
        <span class="section-title">រូបភាព</span>
      </el-divider>

      <el-form-item label="រូបភាព">
        <el-upload
          class="avatar-uploader"
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleProfileFileChange"
        >
          <img v-if="profileImageUrl" :src="profileImageUrl" class="avatar" />
          <el-button v-else type="primary" plain>
            ជ្រើសរើសរូបភាព
            <el-icon class="el-icon--right"><Upload /></el-icon>
          </el-button>
        </el-upload>
      </el-form-item>

      <!-- Basic Info -->
      <el-divider content-position="left">
        <span class="section-title">ព័ត៌មានមូលដ្ឋាន</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ឈ្មោះជាភាសាអង់គ្លេស" prop="name_en">
            <el-input v-model="formData.name_en" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
                  <el-form-item label="ឈ្មោះជាភាសាខ្មែរ" prop="name_kh">
            <el-input v-model="formData.name_kh" size="large" />
          </el-form-item>    
        </el-col>
    
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="អត្តសញ្ញាណប័ណ្ណ" prop="national_id_number">
            <el-input v-model="formData.national_id_number" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ភេទ" prop="gender">
            <el-select v-model="formData.gender" style="width:100%" size="large">
              <el-option label="ប្រុស" :value="1" />
              <el-option label="ស្រី" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ថ្ងៃខែឆ្នាំកំណើត" prop="dob">
            <el-date-picker
              v-model="formData.dob"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width:100%"
              size="large"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ស្ថានភាពអាពាហ៍ពិពាហ៍" prop="material_status">
            <el-select v-model="formData.material_status" style="width:100%" size="large">
              <el-option label="នៅលីវ"  value="នៅលីវ" />
              <el-option label="រៀបការ" value="រៀបការ" />
              <el-option label="លែងលះ" value="លែងលះ" />
              <el-option label="មេម៉ាយ" value="មេម៉ាយ" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Birth Address -->
      <el-divider content-position="left">
        <span class="section-title">ទីកន្លែងកំណើត</span>
      </el-divider>

      <el-row :gutter="10">
        <el-col :span="6">
          <el-select v-model="birthAddr.province_id" placeholder="ខេត្ត" style="width:100%" size="large" clearable>
            <el-option v-for="p in provinces" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="birthAddr.district_id" placeholder="ស្រុក" style="width:100%" size="large" clearable>
            <el-option v-for="d in birthDistricts" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="birthAddr.communce_id" placeholder="ឃុំ" style="width:100%" size="large" clearable>
            <el-option v-for="c in birthCommunces" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="formData.village_id_of_birth" placeholder="ភូមិ" style="width:100%" size="large" clearable>
            <el-option v-for="v in birthVillages" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-col>
      </el-row>

      <!-- Current Address -->
      <el-divider content-position="left">
        <span class="section-title">ទីកន្លែងបច្ចុប្បន្ន</span>
      </el-divider>

      <el-row :gutter="10">
        <el-col :span="6">
          <el-select v-model="currAddr.province_id" placeholder="ខេត្ត" style="width:100%" size="large" clearable>
            <el-option v-for="p in provinces" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="currAddr.district_id" placeholder="ស្រុក" style="width:100%" size="large" clearable>
            <el-option v-for="d in currDistricts" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="currAddr.communce_id" placeholder="ឃុំ" style="width:100%" size="large" clearable>
            <el-option v-for="c in currCommunces" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="formData.village_id_current_address" placeholder="ភូមិ" style="width:100%" size="large" clearable>
            <el-option v-for="v in currVillages" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-col>
      </el-row>

      <!-- Employment Info -->
      <el-divider content-position="left">
        <span class="section-title">ព័ត៌មានការងារ</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="នាយកដ្ឋាន">
            <el-select v-model="selectedDepartmentId" placeholder="ជ្រើសរើសនាយកដ្ឋាន" style="width:100%" size="large">
              <el-option v-for="dep in departments" :key="dep.id" :label="dep.display_name" :value="dep.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="តួនាទី" prop="position_id">
            <el-select v-model="formData.position_id" placeholder="ជ្រើសរើសតួនាទី" style="width:100%" size="large">
              <el-option v-for="pos in positions" :key="pos.id" :label="pos.display_name" :value="pos.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="កម្រិតតួនាទី" prop="position_level_id">
            <el-select v-model="formData.position_level_id" style="width:100%" size="large">
              <el-option v-for="pl in positionlevels" :key="pl.id" :label="pl.display_name" :value="pl.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ប្រភេទបុគ្គលិក" prop="employee_type_id">
            <el-select v-model="formData.employee_type_id" style="width:100%" size="large">
              <el-option v-for="et in employeetypes" :key="et.id" :label="et.name" :value="et.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ការិយាល័យ" prop="office_id">
            <el-select v-model="formData.office_id" style="width:100%" size="large">
              <el-option v-for="o in offices" :key="o.id" :label="o.name" :value="o.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="រាយការណ៍ទៅ" prop="report_to">
            <el-select v-model="formData.report_to" style="width:100%" size="large">
              <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="កាលបរិច្ឆេទចូលធ្វើការ" prop="hire_date">
            <el-date-picker v-model="formData.hire_date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="កាលបរិច្ឆេទវាយតម្លៃ" prop="promote_date">
            <el-date-picker v-model="formData.promote_date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="វាយតម្លៃ" prop="gender">
            <el-select v-model="formData.is_promote" style="width:100%" size="large">
              <el-option label="បានវាយតម្លៃ" :value="true" />
              <el-option label="មិនទាន់វាយតម្លៃ" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Contact -->
      <el-divider content-position="left">
        <span class="section-title">ព័ត៌មានទំនាក់ទំនង</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="លេខទូរស័ព្ទគ្រួសារ" prop="family_phone">
            <el-input v-model="formData.family_phone" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Bank -->
      <el-divider content-position="left">
        <span class="section-title">ព័ត៌មានធនាគារ</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="ឈ្មោះធនាគារ" prop="bank_name">
            <el-input v-model="formData.bank_name" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="លេខគណនី" prop="bank_account_number">
            <el-input v-model="formData.bank_account_number" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="QR Code">
            <el-upload action="" :auto-upload="false" :show-file-list="false" :on-change="handleQrFileChange">
                        <el-image
  v-if="qrImageUrl"
  :src="qrImageUrl"
  :preview-src-list="qrImageUrl"
  preview-teleported
  alt="qr image"
  style="width: 100%; height: 60%; object-fit: cover"
  @error="handleImageError"
>
</el-image>
             
              <el-button v-else type="primary" plain>ជ្រើសរើស QR Code</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Family -->
      <el-divider content-position="left">
        <span class="section-title">ព័ត៌មានគ្រួសារ</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="ឈ្មោះប្រពន្ធ">
            <el-input v-model="formData.wife_name" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="ឈ្មោះប្តី">
            <el-input v-model="formData.husban_name" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="ចំនួនកូនប្រុស">
            <el-input-number v-model="formData.son_number" :min="0" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="ចំនួនកូនស្រី">
            <el-input-number v-model="formData.daughter_number" :min="0" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Note -->
      <el-divider content-position="left">
        <span class="section-title">ចំណាំ</span>
      </el-divider>
      <el-form-item label="ចំណាំ">
        <el-input v-model="formData.note" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { updateEmployee } from '../services/employee'
import { fetchDepartment }    from '../services/department'
import { fetchPosition }      from '../services/position'
import { fetchPositionLevel } from '../services/positionlevel'
import { fetchEmployeetype }  from '../services/employeetype'
import { fetchOffice }        from '../services/office'
import { fetchProvince }      from '../services/province'
import { fetchDistrict }      from '../services/district'
import { fetchCommunce }      from '../services/communce'
import { fetchVillage }       from '../services/village'
import { getuser }            from '../services/userservice'
import { fetchEmployee } from '../services/employee'

// ─── Props & Emits ────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: Boolean,
  employee:   Object,
})
const emit = defineEmits(['update:modelValue', 'updated'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ─── Dropdown lists ───────────────────────────────────────────────────────────
const departments    = ref([])
const positions      = ref([])
const positionlevels = ref([])
const employeetypes  = ref([])
const offices        = ref([])
const provinces      = ref([])
const users          = ref([])

// Birth address cascade lists
const birthDistricts = ref([])
const birthCommunces = ref([])
const birthVillages  = ref([])

// Current address cascade lists
const currDistricts = ref([])
const currCommunces = ref([])
const currVillages  = ref([])

// UI-only helpers (not sent to backend)
const birthAddr            = reactive({ province_id: null, district_id: null, communce_id: null })
const currAddr             = reactive({ province_id: null, district_id: null, communce_id: null })
const selectedDepartmentId = ref(null)

// ─── Form state ───────────────────────────────────────────────────────────────
const formRef          = ref(null)
const submitting       = ref(false)
const profileImageUrl  = ref('')
const qrImageUrl       = ref('')
const profileImageFile = ref(null)
const qrImageFile      = ref(null)

// Flag to prevent address/department watchers from resetting values during init
const isInitializing = ref(false)

const formData = reactive({
  // employee table
  name_en:            '',
  name_kh:            '',
  national_id_number: '',
  gender:             null,
  position_id:        null,
  hire_date:          '',
  promote_date:       '',
  is_promote:         false,
  employee_type_id:   null,
  is_active:          true,
  office_id:          null,
  // employeeprofile table
  position_level_id:          null,
  dob:                        '',
  village_id_of_birth:        null,   
  material_status:            '',
  village_id_current_address: null,  
  family_phone:               '',
  bank_name:                  '',
  bank_account_number:        '',
  note:                       '',
  report_to:                  null,
  wife_name:                  '',
  husban_name:                '',
  son_number:                 0,
  daughter_number:            0,
})

// ─── Populate form when dialog opens ─────────────────────────────────────────
watch(visible, async (open) => {
  if (!open) return

  const emp     = props.employee?.employees?.[0]
  const profile = props.employee?.employeeprofies?.[0]
  if (!emp) return

  isInitializing.value = true

  // ── 1. Load all dropdowns in parallel, including positions for this dept ──
  await Promise.allSettled([
    // Promise.allSettled run many promises in parallel and wait until all finish, whether they succeed or fail.
    fetchDepartment().then(r    => departments.value    = r.data.data),
    fetchPositionLevel().then(r => positionlevels.value = r.data.data),
    fetchEmployeetype().then(r  => employeetypes.value  = r.data.data),
    fetchOffice().then(r        => offices.value        = r.data.data),
    fetchProvince().then(r      => provinces.value      = r.data.data),

    // load positions for the employee's current department upfront
    emp.department_id
      ? fetchPosition(emp.department_id).then(r => positions.value = r.data.data)
      : Promise.resolve(),

    // load users for the employee's branch (for report_to dropdown)
    props.employee?.branch_id
      ? getuser(props.employee.branch_id).then(r => users.value = r.data.data)
      : Promise.resolve(),
  ])

  // ── 2. Set department & position AFTER positions array is populated ────────
  // isInitializing=true prevents the department watcher from clearing position_id
  selectedDepartmentId.value = emp.department_id ?? null
  formData.position_id       = emp.position_id   ?? null

  // ── 3. Fill employee fields ───────────────────────────────────────────────
  formData.name_en            = emp.name_en            ?? ''
  formData.name_kh            = emp.name_kh            ?? ''
  formData.national_id_number = emp.national_id_number ?? ''
  formData.gender             = emp.gender             ?? null
  formData.hire_date          = emp.hire_date          ?? ''
  formData.promote_date       = emp.promote_date       ?? ''
  formData.is_promote         = emp.is_promote         ?? false
  formData.employee_type_id   = emp.employee_type_id   ?? null
  formData.is_active          = emp.is_active          ?? true
  formData.office_id          = emp.office_id          ?? null

  // ── 4. Fill profile fields ────────────────────────────────────────────────
  // NOTE: using exact field names from your API response
  formData.position_level_id          = profile?.position_level_id ?? null
  formData.dob                        = profile?.dob               ?? ''
  formData.material_status            = profile?.material_status   ?? ''
  formData.family_phone               = profile?.family_phone      ?? ''
  formData.bank_name                  = profile?.bank_name         ?? ''
  formData.bank_account_number        = profile?.bank_account_number ?? ''
  formData.note                       = profile?.note              ?? ''
  formData.report_to                  = profile?.report_to         ?? null
  formData.wife_name                  = profile?.wife_name         ?? ''
  formData.husban_name                = profile?.husban_name       ?? ''
  formData.son_number                 = profile?.son_number        ?? 0
  formData.daughter_number            = profile?.daughter_number   ?? 0

  // API uses village_id_birth / village_id_current (not village_id_of_birth / village_id_current_address)
  // Map them to our formData field names that match the backend request struct
  formData.village_id_of_birth        = profile?.village_id_birth   ?? null
 formData.village_id_current_address = profile?.village_id_current ?? null

  // ── 5. Set image previews ─────────────────────────────────────────────────
  profileImageUrl.value = profile?.profile_image
    ? `http://localhost:8080/profileimage/${profile.profile_image}` : ''

  // API qr path may include "public\qrcodeimage\" prefix — strip it
  const qrRaw = profile?.qr_code_bank_account ?? ''
  const qrFile = qrRaw.includes('\\') ? qrRaw.split('\\').pop() : qrRaw
  qrImageUrl.value = qrFile ? `http://localhost:8080/qrcodeimage/${qrFile}` : ''

  // ── 6. Pre-load address cascades ─────────────────────────────────────────
  // province_id_birth comes as string "1" from API → parse to int for el-select matching
  await preloadBirthAddress(profile)
  await preloadCurrAddress(profile)

  isInitializing.value = false
})

// ─── Pre-load birth address cascade ──────────────────────────────────────────
async function preloadBirthAddress(profile) {
  if (!profile) return
  try {
    // province_id_birth is a STRING in the API ("1"), parse to Number
    const provinceId = profile.province_id_birth ? Number(profile.province_id_birth) : null
    if (provinceId) {
      birthAddr.province_id = provinceId
      birthDistricts.value  = (await fetchDistrict(provinceId)).data.data
    }
    // district_id_birth is a Number
    if (profile.district_id_birth) {
      birthAddr.district_id = profile.district_id_birth
      birthCommunces.value  = (await fetchCommunce(profile.district_id_birth)).data.data
    }
    // communce_id_birth is a Number
    if (profile.communce_id_birth) {
      birthAddr.communce_id = profile.communce_id_birth
      birthVillages.value   = (await fetchVillage(profile.communce_id_birth)).data.data
    }
    // village is already set in formData.village_id_of_birth above
  } catch (e) { /* silent — dropdowns just stay empty */ }
}

// ─── Pre-load current address cascade ────────────────────────────────────────
async function preloadCurrAddress(profile) {
  if (!profile) return
  try {
    // province_id_current is a Number
    if (profile.province_id_current) {
      currAddr.province_id = profile.province_id_current
      currDistricts.value  = (await fetchDistrict(profile.province_id_current)).data.data
    }
    // NOTE: API has TYPO "distirct_id_current" (missing 'c') — match it exactly
    const districtId = profile.distirct_id_current ?? profile.district_id_current ?? null
    if (districtId) {
      currAddr.district_id = districtId
      currCommunces.value  = (await fetchCommunce(districtId)).data.data
    }
    if (profile.communce_id_current) {
      currAddr.communce_id = profile.communce_id_current
      currVillages.value   = (await fetchVillage(profile.communce_id_current)).data.data
    }
    // village is already set in formData.village_id_current_address above
  } catch (e) { /* silent */ }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

// Department → reload positions, reset position only when user changes it
watch(selectedDepartmentId, async (v) => {
  if (isInitializing.value) return  // skip during init — positions already loaded

  positions.value      = []
  formData.position_id = null       // only reset when user manually picks new dept
  if (!v) return
  try { positions.value = (await fetchPosition(v)).data.data } catch (e) {}
})

// Birth address cascade
watch(() => birthAddr.province_id, async (v) => {
  if (isInitializing.value) return
  birthDistricts.value = []; birthCommunces.value = []; birthVillages.value = []
  birthAddr.district_id = null; birthAddr.communce_id = null
  formData.village_id_of_birth = null
  if (!v) return
  try { birthDistricts.value = (await fetchDistrict(v)).data.data } catch (e) {}
})
watch(() => birthAddr.district_id, async (v) => {
  if (isInitializing.value) return
  birthCommunces.value = []; birthVillages.value = []
  birthAddr.communce_id = null; formData.village_id_of_birth = null
  if (!v) return
  try { birthCommunces.value = (await fetchCommunce(v)).data.data } catch (e) {}
})
watch(() => birthAddr.communce_id, async (v) => {
  if (isInitializing.value) return
  birthVillages.value = []; formData.village_id_of_birth = null
  if (!v) return
  try { birthVillages.value = (await fetchVillage(v)).data.data } catch (e) {}
})

// Current address cascade
watch(() => currAddr.province_id, async (v) => {
  if (isInitializing.value) return
  currDistricts.value = []; currCommunces.value = []; currVillages.value = []
  currAddr.district_id = null; currAddr.communce_id = null
  formData.village_id_current_address = null
  if (!v) return
  try { currDistricts.value = (await fetchDistrict(v)).data.data } catch (e) {}
})
watch(() => currAddr.district_id, async (v) => {
  if (isInitializing.value) return
  currCommunces.value = []; currVillages.value = []
  currAddr.communce_id = null; formData.village_id_current_address = null
  if (!v) return
  try { currCommunces.value = (await fetchCommunce(v)).data.data } catch (e) {}
})
watch(() => currAddr.communce_id, async (v) => {
  if (isInitializing.value) return
  currVillages.value = []; formData.village_id_current_address = null
  if (!v) return
  try { currVillages.value = (await fetchVillage(v)).data.data } catch (e) {}
})

// ─── File handlers ────────────────────────────────────────────────────────────
const handleProfileFileChange = (file) => {
  if (!file.raw) return
  profileImageUrl.value  = URL.createObjectURL(file.raw)
  profileImageFile.value = file.raw
}
const handleQrFileChange = (file) => {
  if (!file.raw) return
  qrImageUrl.value  = URL.createObjectURL(file.raw)
  qrImageFile.value = file.raw
}

// ─── Submit ───────────────────────────────────────────────────────────────────
const submitUpdate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }
    try {
      submitting.value = true
      const employeeId = props.employee?.employees?.[0]?.id

      const fd = new FormData()

      // String fields
      const strings = [
        'name_en', 'name_kh', 'national_id_number', 'hire_date', 'promote_date',
        'material_status', 'family_phone', 'bank_name', 'bank_account_number',
        'note', 'wife_name', 'husban_name', 'dob',
      ]
      strings.forEach(k => {
        if (formData[k] !== null && formData[k] !== undefined) fd.append(k, formData[k])
      })

      // Numeric / boolean fields
      const numerics = [
        ['gender',                     formData.gender],
        ['position_id',                formData.position_id],
        ['employee_type_id',           formData.employee_type_id],
        ['office_id',                  formData.office_id],
        ['position_level_id',          formData.position_level_id],
        ['village_id_of_birth',        formData.village_id_of_birth],
        ['village_id_current_address', formData.village_id_current_address],
        ['report_to',                  formData.report_to],
        ['son_number',                 formData.son_number],
        ['daughter_number',            formData.daughter_number],
        ['is_promote',                 formData.is_promote],
        ['is_active',                  formData.is_active],
      ]
      numerics.forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v)
      })

      // Files (only append if user selected a new one)
      if (profileImageFile.value) fd.append('profile_image',        profileImageFile.value)
      if (qrImageFile.value)      fd.append('qr_code_bank_account', qrImageFile.value)

      await updateEmployee(employeeId, fd)
     
      ElMessage.success('កែប្រែព័ត៌មានបានជោគជ័យ!')
      emit('updated')
      visible.value = false
    } catch (err) {
      ElMessage.error('កែប្រែបានបរាជ័យ: ' + (err.response?.data?.message || err.message))
    } finally {
      submitting.value = false
    }
  })
}

// ─── Validation rules ─────────────────────────────────────────────────────────
const formRules = {
  name_en:            [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាអង់គ្លេស',   trigger: 'blur' }],
  name_kh:            [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាខ្មែរ',     trigger: 'blur' }],
  national_id_number: [{ required: true, message: 'សូមបញ្ចូលអត្តលេខ',           trigger: 'blur' }],
  gender:             [{ required: true, message: 'សូមជ្រើសរើសភេទ',             trigger: 'change' }],
  dob:                [{ required: true, message: 'សូមជ្រើសរើសថ្ងៃកំណើត',       trigger: 'change' }],
  material_status:    [{ required: true, message: 'សូមជ្រើសរើសស្ថានភាព',        trigger: 'change' }],
  position_id:        [{ required: true, message: 'សូមជ្រើសរើសតួនាទី',          trigger: 'change' }],
  position_level_id:  [{ required: true, message: 'សូមជ្រើសរើសកម្រិតតួនាទី',   trigger: 'change' }],
  employee_type_id:   [{ required: true, message: 'សូមជ្រើសរើសប្រភេទបុគ្គលិក', trigger: 'change' }],
  office_id:          [{ required: true, message: 'សូមជ្រើសរើសការិយាល័យ',       trigger: 'change' }],
  hire_date:          [{ required: true, message: 'សូមជ្រើសរើសថ្ងៃចូលធ្វើការ',  trigger: 'change' }],
  promote_date:       [{ required: true, message: 'សូមជ្រើសរើសថ្ងៃវាយតម្លៃ',    trigger: 'change' }],
  bank_name:          [{ required: true, message: 'សូមបញ្ចូលឈ្មោះធនាគារ',       trigger: 'blur' }],
  bank_account_number:[{ required: true, message: 'សូមបញ្ចូលលេខគណនី',           trigger: 'blur' }],
  family_phone:       [{ required: true, message: 'សូមបញ្ចូលលេខទូរស័ព្ទ',       trigger: 'blur' }],
  report_to:          [{ required: true, message: 'សូមជ្រើសរើសអ្នករាយការណ៍',    trigger: 'change' }],
  village_id_of_birth:          [{ required: true, message: 'សូមជ្រើសរើសភូមិកំណើត',      trigger: 'change' }],
  village_id_current_address:   [{ required: true, message: 'សូមជ្រើសរើសភូមិបច្ចុប្បន្ន', trigger: 'change' }],
}
</script>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #409eff;
}
.avatar {
  width: 160px;
  height: 210px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.qr-preview {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border: 1px solid #dcdfe6;
}
</style>