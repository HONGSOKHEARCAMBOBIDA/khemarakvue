<script setup>
import { ref,reactive,watch,computed } from 'vue';
import { ElMessage } from 'element-plus';
import { updateWorkExperience } from '../services/employee';
const props = defineProps({
    modelValue: Boolean,
    workexperience: Object
})
const emit = defineEmits(['update:modelValue','updated'])
const visible = computed({
    get: () =>props.modelValue,
    set: (v) =>emit('update:modelValue',v)
})
const formRef = ref(null)
const submitting = ref(false)
const formData = reactive({
    company_name: '',
    position_title: '',
    start_date: '',
    end_date: '',
    job_description
})
const submitUpdate = async () => {
    if(!formRef.value) return
    await formRef.value.validate(async (valid)=>{
        if(!valid){
            ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
            return
        }
        try{

        }catch(e){
            ElMessage
        }
    })
}
</script>