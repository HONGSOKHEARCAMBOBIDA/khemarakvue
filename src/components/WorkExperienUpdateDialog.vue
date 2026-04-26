<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { updateWorkExperience } from '../services/employee';

const props = defineProps({
  modelValue: Boolean,
  workexperience: Object
});
const emit = defineEmits(['update:modelValue', 'updated']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const formRef = ref(null);
const submitting = ref(false);

const formData = reactive({
  company_name: '',
  position_title: '',
  start_date: '',
  end_date: '',
  job_description: ''  // ← was missing quotes (syntax error)
});

// ← Populate form when dialog opens or workexperience changes
watch(
  () => props.workexperience,
  (val) => {
    if (val) {
      formData.company_name    = val.company_name    || '';
      formData.position_title  = val.position_title  || '';
      formData.start_date      = val.start_date      || '';
      formData.end_date        = val.end_date        || '';
      formData.job_description = val.job_description || '';
    }
  },
  { immediate: true }
);

const submitUpdate = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!');
      return;
    }
    try {
      submitting.value = true;
      const id = props.workexperience?.id;
      const fd = new FormData();
      ['company_name', 'position_title', 'start_date', 'end_date', 'job_description']
        .forEach(k => {
          if (formData[k] !== null && formData[k] !== undefined) fd.append(k, formData[k]);
        });
      await updateWorkExperience(id, fd);
      ElMessage.success('កែប្រែព័ត៌មានបានជោគជ័យ!');
      emit('updated');
      visible.value = false;
    } catch (e) {
      ElMessage.error('កែប្រែបានបរាជ័យ: ' + (e.response?.data?.message || e.message));
    } finally {
      submitting.value = false;
    }
  });
};

const formRules = {
  company_name:    [{ required: true, message: 'បញ្ចូលឈ្មោះក្រុមហ៊ុន',           trigger: 'blur' }],
  position_title:  [{ required: true, message: 'បញ្ចូលតួនាទី',                   trigger: 'blur' }],
  start_date:      [{ required: true, message: 'ជ្រើសរើសថ្ងៃចាប់ផ្ដើម',          trigger: 'change' }],
  end_date:        [{ required: true, message: 'ជ្រើសរើសថ្ងៃបញ្ចប់',             trigger: 'change' }],
  job_description: [{ required: true, message: 'ពិពណ៌នាពីការងារ',                trigger: 'blur' }]
};
</script>

<template>
  <!-- ← Wrapper dialog was entirely missing -->
  <el-dialog v-model="visible" title="កែប្រែបទពិសោធន៍ការងារ" width="700px" destroy-on-close>
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
      <el-button type="primary" :loading="submitting" @click="submitUpdate">
        រក្សាទុក
      </el-button>
    </template>
  </el-dialog>
</template>