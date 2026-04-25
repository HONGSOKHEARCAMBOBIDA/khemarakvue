<template>
  <el-dialog
    v-model="visible"
    title="បន្ថែមប្រវត្តិសិក្សា"
    width="1400px"
    destroy-on-close
  >
    <div class="pb-4" style="display:flex; justify-content:space-between; align-items:center">
      <div>
        <el-button @click="visible = false" size="large">បោះបង់</el-button>
        <el-button type="primary" @click="submitCreate" :loading="submitting" size="large">រក្សាទុក</el-button>
      </div>
    </div>

    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="220px"
      label-position="right"
    >
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
            <el-form-item label="រូបភាពដែលបានជ្រើសរើស">
              <el-upload
                class="avatar-uploader"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleEducationImage"
              >
                <img v-if="eduImageUrl" :src="eduImageUrl" class="avatar" />
                <el-icon v-else class="el-icon--right"><Upload /></el-icon>
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
import { createEducation } from '../services/employee'
import { fetchEducationLevel } from '../services/educationlevel'

const props = defineProps({
  modelValue: Boolean,
  employee: Object
})
const emit = defineEmits(['update:modelValue', 'updated'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const educationlevel = ref([])
const formRef        = ref(null)
const submitting     = ref(false)
const eduImageUrl    = ref('')
const eduImageFile   = ref(null)

const initialFormData = () => ({
  employee_id:          null,
  education_level_id:   null,
  major_field_of_study: '',
  start_date:           '',
  end_date:             '',
  note:                 ''
})

const formData = reactive(initialFormData())

// Reset form every time dialog opens
watch(visible, async (open) => {
  if (!open) return

  // Reset fields
  Object.assign(formData, initialFormData())
  eduImageUrl.value  = ''
  eduImageFile.value = null

  // Set employee_id from prop
  formData.employee_id = props.employee?.employees?.[0].id

  // Fetch education levels
  try {
    const r = await fetchEducationLevel()
    educationlevel.value = r.data.data
  } catch (e) {
    ElMessage.error('មិនអាចទាញយកកម្រិតសិក្សាបានទេ')
  }
})

const handleEducationImage = (file) => {
  if (!file.raw) return
  eduImageUrl.value  = URL.createObjectURL(file.raw)
  eduImageFile.value = file.raw
}

const submitCreate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }
    try {
      submitting.value = true

      const fd = new FormData()

      fd.append('employee_id', formData.employee_id)

      const strings = ['major_field_of_study', 'start_date', 'end_date', 'note']
      strings.forEach(k => {
        if (formData[k] !== null && formData[k] !== undefined) fd.append(k, formData[k])
      })

      if (formData.education_level_id !== null) {
        fd.append('education_level_id', formData.education_level_id)
      }

      if (eduImageFile.value) fd.append('education_image', eduImageFile.value)

      await createEducation(fd)
      ElMessage.success('បន្ថែមប្រវត្តិសិក្សាបានជោគជ័យ!')
      emit('updated')
      visible.value = false
    } catch (e) {
      ElMessage.error('បន្ថែមបានបរាជ័យ: ' + (e.response?.data?.message || e.message))
    } finally {
      submitting.value = false
    }
  })
}

const formRules = {
  education_level_id:   [{ required: true, message: 'ជ្រើសរើសកម្រិតសិក្សា',           trigger: 'change' }],
  major_field_of_study: [{ required: true, message: 'សូមបញ្ចូលជំនាញដែលសិក្សា',        trigger: 'blur'   }],
  start_date:           [{ required: true, message: 'ជ្រើសរើសថ្ងៃចាប់ផ្តើមសិក្សា',  trigger: 'change' }],
  end_date:             [{ required: true, message: 'ជ្រើសរើសថ្ងៃបញ្ចប់ការសិក្សា',  trigger: 'change' }],
  note:                 [{ required: true, message: 'ពិពណ៌នាពីការសិក្សា',              trigger: 'blur'   }],
}
</script>