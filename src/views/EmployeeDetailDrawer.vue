<!-- EmployeeDetailDrawer.vue -->
<template>
  <el-drawer
    v-model="visible"
    size="90%"
    direction="ltr"
    :title="employee?.employees?.[0]?.name_kh || '—'"
    destroy-on-close
  >
    <div style="display: flex; height: 100%; gap: 0">
      <!-- Sidebar nav -->
      <div class="detail-sidebar">
        <el-avatar
          :size="140"
          style="
            background: #cecbf6;
            color: #3c3489;
            font-weight: 500;
            cursor: pointer;
          "
        >
          <el-image
            v-if="profileImage"
            :src="profileImage"
            :preview-src-list="[profileImage]"
            preview-teleported
            alt="employee avatar"
            style="width: 100%; height: 100%; object-fit: cover"
            @error="handleImageError"
          >
          </el-image>
        </el-avatar>
        <p class="emp-name">{{ employee?.employees?.[0]?.name_kh }}</p>
        <el-text >{{ employee?.employees?.[0]?.position_name }}</el-text>
        <el-divider />
        <el-menu :default-active="activeTab" @select="activeTab = $event">
          <el-menu-item index="personal">ព័ត៌មានផ្ទាល់ខ្លួន</el-menu-item>
          <el-menu-item index="education">ការសិក្សា</el-menu-item>
          <el-menu-item index="experience">បទពិសោធន៍</el-menu-item>
          <el-menu-item index="salary">ប្រាក់ខែ</el-menu-item>
          <el-menu-item index="shift">វេនការងារ</el-menu-item>
          <el-menu-item index="system">ព័ត៌មានប្រេីប្រាស់ប្រព័ន្ធ</el-menu-item>
        </el-menu>
      </div>

      <!-- Main content -->
      <div class="detail-content">
        <!-- Personal -->
        <template v-if="activeTab === 'personal'">
         <div class="pb-4">
             <el-tag type="primary" size="large">ព័ត៌មានទូទៅ</el-tag>
         </div>
      
          <el-descriptions :column="2" border size="large">
            <el-descriptions-item label="ឈ្មោះខ្មែរ" >
                <el-text type="">
            {{
              emp?.name_kh
            }}
                </el-text>
            </el-descriptions-item>
            <el-descriptions-item label="ឈ្មោះឡាតាំង">
            {{
              emp?.name_en
            }}
            </el-descriptions-item>
            <el-descriptions-item label="ភេទ">
              <el-tag
                :type="emp?.gender === 1 ? 'primary' : 'danger'"
                size="small"
              >
                {{ emp?.gender === 1 ? "ប្រុស" : "ស្រី" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="ថ្ងៃ-ខែ-ឆ្នាំកំណើត">
            {{
              profile?.dob
            }}</el-descriptions-item>
            <el-descriptions-item label="អត្តសញ្ញាណប័ណ្ណ">
            {{
              emp?.national_id_number
            }}</el-descriptions-item>
            <el-descriptions-item label="ស្ថានភាព">
              <el-tag type="success" size="large">{{ profile?.material_status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="តួនាទី">{{
              emp?.position_name
            }}</el-descriptions-item>
            <el-descriptions-item label="កម្រិតតួនាទី">
            {{
              profile?.position_level_name
            }}</el-descriptions-item>
            <el-descriptions-item label="ប្រភេទបុគ្គលិក">
            {{
              emp?.employee_type_name
            }}</el-descriptions-item>
            <el-descriptions-item label="ការិយាល័យ">
            {{
              emp?.office_name
            }}</el-descriptions-item>
            <el-descriptions-item label="ថ្ងៃចូលធ្វើការ">
            {{
              emp?.hire_date
            }}</el-descriptions-item>
            <el-descriptions-item label="ថ្ងៃត្រូវវាយតម្លៃ">
              <el-tag
                :type="emp?.is_promote ? 'success' : 'warning'"
                size="small"
              >
                {{ emp?.promote_date || "—" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="លេខទូរសព្ទ">
            {{
              employee?.contact
            }}</el-descriptions-item>
            <el-descriptions-item label="លេខទូរសព្ទគ្រួសារ">
            {{
              profile?.family_phone
            }}</el-descriptions-item>
            <el-descriptions-item label="ធនាគារ">{{
              profile?.bank_name
            }}</el-descriptions-item>
            <el-descriptions-item label="លេខកុងធនាគារ">{{
              profile?.bank_account_number
            }}</el-descriptions-item>
            <el-descriptions-item label="រាយការណ៍ជូន">{{
              profile?.report_to_name
            }}</el-descriptions-item>
            <el-descriptions-item label="ឈ្មោះប្ដី/ប្រពន្ធ">{{
              profile?.husban_name || profile?.wife_name
            }}</el-descriptions-item>
            <el-descriptions-item label="កូនប្រុស">
                {{ profile?.son_number ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="កូនស្រី">
                {{ profile?.daughter_number ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="ទីកន្លែងកំណើត" :span="2">
              {{
                [
                  profile?.village_name_birth,
                  profile?.communce_name_birth,
                  profile?.district_name_birth,
                  profile?.province_name_birth,
                ]
                  .filter(Boolean)
                  .join(" / ")
              }}
            </el-descriptions-item>
            <el-descriptions-item label="ទីកន្លែងបច្ចុប្បន្ន" :span="2">
              {{
                [
                  profile?.village_name_current,
                  profile?.communce_name_current,
                  profile?.district_name_current,
                  profile?.province_name_current,
                ]
                  .filter(Boolean)
                  .join(" / ")
              }}
            </el-descriptions-item>
          </el-descriptions>
          <el-image
  v-if="profile.qr_code_bank_account"
  :src="`http://localhost:8080/qrcodeimage/${profile.qr_code_bank_account}`"
  :preview-src-list="[ `http://localhost:8080/qrcodeimage/${profile.qr_code_bank_account}` ]"
  preview-teleported
  alt="qr image"
  style="width: 15%; height: 40%; object-fit: cover"
  @error="handleImageError"
>
</el-image>
        </template>

        <!-- Education -->
        <template v-else-if="activeTab === 'education'">
    <div class="pb-4">
             <el-tag type="primary" size="large">កម្រិតការសិក្សា</el-tag>
         </div>
          
          <el-timeline>
            <el-timeline-item
              v-for="edu in employee?.employeeeducation"
              :key="edu.id"
              :timestamp="`${edu.start_date} → ${edu.end_date}`"
              placement="top"
            >
              <el-card
                shadow="hover"
                style="border: 0.5px solid var(--el-border-color)"
              >
<div class="pb-2">
                  <el-tag type="success" size="large">
               កម្រិតការសិក្សា : {{ edu.education_level_name }}
              </el-tag>
</div>
<div class="pb-2">
                  <el-tag type="primary" size="large">
                ជំនាញ : {{ edu.major_field_of_study }}
              </el-tag>
</div>               
      <div class="pb-2">
                  <el-tag type="warning" size="large">
                ពិពណ៌នា : {{ edu.note }}
              </el-tag>
</div>  
<el-image
  v-if="edu.image"
  :src="`http://localhost:8080/educationimage/${edu.image}`"
  :preview-src-list="[ `http://localhost:8080/educationimage/${edu.image}` ]"
  preview-teleported
  alt="edu image"
  style="width: 30%; height: 30%; object-fit: cover"
  @error="handleImageError"
>
</el-image>

            
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </template>

        <!-- Experience -->
        <template v-else-if="activeTab === 'experience'">
               <div class="pb-4">
             <el-tag type="primary" size="large">បទពិសោធន៍ការងារ</el-tag>
         </div>
  
          <el-timeline>
            <el-timeline-item
              v-for="exp in employee?.employeeworkexperiences"
              :key="exp.id"
              :timestamp="`${exp.start_date} → ${exp.end_date}`"
              placement="top"
            >
              <el-card
  shadow="hover"
  style="border: 0.5px solid var(--el-border-color)"
>
  <div style=" flex-direction: column; gap: 8px">
    
<div class="pb-2">
        <el-tag type="primary" size="large">
     តួនាទី : {{ exp.position_title }}
    </el-tag>

</div>

<div class="pb-2">
    <el-tag type="success" size="large">
     ឈ្មោះក្រុមហ៊ុន : {{ exp.company_name }}
    </el-tag>
</div>

 <div class="pb-2">
    <el-tag>ការទទួលខុសត្រូវ :  {{ exp.job_description }}</el-tag>

 </div>

  </div>
</el-card>
            </el-timeline-item>
          </el-timeline>
        </template>

        <!-- Salary -->
        <template v-else-if="activeTab === 'salary'">
             <div class="pb-4">
             <el-tag type="primary" size="large">ព័ត៌មានប្រាក់ខែ</el-tag>
         </div>
          
          <div v-for="sal in employee?.salarys" :key="sal.id">
            <el-descriptions :column="2" border size="large">
              <el-descriptions-item label="ប្រាក់ខែមូលដ្ឋាន" :span="2">
                <span
                  style="
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                  {{ sal.base_salary }} {{ sal.currency_name }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="ចំនួនថ្ងៃធ្វើការ"
                >{{ sal.work_day }} ថ្ងៃ</el-descriptions-item
              >
              <el-descriptions-item label="ប្រាក់ជួលក្នុងមួយថ្ងៃ"
                >{{ sal.daily_rate }} {{ sal.currency_name}}
                </el-descriptions-item
              >
              <el-descriptions-item label="មានប្រសិទ្ធភាព">{{
                sal.effective_date
              }}</el-descriptions-item>
            <el-descriptions-item label="អស់ប្រសិទ្ធភាព">{{
                sal.expire_date
              }}</el-descriptions-item>
              <el-descriptions-item label="ស្ថានភាព">
                <el-tag :type="sal.is_active ? 'success' : 'info'" size="large">
                  {{ sal.is_active ? "សកម្ម" : "អសកម្ម" }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>

        <!-- Shift -->
        <template v-else-if="activeTab === 'shift'">
            <div class="pb-4">
             <el-tag type="primary" size="large">វេនការងារប្រចាំសប្ដាហ៍</el-tag>
         </div>
          
          <div class="shift-week">
            <div
              v-for="day in employee?.shift_patterns"
              :key="day.id"
              :class="['shift-card', day.is_dayoff ? 'dayoff' : 'workday']"
            >
                 <el-text
  :tag="day.is_dayoff ? 'del' : 'b'"
  :type="day.is_dayoff ? 'danger' : 'primary'"
  size="large"
>
  {{ day.day_of_week_name }}
</el-text>
            
              <template v-if="!day.is_dayoff">
                <p
                  v-for="session in day.shift_response?.[0]
                    ?.shiftsessionresponse"
                  :key="session.id"
                  class="time-slot"
                >
                  {{ session.start_time.slice(0, 5) }}–{{
                    session.end_time.slice(0, 5)
                  }}
                </p>
              </template>
             
              <p v-else class="off-label">សម្រាក</p>
            </div>
          </div>
        </template>

                <template v-else-if="activeTab === 'system'">
             <div class="pb-4">
             <el-tag type="primary" size="large">ព័ត៌មានប្រេីប្រាស់ប្រព័ន្ធ</el-tag>
         </div>
          
          <div >
            <el-descriptions :column="2" border size="large">
              <el-descriptions-item label="ឈ្មោះចូលប្រព័ន្ធ" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.username }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="លេខទូរសព្ទ" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.contact }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="ស្ថិតក្នុងសាខា" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.branch_name }}
                </span>
              </el-descriptions-item>
                            <el-descriptions-item label="តួនាទីប្រេីប្រព័ន្ធ" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.role_display_name }}({{ employee?.role_name }})
                </span>
              </el-descriptions-item>
                                         <el-descriptions-item label="ស្ថានភាព" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.user_active ? "កំពុងប្រេី" : "បានបិទ"}}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="សិទ្ធមេីលសាខា" :span="2">
                <span
                  style="
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--el-color-primary);
                  "
                >
                 {{ employee?.manage_branch_name}}
                </span>
              </el-descriptions-item>
<!-- Parts -->
<el-descriptions-item label="សិទ្ធមើលប្រព័ន្ធ" :span="2">
  <el-space wrap>
    <el-tag
      v-for="p in employee?.parts || []"
      :key="p.id"
      type="primary"
      size="large"
    >
      {{ p.part_display_name }} ({{ p.part_name }})
    </el-tag>
  </el-space>
</el-descriptions-item>

<!-- Branches -->
<el-descriptions-item label="សាខាដែលអាចមើលបាន" :span="2">
  <el-space wrap>
    <el-tag
      v-for="b in employee?.branches || []"
      :key="b.id"
      type="success"
      size="large"
    >
      {{ b.branch_name }}
    </el-tag>
  </el-space>
</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import api from "../services/api";
// defineProps → receive data from parent component
// defineEmits → send events back to parent
const props = defineProps({ employee: Object, modelValue: Boolean });
// Props (data coming from parent)
// employee Object containing employee data (probably from API)
// modelValue Boolean used for dialog open/close state
const emit = defineEmits(["update:modelValue"]);
// Emits (send data back to parent)
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
// Two-way binding for modal (visible)
// get → reads modelValue from parent
// set → sends update back to parent

const activeTab = ref("personal");
// Stores which tab is active
// Default is "personal"
const emp = computed(() => props.employee?.employees?.[0]);
const profile = computed(() => props.employee?.employeeprofies?.[0]);


const profileImage = computed(() => {
  const imageFile = profile.value?.profile_image;
  if (!imageFile) return null;
  return `http://localhost:8080/profileimage/${imageFile}`;
});



</script>

<style scoped>
.detail-sidebar {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-right: 1px solid var(--el-border-color);
  text-align: center;
}
.emp-name {
  font-weight: 500;
  font-size: 15px;
  margin-top: 8px;
}
.emp-pos {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.section-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}
.shift-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.shift-card {
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;
}
.shift-card.workday {
  background: var(--el-color-primary-light-5);
}
.shift-card.dayoff {
  background: var(--el-fill-color);
}
.day-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}
.time-slot {
  font-size: 12px;
  line-height: 1.6;
}
.off-label {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  font-weight: 500;
}
</style>
