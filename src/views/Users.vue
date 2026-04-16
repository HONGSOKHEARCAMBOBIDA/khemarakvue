<template>
  <div class="user-register-container">
    <el-card class="register-card">
      <template #header>
        <div class="flex flex-col gap-4 items-center">
          <h2>
            <div class="logo">បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី</div>
          </h2>
        </div>
      </template>

      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="200px" label-position="right">
        <!-- Basic Information Section -->
        <div class="logo">
          <el-divider content-position="left">
            <div class="logo">ព័ត៌មានមូលដ្ឋាន</div>
          </el-divider>
        </div>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="ឈ្មោះជាភាសាអង់គ្លេស" prop="name_en">
              <el-input v-model="formData.name_en" placeholder="បញ្ចូលឈ្មោះជាអង់គ្លេស" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ឈ្មោះជាភាសាខ្មែរ" prop="name_kh">
              <el-input v-model="formData.name_kh" placeholder="បញ្ចូលឈ្មោះជាខ្មែរ" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="អត្តសញ្ញាណប័ណ្ណ" prop="national_id_number">
              <el-input v-model="formData.national_id_number" placeholder="បញ្ចូលអត្តលេខ" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ភេទ" prop="gender">
              <el-select v-model="formData.gender" placeholder="ជ្រើសរើសភេទ" style="width: 100%" size="large">
                <el-option label="ប្រុស" :value="1" />
                <el-option label="ស្រី" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" lass="spaced-row">
          <el-col :span="12">
            <el-form-item label="ថ្ងៃខែឆ្នាំកំណើត" prop="dob">
              <el-date-picker v-model="formData.dob" type="date" placeholder="ជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ស្ថានភាពអាពាហ៍ពិពាហ៍" prop="material_status">
              <el-select v-model="formData.material_status" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option label="នៅលីវ" value="នៅលីវ" />
                <el-option label="រៀបការ" value="រៀបការ" />
                <el-option label="លែងលះ" value="លែងលះ" />
                <el-option label="មេម៉ាយ" value="មេម៉ាយ" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Employment Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានការងារ</div>
        </el-divider>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="នាយកដ្ឋាន" prop="department_id">
              <el-select v-model="formData.department_id" placeholder="ជ្រើសរើសនាយកដ្ឋាន" class="w-full" size="large">
                <el-option v-for="dep in departments" :key="dep.id" :label="dep.display_name" :value="dep.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="តួនាទី" prop="position_id">
              <el-select v-model="formData.position_id" placeholder="ជ្រើសរើសតួនាទី" class="w-full" size="large">
                <el-option v-for="pos in positions" :key="pos.id" :label="pos.display_name" :value="pos.id" />
              </el-select>
            </el-form-item>
          </el-col>

        </el-row>

        <el-row class="spaced-row">
          <el-col :span="12">
            <el-form-item label="បម្រេីការងារក្នុងសាខា" prop="branch_id">
              <el-select v-model="formData.branch_id" placeholder="ជ្រើសរើសសាខា" style="width: 100%" size="large">
                <el-option label="សាខាកណ្តាល" :value="1" />
                <el-option label="សាខាត្រីចក្រយាន្ត" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="កម្រិតតួនាទី" prop="position_level_id">
              <el-select v-model="formData.position_level_id" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option v-for="posl in positionlevel" :key="posl.id" :label="posl.display_name" :value="posl.id" />

              </el-select>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row class="spaced-row">
          <el-col :span="12">
            <el-form-item label="ប្រភេទបុគ្គលិក" prop="employee_type_id">
              <el-select v-model="formData.employee_type_id" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option v-for="empt in employeetypes" :key="empt.id" :label="empt.name" :value="empt.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ការិយាល័យ" prop="office_id">
              <el-select v-model="formData.office_id" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option v-for="office in offices" :key="office.id" :label="office.display_name" :value="office.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="កាលបរិច្ឆេទចូលធ្វើការ" prop="hire_date">
              <el-date-picker v-model="formData.hire_date" type="date" placeholder="ជ្រើសរើស" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="កាលបរិច្ឆេទវាយតម្លៃការងារ" prop="promote_date">
              <el-date-picker v-model="formData.promote_date" type="date" placeholder="ជ្រើសរើស" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Contact Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានទំនាក់ទំនង</div>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="លេខទូរស័ព្ទសាមីខ្លួន" prop="contact">
              <el-input v-model="formData.contact" placeholder="បញ្ចូលលេខទូរស័ព្ទ" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="លេខទូរស័ព្ទគ្រួសារ" prop="family_phone">
              <el-input v-model="formData.family_phone" placeholder="បញ្ចូលលេខទូរស័ព្ទគ្រួសារ" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Bank Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានធនាគារ</div>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ឈ្មោះធនាគារទទួលប្រាក់ខែ" prop="bank_name">
              <el-input v-model="formData.bank_name" placeholder="បញ្ចូលឈ្មោះធនាគារ" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="លេខគណនីធនាគារ" prop="bank_account_number">
              <el-input v-model="formData.bank_account_number" placeholder="បញ្ចូលលេខគណនី" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Salary Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានប្រាក់ខែ</div>
        </el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="រូបិយប័ណ្ណ" prop="currency_id">
              <el-select v-model="formData.currency_id" placeholder="ជ្រើសរើសរូបិយប័ណ្ណ" style="width: 100%"
                size="large">
                <el-option v-for="currency in currencys" :key="currency.id" :label="currency.name"
                  :value="currency.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="វេនធ្វើការ" prop="shift_id">
              <el-select v-model="formData.shift_id" placeholder="ជ្រើសរើសវេន" style="width: 100%" size="large">
                <el-option v-for="shift in shifts" :key="shift.id" :label="shift.name" :value="shift.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
