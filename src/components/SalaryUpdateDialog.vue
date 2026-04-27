<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { updatesalary } from '../services/employee';
import { fetchCurrency } from '../services/currency';

const currency = ref([])

const props = defineProps({
    modelValue: Boolean,
    salary: Object
})
const emit = defineEmits(['update:modelValue', 'updated']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const formRef = ref(null);
const submitting = ref(false);

const formData = reactive({
    base_salary: 0,
    work_day: 0,
    daily_rate: 0,
    effective_date: '',
    currency_id: null
});

watch(visible, async (open) => {
    if (!open) return
    const sal = props.salary        // ✅ was: const sal = props.salary (unused), then used `val` below
    if (!sal) return
    await fetchCurrency().then(r => currency.value = r.data.data)
    formData.base_salary   = sal.base_salary   || 0;   // ✅ Fixed: was `val`
    formData.work_day      = sal.work_day      || 0;   // ✅ Fixed: was `val`
    formData.daily_rate    = sal.daily_rate    || 0;   // ✅ Fixed: was `val`
    formData.effective_date = sal.effective_date || ''; // ✅ Fixed: was `val`
    formData.currency_id   = sal.currency_id   || null;// ✅ Fixed: was `val`
})
  
const submitUpdate = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (!valid) {
            ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
            return
        }
        try {
            submitting.value = true
            const id = props.salary?.id
            const fd = new FormData()
            const fields = [
                ['base_salary',    formData.base_salary],
                ['work_day',       formData.work_day],
                ['daily_rate',     formData.daily_rate],
                ['effective_date', formData.effective_date],
                ['currency_id',    formData.currency_id]
            ]
            fields.forEach(([k, v]) => {
                if (v !== null && v !== undefined) fd.append(k, v)
            })
            await updatesalary(id, fd)
            ElMessage.success('កែប្រែព័ត៌មានបានជោគជ័យ!')
            emit('updated')
            visible.value = false           // ✅ close dialog on success
        } catch(e) {
            ElMessage.error('កែប្រែបានបរាជ័យ: ' + (e.response?.data?.message || e.message))
        } finally {
            submitting.value = false
        }
    })
}

const formRules = {
    base_salary:    [{ required: true, message: 'បំពេញប្រាក់ខែមូលដ្ឋាន',                              trigger: 'blur'   }],
    work_day:       [{ required: true, message: 'បំពេញចំនួនថ្ងៃធ្វេីការ',                              trigger: 'blur'   }],
    daily_rate:     [{ required: true, message: 'បំពេញប្រាក់ជួលក្នុងមួយថ្ងៃ',                         trigger: 'blur'   }],
    effective_date: [{ required: true, message: 'បំពេញថ្ងៃមានប្រសិទ្ធភាព',                            trigger: 'blur'   }],
    currency_id:    [{ required: true, message: 'ជ្រេីសរេីសរូបិយប័ណ្ណដែលប្រេីសម្រាប់បេីកប្រាក់ខែ',  trigger: 'change' }]
}
</script>

<template>
  <!-- ✅ Dialog wrapper was entirely missing -->
  <el-dialog v-model="visible" title="កែប្រែប្រាក់ខែ" width="600px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">

      <el-divider content-position="left">
        <div class="logo">ព័ត៌មានប្រាក់ខែ</div>
      </el-divider>
      <el-form-item label="រូបិយប័ណ្ណ" prop="currency_id">
        <el-select v-model="formData.currency_id" placeholder="ជ្រើសរើសរូបិយប័ណ្ណ" style="width:100%" size="large">
          <!-- ✅ Fixed: was `currencys` (undefined), correct ref name is `currency` -->
          <el-option
            v-for="cur in currency"
            :key="cur.id"
            :label="cur.name"
            :value="cur.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="ប្រាក់ខែគោល" prop="base_salary">
            <el-input-number v-model="formData.base_salary" :min="0" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="ថ្ងៃធ្វើការ" prop="work_day">
            <el-input-number v-model="formData.work_day" :min="1" :max="31" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="ថ្លៃជួលក្នុងមួយថ្ងៃ" prop="daily_rate">
            <el-input-number v-model="formData.daily_rate" :min="0" style="width:100%" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="ថ្ងៃមានប្រសិទ្ធភាព" prop="effective_date">
        <el-date-picker
          v-model="formData.effective_date"
          type="date"
          value-format="YYYY-MM-DD"
          style="width:100%"
          size="large"
        />
      </el-form-item>



    </el-form>

    <template #footer>
      <el-button @click="visible = false">បោះបង់</el-button>
      <el-button type="primary" :loading="submitting" @click="submitUpdate">
        រក្សាទុក
      </el-button>
    </template>
  </el-dialog>
</template>