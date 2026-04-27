<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { createWorkExperience } from '../services/employee';
const props = defineProps({
    modelValue: Boolean,
    // គ្រប់គ្រង open/close dialog
    employee: Object
    // data បុគ្គលិក
});
const emit = defineEmits(['update:modelValue','created'])
// update:modelValue → បិទ/បើក dialog
// created → ប្រាប់ parent ថា create រួច
const visible = computed({
    get: ()=>props.modelValue,
    set: (v)=>emit('update:modelValue',v)
});
const formRef = ref(null)
const submitting = ref(false)

const initialFormData = () =>({
  employee_id: null,
  company_name: '',
  position_title: '',
  start_date: '',
  end_date: '',
  job_description: '' 
})
// function that return object
const formData = reactive(initialFormData())
watch(visible,async (open)=>{
    if(!open) return
    Object.assign(formData,initialFormData())
    formData.employee_id = props.employee?.employees?.[0].id
})

const submitCreate = async () => {
    if(!formRef.value) return
    await formRef.value.validate(async (valid)=>{
        if(!valid){
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return            
        }
        try{
            submitting.value = true  
            const fd = new FormData()
            fd.append('employee_id',formData.employee_id)
            const strings = ['company_name','position_title','start_date','end_date','job_description']
                  strings.forEach(k => {
        if (formData[k] !== null && formData[k] !== undefined) fd.append(k, formData[k])
      })
    await createWorkExperience(fd)
    ElMessage.success('បន្ថែមប្រវត្តិការងារបានជោគជ័យ')
    emit('created')
    visible.value = false
        }catch(e){
ElMessage.error('បន្ថែមបានបរាជ័យ: ' + (e.response?.data?.message || e.message))
        }finally{
            submitting.value = false
        }
    })
}
const formRules = {
    employee_id: [{required: true,message: 'គ្នានID Employee',trigger: 'change'}],
    company_name: [{required: true,message: 'បញ្ចូលឈ្មោះក្រុនហ៊ុន',trigger: 'blur'}],
    position_title: [{required: true,message: 'បញ្ចូលឈ្មោះតួនាទី',trigger: 'blur'}],
  start_date:      [{ required: true, message: 'ជ្រើសរើសថ្ងៃចាប់ផ្ដើម',          trigger: 'change' }],
  end_date:        [{ required: true, message: 'ជ្រើសរើសថ្ងៃបញ្ចប់',             trigger: 'change' }],
  job_description: [{ required: true, message: 'ពិពណ៌នាពីការងារ',                trigger: 'blur' }]    
}
</script>

<template>
  <!-- ← Wrapper dialog was entirely missing -->
  <el-dialog v-model="visible" title="បន្ថែមបទពិសោធន៍ការងារ" width="700px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="ឈ្មោះក្រុមហ៊ុន" prop="company_name">
            <!-- ← was formData.company_name[index], but this is a single-record update -->
            <el-input v-model="formData.company_name" placeholder="ឈ្មោះក្រុមហ៊ុន" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="តួនាទី" prop="position_title">
            <el-input v-model="formData.position_title" placeholder="តួនាទី" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ថ្ងៃចាប់ផ្តើម" prop="start_date">
            <el-date-picker v-model="formData.start_date" type="date"
              placeholder="ចាប់ផ្តើម" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              size="large" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ថ្ងៃបញ្ចប់" prop="end_date">
            <el-date-picker v-model="formData.end_date" type="date"
              placeholder="បញ្ចប់" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              size="large" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="ពិពណ៌នាការងារ" prop="job_description">
            <el-input v-model="formData.job_description" type="textarea"
              :rows="4" placeholder="ពិពណ៌នាការងារ" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- ← Submit button was missing -->
    <template #footer>
      <el-button @click="visible = false">បោះបង់</el-button>
     <el-button type="primary" :loading="submitting" @click="submitCreate">
        រក្សាទុក
      </el-button>
    </template>
  </el-dialog>
</template>