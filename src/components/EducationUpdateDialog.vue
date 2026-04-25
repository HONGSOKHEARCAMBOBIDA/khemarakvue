<template>
<el-dialog
  v-model="visible"
  title="កែប្រែប្រវត្តិសិក្សា"
  width="1400px"
  destroy-on-close
>
  <div class="pb-4" style="display:flex; justify-content:space-between; align-items:center">
    <div>
      <el-button @click="visible = false" size="large">បោះបង់</el-button>
      <el-button type="primary" @click="submitUpdate" :loading="submitting" size="large">រក្សាទុក</el-button>
    </div>
  </div>

  <el-form
    :model="formData"
    :rules="formRules"
    ref="formRef"
    label-width="220px"
    label-position="right"
  >
    <!-- ✅ Removed v-for — this is a single-record form -->
    <div class="education-item">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="កម្រិតសិក្សា" prop="education_level_id">
            <el-select v-model="formData.education_level_id" placeholder="ជ្រើសរើស" style="width:100%" size="large">
              <el-option v-for="edl in educationlevel" :key="edl.id" :label="edl.name" :value="edl.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ជំនាញ" prop="major_field_of_study">
            <el-input v-model="formData.major_field_of_study" placeholder="ជំនាញ" size="large" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ថ្ងៃចាប់ផ្តើម" prop="start_date">
            <el-date-picker v-model="formData.start_date" type="date" placeholder="ចាប់ផ្តើម" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ថ្ងៃបញ្ចប់" prop="end_date">
            <el-date-picker v-model="formData.end_date" type="date" placeholder="បញ្ចប់" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ចំណាំ" prop="note">
            <el-input v-model="formData.note" placeholder="ចំណាំ" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="រូបភាពដែលបានជ្រេីសរេីស">
            <el-upload
              class="avatar-uploader"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleeducationimage"
            >
              <img v-if="eduImageUrl" :src="eduImageUrl" class="avatar" />
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { updateEducation } from '../services/employee'
import { fetchEducationLevel } from '../services/educationlevel'

const props = defineProps({
  modelValue: Boolean,
  education: Object   // ← receives the specific edu record directly
})
const emit = defineEmits(['update:modelValue', 'updated'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const educationlevel = ref([])
const formRef        = ref(null)   // ✅ consistent name
const submitting     = ref(false)
const eduImageUrl    = ref('')
const eduImageFile   = ref(null)

const formData = reactive({
  education_level_id:   null,
  major_field_of_study: '',
  start_date:           '',
  end_date:             '',
  note:                 ''
})

watch(visible, async (open) => {
  if (!open) return
  const edu = props.education  // ← now uses the correct selected record
  if (!edu) return

  await fetchEducationLevel().then(r => educationlevel.value = r.data.data)

  formData.education_level_id   = edu.education_level_id   ?? null
  formData.major_field_of_study = edu.major_field_of_study ?? ''
  formData.start_date           = edu.start_date           ?? ''
  formData.end_date             = edu.end_date             ?? ''
  formData.note                 = edu.note                 ?? ''
  eduImageUrl.value = edu.image
    ? `http://localhost:8080/educationimage/${edu.image}`
    : ''
})

const handleeducationimage = (file) => {
  if (!file.raw) return
  eduImageUrl.value  = URL.createObjectURL(file.raw)
  eduImageFile.value = file.raw
}

const submitUpdate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }
    try {
      submitting.value = true
      const employeeID = props.education?.employee_education_id
      const fd = new FormData()

      const strings = ['major_field_of_study', 'start_date', 'end_date', 'note']
      strings.forEach(k => {
        if (formData[k] !== null && formData[k] !== undefined) fd.append(k, formData[k])
      })

      const numerics = [['education_level_id', formData.education_level_id]]
      numerics.forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v)
      })

      if (eduImageFile.value) fd.append('education_image', eduImageFile.value)

      await updateEducation(employeeID, fd)
      ElMessage.success('កែប្រែព័ត៌មានបានជោគជ័យ!')
      emit('updated')
      visible.value = false
    } catch (e) {  // ✅ use e, not err
      ElMessage.error('កែប្រែបានបរាជ័យ: ' + (e.response?.data?.message || e.message))
    } finally {
      submitting.value = false
    }
  })
}

const formRules = {
  education_level_id:   [{ required: true, message: 'ជ្រេីសរេីសកម្រិតសិក្សា',          trigger: 'change' }],
  major_field_of_study: [{ required: true, message: 'សូមបញ្ចូលជំនាញដែលសិក្សា',         trigger: 'blur'   }],
  start_date:           [{ required: true, message: 'ជ្រេីសរេីសថ្ងៃចាប់ផ្ដេីមសិក្សា', trigger: 'change' }],
  end_date:             [{ required: true, message: 'ជ្រេីសរេីសថ្ងៃបញ្ចប់ការសិក្សា', trigger: 'change' }],
  note:                 [{ required: true, message: 'ពិពណ៌នាពីការសិក្សា',               trigger: 'blur'   }],
}
</script>