<div class="flex flex-col gap-4 items-center p-4">
  <el-row :gutter="20">
  <el-text
    v-for="shiftsession in shiftsessions"
    :key="shiftsession.id"
    type="danger"
    class="mx-1"
    size="large"
  >
    {{ `${shiftsession.session_name} : ${shiftsession.start_time} - ${shiftsession.end_time}` }}
  </el-text>
</el-row>
</div>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="ប្រាក់ខែគោល" prop="base_salary">
              <el-input-number v-model="formData.base_salary" :min="0" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ថ្ងៃធ្វើការ" prop="work_day">
              <el-input-number v-model="formData.work_day" :min="1" :max="31" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ថ្លៃក្នុងមួយថ្ងៃ" prop="daily_rate">
              <el-input-number :model-value="dailyRate" :min="0" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
        </el-row>



        <!-- Family Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានគ្រួសារ</div>
        </el-divider>
        <el-row :gutter="0">
          <el-col :span="6">
            <el-form-item label="ឈ្មោះប្រពន្ធ">
              <el-input v-model="formData.wife_name" placeholder="ឈ្មោះប្រពន្ធ" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="ឈ្មោះប្តី">
              <el-input v-model="formData.husban_name" placeholder="ឈ្មោះប្តី" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="ចំនួនកូនប្រុស">
              <el-input-number v-model="formData.son_number" :min="0" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="ចំនួនកូនស្រី">
              <el-input-number v-model="formData.daughter_number" :min="0" style="width: 100%" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Work Experience Section -->
        <el-divider content-position="left">
          <div class="logo">បទពិសោធន៍ការងារ</div>
        </el-divider>

        <div v-for="(exp, index) in workExperiences" :key="index" class="work-experience-item">
          <el-row>
            <el-col :span="6">
              <el-form-item label="ឈ្មោះក្រុមហ៊ុន">
                <el-input v-model="formData.company_name[index]" placeholder="ឈ្មោះក្រុមហ៊ុន" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="តួនាទី">
                <el-input v-model="formData.position_title[index]" placeholder="តួនាទី" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="ថ្ងៃចាប់ផ្តើម">
                <el-date-picker v-model="formData.start_date[index]" type="date" placeholder="ចាប់ផ្តើម"
                  format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="ថ្ងៃបញ្ចប់">
                <el-date-picker v-model="formData.end_date[index]" type="date" placeholder="បញ្ចប់" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-button v-if="index > 0" type="danger" size="small" @click="removeWorkExperience(index)">លុប</el-button>
        </div>
        <el-button type="primary" size="large" @click="addWorkExperience">បន្ថែមបទពិសោធន៍</el-button>

        <!-- Education Section -->
        <el-divider content-position="left">
          <div class="logo">ការសិក្សា</div>
        </el-divider>

        <div v-for="(edu, index) in educations" :key="index" class="education-item">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="កម្រិតសិក្សា">
                <el-select v-model="formData.education_level_id[index]" placeholder="ជ្រើសរើស" style="width: 100%"
                  size="large">
                  <el-option label="បឋមសិក្សា" :value="1" />
                  <el-option label="មធ្យមសិក្សា" :value="2" />
                  <el-option label="បរិញ្ញាបត្រ" :value="3" />
                  <el-option label="អនុបណ្ឌិត" :value="4" />
                  <el-option label="បណ្ឌិត" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ជំនាញ">
                <el-input v-model="formData.major_field_of_study[index]" placeholder="ជំនាញ" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="ថ្ងៃចាប់ផ្តើម">
                <el-date-picker v-model="formData.start_date_eud[index]" type="date" placeholder="ចាប់ផ្តើម"
                  format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="ថ្ងៃបញ្ចប់">
                <el-date-picker v-model="formData.end_date_eud[index]" type="date" placeholder="បញ្ចប់"
                  format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="ចំណាំ">
                <el-input v-model="formData.noteedu[index]" placeholder="ចំណាំ" size="large" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-button v-if="index > 0" type="danger" size="small" @click="removeEducation(index)">លុប</el-button>
        </div>
        <el-button type="primary" size="large" @click="addEducation">បន្ថែមការសិក្សា</el-button>

        <!-- Permissions Section -->
        <el-divider content-position="left">
          <div class="logo">សិទ្ធិ និងការអនុញ្ញាត</div>
        </el-divider>



        <el-row>
          <el-col :span="8">
            <el-form-item label="តួនាទីក្នុងប្រព័ន្ធ" prop="role_id">
              <el-select v-model="formData.role_id" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option label="អ្នកគ្រប់គ្រង" :value="1" />
                <el-option label="បុគ្គលិក" :value="2" />
                <el-option label="អ្នកមើល" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="សិទ្ធមេីលសាខា" prop="manage_branch">
              <el-select v-model="formData.manage_branch" placeholder="សិទ្ធមេីលសាខា" style="width: 100%" size="large">
                <el-option label="មេីលបានមួយសាខា" :value="1" />
                <el-option label="មេីលបានច្រេីនសាខា" :value="2" />
                <el-option label="មេីលបានគ្រប់សាខា" :value="2" />
              </el-select>

            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="របាយការណ៍ទៅ" prop="report_to">
              <el-select v-model="formData.report_to" placeholder="ជ្រើសរើស" style="width: 100%" size="large">
                <el-option label="ប្រធាន" :value="1" />
                <el-option label="នាយក" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="សិទ្ធក្នុងការមេីលទិន្ន័យ" prop="part_ids">
          <el-select v-model="formData.part_ids" multiple placeholder="ជ្រើសរើសផ្នែក" style="width: 100%" size="large">
            <el-option label="ផ្នែកបុគ្គលិក" :value="1" />
            <el-option label="ផ្នែកគណនេយ្យ" :value="2" />
            <el-option label="ផ្នែកទីផ្សារ" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="សាខាដែលគ្រប់គ្រង" prop="branch_ids">
          <el-select v-model="formData.branch_ids" multiple placeholder="ជ្រើសរើសសាខា" style="width: 100%" size="large">
            <el-option label="សាខាកណ្តាល" :value="1" />
            <el-option label="សាខាត្រីចក្រយាន្ត" :value="2" />
            <el-option label="សាខាទួលគោក" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="ថ្ងៃឈប់សម្រាក" prop="day_of_weeks">
          <el-select v-model="formData.day_of_weeks" multiple placeholder="ជ្រើសរើសថ្ងៃ" style="width: 100%"
            size="large">
            <el-option label="ថ្ងៃច័ន្ទ" :value="1" />
            <el-option label="ថ្ងៃអង្គារ" :value="2" />
            <el-option label="ថ្ងៃពុធ" :value="3" />
            <el-option label="ថ្ងៃព្រហស្បតិ៍" :value="4" />
            <el-option label="ថ្ងៃសុក្រ" :value="5" />
            <el-option label="ថ្ងៃសៅរ៍" :value="6" />
            <el-option label="ថ្ងៃអាទិត្យ" :value="7" />
          </el-select>
        </el-form-item>

        <el-form-item label="ស្ថានភាពថ្ងៃឈប់" prop="is_day_of">
          <el-checkbox-group v-model="formData.is_day_of">
            <el-checkbox v-for="(day, index) in formData.day_of_weeks" :key="index" :label="true" size="large">
              ថ្ងៃទី {{ day }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="ចំណាំ" prop="note">
          <el-input v-model="formData.note" type="textarea" :rows="3" placeholder="ចំណាំបន្ថែម" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting" size="large">រក្សាទុក</el-button>
          <el-button @click="resetForm" size="large">កំណត់ឡើងវិញ</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { register } from '../services/userservice'
import { fetchDepartment } from '../services/department'
import { fetchPosition } from '../services/position'
import { fetchPositionLevel } from '../services/positionlevel'
import { fetchEmployeetype } from '../services/employeetype'
import { fetchOffice } from '../services/office'
import { fetchCurrency } from '../services/currency'
import { fetchBranch } from '../services/branch'
import { fetchShift } from '../services/shift'
import { fetchShiftSession } from '../services/shiftsession'
const formRef = ref(null)
const submitting = ref(false)
const departments = ref([])
const positions = ref([])
const positionlevel = ref([])
const employeetypes = ref([])
const offices = ref([])
const currencys = ref([])
const branches = ref([])
const shifts = ref([])
const shiftsessions = ref([])
const loading = ref(false)

async function loadDepartments() {
  loading.value = true
  try {
    const res = await fetchDepartment()
    departments.value = res.data.data
  } catch (error) {
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

async function loadPositionLevel() {
  loading.value = true
  try {
    const res = await fetchPositionLevel()
    positionlevel.value = res.data.data
  } catch (e) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

async function loadEmployeeType() {
  loading.value = true
  try {
    const res = await fetchEmployeetype()
    employeetypes.value = res.data.data
  } catch (e) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

async function loadOffice() {
  loading.value = true
  try {
    const res = await fetchOffice()
    offices.value = res.data.data

  } catch (e) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

async function loadCurrency() {
  loading.value = true
  try {
    const res = await fetchCurrency()
    currencys.value = res.data.data
  } catch (e) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

async function loadBranch() {
  loading.value = true
  try {
    const res = await fetchBranch()
    branches.value = res.data.data

  } catch (e) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDepartments()
  loadPositionLevel()
  loadEmployeeType()
  loadOffice()
  loadCurrency()
  loadBranch()
})



// Initialize form data with empty arrays for dynamic fields
const formData = reactive({
  name_en: '',
  name_kh: '',
  national_id_number: '',
  gender: null,
  position_id: null,
  hire_date: '',
  promote_date: '',
  employee_type_id: null,
  office_id: null,
  contact: '',
  branch_id: null,
  role_id: null,
  manage_branch: 0,
  position_level_id: null,
  dob: '',
  village_id_of_birth: null,
  material_status: '',
  village_id_current_address: null,
  family_phone: '',
  bank_name: '',
  bank_account_number: '',
  note: '',
  report_to: null,
  wife_name: '',
  husban_name: '',
  son_number: 0,
  daughter_number: 0,
  company_name: [],
  position_title: [],
  start_date: [],
  end_date: [],
  job_description: [],
  education_level_id: [],
  major_field_of_study: [],
  start_date_eud: [],
  end_date_eud: [],
  noteedu: [],
  part_ids: [],
  branch_ids: [],
  day_of_weeks: [],
  shift_id: null,
  is_day_of: [],
  base_salary: 0,
  work_day: 0,
  daily_rate: 0,
  currency_id: null,
  department_id: null,
})
watch(() => formData.department_id, async (newVal) => {
  if (!newVal) {
    positions.value = []
    return
  }

  try {
    const res = await fetchPosition(newVal)
    positions.value = res.data.data
  } catch (error) {
    ElMessage.error('Load position failed')
  }
})

watch(() => formData.branch_id, async (newVal) => {
  if (!newVal) {
    shifts.value = []
    shiftsessions.value = []
    return
  }
  try {
    formData.shift_id = null
    shifts.value = []
    shiftsessions.value = []
    const res = await fetchShift(newVal)

    shifts.value = res.data.data
  } catch (e) {
    ElMessage.error(e)
  }
})

watch(() => formData.shift_id, async (newVal) => {
  if (!newVal) {
    shiftsessions.value = []
    return
  }
  try {
    shiftsessions.value = []
    const res = await fetchShiftSession(newVal)
    shiftsessions.value = res.data.data

  } catch (e) {
    ElMessage.error(e)
  }
})
// Dynamic arrays for UI
const workExperiences = ref([0])
const educations = ref([0])

const dailyRate = computed(() => {
  if (!formData.work_day) return 0
  return (formData.base_salary / formData.work_day).toFixed(2)
})

// Validation rules
const formRules = {
  name_en: [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាអង់គ្លេស', trigger: 'blur' }],
  name_kh: [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាខ្មែរ', trigger: 'blur' }],
  national_id_number: [{ required: true, message: 'សូមបញ្ចូលអត្តលេខ', trigger: 'blur' }],
  gender: [{ required: true, message: 'សូមជ្រើសរើសភេទ', trigger: 'change' }],
  position_id: [{ required: true, message: 'សូមជ្រើសរើសតួនាទី', trigger: 'change' }],
  employee_type_id: [{ required: true, message: 'សូមជ្រើសរើសប្រភេទបុគ្គលិក', trigger: 'change' }],
  office_id: [{ required: true, message: 'សូមជ្រើសើសការិយាល័យ', trigger: 'change' }],
  branch_id: [{ required: true, message: 'សូមជ្រើសរើសសាខា', trigger: 'change' }],
  role_id: [{ required: true, message: 'សូមជ្រើសរើសតួនាទីក្នុងប្រព័ន្ធ', trigger: 'change' }],
  manage_branch: [{ required: true, message: 'សូមបញ្ចូលចំនួនសាខាដែលគ្រប់គ្រង', trigger: 'blur' }],
  bank_name: [{ required: true, message: 'សូមបញ្ចូលឈ្មោះធនាគារ', trigger: 'blur' }],
  bank_account_number: [{ required: true, message: 'សូមបញ្ចូលលេខគណនីធនាគារ', trigger: 'blur' }],
  base_salary: [{ required: true, message: 'សូមបញ្ចូលប្រាក់ខែគោល', trigger: 'blur' }],
  work_day: [{ required: true, message: 'សូមបញ្ចូលចំនួនថ្ងៃធ្វើការ', trigger: 'blur' }],
  daily_rate: [{ required: true, message: 'សូមបញ្ចូលថ្លៃក្នុងមួយថ្ងៃ', trigger: 'blur' }],
  currency_id: [{ required: true, message: 'សូមជ្រើសរើសរូបិយប័ណ្ណ', trigger: 'change' }]
}

// Add work experience field
const addWorkExperience = () => {
  workExperiences.value.push(workExperiences.value.length)
  formData.company_name.push('')
  formData.position_title.push('')
  formData.start_date.push('')
  formData.end_date.push('')
  formData.job_description.push('')
}

// Remove work experience field
const removeWorkExperience = (index) => {
  workExperiences.value.splice(index, 1)
  formData.company_name.splice(index, 1)
  formData.position_title.splice(index, 1)
  formData.start_date.splice(index, 1)
  formData.end_date.splice(index, 1)
  formData.job_description.splice(index, 1)
}

// Add education field
const addEducation = () => {
  educations.value.push(educations.value.length)
  formData.education_level_id.push(null)
  formData.major_field_of_study.push('')
  formData.start_date_eud.push('')
  formData.end_date_eud.push('')
  formData.noteedu.push('')
}

// Remove education field
const removeEducation = (index) => {
  educations.value.splice(index, 1)
  formData.education_level_id.splice(index, 1)
  formData.major_field_of_study.splice(index, 1)
  formData.start_date_eud.splice(index, 1)
  formData.end_date_eud.splice(index, 1)
  formData.noteedu.splice(index, 1)
}

// Submit form
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true

        // Prepare data for submission
        const submitData = { ...formData }

        // Ensure arrays have proper values
        if (submitData.company_name.length === 0) {
          submitData.company_name = ['']
          submitData.position_title = ['']
          submitData.start_date = ['']
          submitData.end_date = ['']
          submitData.job_description = ['']
        }

        if (submitData.education_level_id.length === 0) {
          submitData.education_level_id = [0]
          submitData.major_field_of_study = ['']
          submitData.start_date_eud = ['']
          submitData.end_date_eud = ['']
          submitData.noteedu = ['']
        }

        const response = await register(submitData)

        if (response.status === 200 || response.status === 201) {
          ElMessage.success('បង្កើតអ្នកប្រើប្រាស់ដោយជោគជ័យ!')
          resetForm()
        } else {
          ElMessage.error('មានបញ្ហា៖ ' + (response.data?.message || 'សូមពិនិត្យម្តងទៀត'))
        }
      } catch (error) {
        console.error('Registration error:', error)
        ElMessage.error('បង្កើតអ្នកប្រើប្រាស់មិនជោគជ័យ៖ ' + (error.response?.data?.message || error.message))
      } finally {
        submitting.value = false
      }
    } else {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return false
    }
  })
}

// Reset form
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  // Reset all dynamic arrays
  Object.keys(formData).forEach(key => {
    if (Array.isArray(formData[key])) {
      formData[key] = []
    } else if (typeof formData[key] === 'number') {
      formData[key] = 0
    } else if (typeof formData[key] === 'string') {
      formData[key] = ''
    } else {
      formData[key] = null
    }
  })

  // Reset work experiences and educations
  workExperiences.value = [0]
  educations.value = [0]
}
</script>

<style scoped>
.spaced-row {
  margin-top: 15px;
  margin-bottom: 15px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  white-space: nowrap;
}

.user-register-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.register-card {
  max-width: 1400px;
  margin: 0 auto;
}

.work-experience-item,
.education-item {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
}

.work-experience-item .el-button,
.education-item .el-button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.el-divider {
  margin: 20px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>