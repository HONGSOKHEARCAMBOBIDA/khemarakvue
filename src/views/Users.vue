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

      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="200px"
        label-position="right"
      >
        <!-- Profile Image -->
        <el-form-item label="រូបភាព" required>
          <el-upload
            class="avatar-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleProfileFileChange"
          >
            <img v-if="profileImageUrl" :src="profileImageUrl" class="avatar" />
            <el-button v-else type="primary" plain>ជ្រេីសរេីសរូបភាព<el-icon class="el-icon--right"><Upload /></el-icon></el-button>
          </el-upload>
        </el-form-item>

        <!-- Basic Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានមូលដ្ឋាន</div>
        </el-divider>

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
              <el-select v-model="formData.gender" placeholder="ជ្រើសរើសភេទ" style="width:100%" size="large">
                <el-option label="ប្រុស" :value="1" />
                <el-option label="ស្រី" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="ថ្ងៃខែឆ្នាំកំណើត" prop="dob">
              <el-date-picker
                v-model="formData.dob"
                type="date"
                placeholder="ជ្រើសរើស"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:100%"
                size="large"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ស្ថានភាពអាពាហ៍ពិពាហ៍" prop="material_status">
              <el-select v-model="formData.material_status" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option label="នៅលីវ" value="នៅលីវ" />
                <el-option label="រៀបការ" value="រៀបការ" />
                <el-option label="លែងលះ" value="លែងលះ" />
                <el-option label="មេម៉ាយ" value="មេម៉ាយ" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Birth Address -->
        <el-row :gutter="20" class="spaced-row" prop="village_id_of_birth">
          <el-form-item label="ទីកន្លែងកំណេីត" style="margin-bottom:8px" />
          <el-col :span="5">
            <el-select v-model="formData.province_id" placeholder="ជ្រើសរើសខេត្ត" style="width:100%" size="large" clearable>
              <el-option v-for="p in provinces" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.district_id" placeholder="ជ្រើសរើសស្រុក" style="width:100%" size="large" clearable>
              <el-option v-for="d in districts" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.communce_id" placeholder="ជ្រើសរើសឃុំ" style="width:100%" size="large" clearable>
              <el-option v-for="c in communces" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.village_id_of_birth" placeholder="ជ្រើសរើសភូមិ" style="width:100%" size="large" clearable>
              <el-option v-for="v in villages" :key="v.id" :label="v.name" :value="v.id" />
            </el-select>
          </el-col>
        </el-row>

        <!-- Current Address -->
        <el-row :gutter="10" class="spaced-row" >
          <el-form-item label="ទីកន្លែងបច្ចុប្បន្ន" style="margin-bottom:8px"/>
          <el-col :span="5">
            <el-select v-model="formData.province_id_currenct" placeholder="ជ្រើសរើសខេត្ត" style="width:100%" size="large" clearable>
              <el-option v-for="p in provinces" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.district_id_currenct" placeholder="ជ្រើសរើសស្រុក" style="width:100%" size="large" clearable>
              <!-- FIX: use districtscurrent, not districts -->
              <el-option v-for="d in districtscurrent" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.communce_id_currenct" placeholder="ជ្រើសរើសឃុំ" style="width:100%" size="large" clearable>
              <!-- FIX: use communcescurrent, not communces -->
              <el-option v-for="c in communcescurrent" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="formData.village_id_current_address" placeholder="ជ្រើសរើសភូមិ" style="width:100%" size="large" clearable  prop="village_id_current_address">
              <!-- FIX: use villagescurrent, not villages -->
              <el-option v-for="v in villagescurrent" :key="v.id" :label="v.name" :value="v.id" />
            </el-select>
          </el-col>
        </el-row>

        <!-- Employment Information -->
        <el-divider content-position="left">
          <div class="logo">ព័ត៌មានការងារ</div>
        </el-divider>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="នាយកដ្ឋាន" prop="department_id">
              <el-select v-model="formData.department_id" placeholder="ជ្រើសរើសនាយកដ្ឋាន" style="width:100%" size="large">
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

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="បម្រេីការងារក្នុងសាខា" prop="branch_id">
              <el-select v-model="formData.branch_id" placeholder="ជ្រើសរើសសាខា" style="width:100%" size="large">
                <el-option v-for="branch in branches" :key="branch.id" :label="branch.name" :value="branch.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="កម្រិតតួនាទី" prop="position_level_id">
              <el-select v-model="formData.position_level_id" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option v-for="posl in positionlevel" :key="posl.id" :label="posl.display_name" :value="posl.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="ប្រភេទបុគ្គលិក" prop="employee_type_id">
              <el-select v-model="formData.employee_type_id" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option v-for="empt in employeetypes" :key="empt.id" :label="empt.name" :value="empt.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ការិយាល័យ" prop="office_id">
              <el-select v-model="formData.office_id" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option v-for="office in offices" :key="office.id" :label="office.name" :value="office.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="spaced-row">
          <el-col :span="12">
            <el-form-item label="កាលបរិច្ឆេទចូលធ្វើការ" prop="hire_date">
              <el-date-picker
                v-model="formData.hire_date"
                type="date"
                placeholder="ជ្រើសរើស"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:100%"
                size="large"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="កាលបរិច្ឆេទវាយតម្លៃការងារ" prop="promote_date">
              <el-date-picker
                v-model="formData.promote_date"
                type="date"
                placeholder="ជ្រើសរើស"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:100%"
                size="large"
              />
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

        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="ឈ្មោះធនាគារ" prop="bank_name">
              <el-input v-model="formData.bank_name" placeholder="បញ្ចូលឈ្មោះធនាគារ" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="លេខគណនីធនាគារ" prop="bank_account_number">
              <el-input v-model="formData.bank_account_number" placeholder="បញ្ចូលលេខគណនី" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="QR Code">
              <el-upload
                class="avatar-uploader"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleQrCodeFileChange"
              >
                <img v-if="qrcodeimageUrl" :src="qrcodeimageUrl" class="avatar" />
                <el-button v-else type="primary" plain>ជ្រេីសរេីសរូបភាព QR Code</el-button>
              </el-upload>
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
              <el-select v-model="formData.currency_id" placeholder="ជ្រើសរើសរូបិយប័ណ្ណ" style="width:100%" size="large">
                <el-option v-for="currency in currencys" :key="currency.id" :label="currency.name" :value="currency.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="វេនធ្វើការ" prop="shift_id">
              <el-select v-model="formData.shift_id" placeholder="ជ្រើសរើសវេន" style="width:100%" size="large">
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
              <el-input-number v-model="formData.base_salary" :min="0" style="width:100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ថ្ងៃធ្វើការ" prop="work_day">
              <el-input-number v-model="formData.work_day" :min="1" :max="31" style="width:100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- FIX: display computed dailyRate, it will be written to formData on submit -->
            <el-form-item label="ថ្លៃជួលក្នុងមួយថ្ងៃ">
             <el-input-number v-model="formData.daily_rate" :min="0" style="width:100%" size="large" />
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
              <el-input-number v-model="formData.son_number" :min="0" style="width:100%" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="ចំនួនកូនស្រី">
              <el-input-number v-model="formData.daughter_number" :min="0" style="width:100%" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Work Experience -->
        <el-divider content-position="left">
          <div class="logo">បទពិសោធន៍ការងារ</div>
        </el-divider>

        <div v-for="(exp, index) in workExperiences" :key="index" class="work-experience-item">
          <el-row :gutter="10">
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
                <el-date-picker v-model="formData.start_date[index]" type="date" placeholder="ចាប់ផ្តើម" format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="ថ្ងៃបញ្ចប់">
                <el-date-picker v-model="formData.end_date[index]" type="date" placeholder="បញ្ចប់" format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="ពិពណ៌នាការងារ">
                <el-input v-model="formData.job_description[index]" type="textarea" placeholder="ពិពណ៌នាការងារ" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-button v-if="index > 0" type="danger" size="small" @click="removeWorkExperience(index)">លុប</el-button>
        </div>
        <el-button type="primary" size="large" @click="addWorkExperience" plain>បន្ថែមបទពិសោធន៍</el-button>

        <!-- Education -->
        <el-divider content-position="left">
          <div class="logo">ការសិក្សា</div>
        </el-divider>

        <div v-for="(edu, index) in educations" :key="index" class="education-item">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="កម្រិតសិក្សា">
                <el-select v-model="formData.education_level_id[index]" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                  <el-option v-for="edl in educationlevels" :key="edl.id" :label="edl.name" :value="edl.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ជំនាញ">
                <el-input v-model="formData.major_field_of_study[index]" placeholder="ជំនាញ" size="large" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="ថ្ងៃចាប់ផ្តើម">
                <el-date-picker v-model="formData.start_date_eud[index]" type="date" placeholder="ចាប់ផ្តើម" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ថ្ងៃបញ្ចប់">
                <el-date-picker v-model="formData.end_date_eud[index]" type="date" placeholder="បញ្ចប់" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" size="large" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="ចំណាំ">
                <el-input v-model="formData.noteedu[index]" placeholder="ចំណាំ" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="12" class="flex items-right">
              <el-form-item label="រូបភាពដែលបានជ្រេីសរេីស">
              <el-upload
                class="avatar-uploader"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="(file) => handleEducationImageFileChange(file, index)"
              >
                <img v-if="educationimage[index]" :src="educationimage[index]" class="avataredu" />
 
                <el-button v-else type="primary" plain>ជ្រើសរើសរូបភាពសញ្ញាបត្រ<el-icon class="el-icon--right"><Upload /></el-icon></el-button>
              </el-upload>
              </el-form-item>

            </el-col>
          </el-row>
          <el-button v-if="index > 0" type="danger" size="small" @click="removeEducation(index)">លុប</el-button>
        </div>
        <el-button type="primary" size="large" @click="addEducation" plain>បន្ថែមការសិក្សា</el-button>

        <!-- Permissions -->
        <el-divider content-position="left">
          <div class="logo">សិទ្ធិ និងការអនុញ្ញាត</div>
        </el-divider>

        <el-row>
          <el-col :span="8">
            <el-form-item label="តួនាទីក្នុងប្រព័ន្ធ" prop="role_id">
              <el-select v-model="formData.role_id" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option v-for="role in roles" :key="role.id" :label="role.display_name" :value="role.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="សិទ្ធមេីលសាខា" prop="manage_branch">
              <el-select v-model="formData.manage_branch" placeholder="សិទ្ធមេីលសាខា" style="width:100%" size="large">
                <el-option v-for="mb in managebranchs" :key="mb.id" :label="mb.name" :value="mb.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="រាយការណ៍ទៅ" prop="report_to">
              <el-select v-model="formData.report_to" placeholder="ជ្រើសរើស" style="width:100%" size="large">
                <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="សិទ្ធក្នុងការមេីលទិន្ន័យ" prop="part_ids">
          <el-select v-model="formData.part_ids" multiple placeholder="ជ្រើសរើសផ្នែក" style="width:100%" size="large">
            <el-option v-for="part in parts" :key="part.id" :label="part.display_name" :value="part.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="សាខាដែលគ្រប់គ្រង" prop="branch_ids">
          <el-select v-model="formData.branch_ids" multiple placeholder="ជ្រើសរើសសាខា" style="width:100%" size="large">
            <el-option v-for="branch in branches" :key="branch.id" :label="branch.name" :value="branch.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="ថ្ងៃធ្វើការ / ឈប់សម្រាក" prop="day_of_weeks">
         
          <el-table :data="dayofweeks" style="width:100%"  :border="parentBorder">
            <el-table-column label="ថ្ងៃ" prop="name" />
            <el-table-column label="ជ្រើសរើស">
              
              <template #default="{ row }">
                <el-checkbox
                  :model-value="formData.day_of_weeks.includes(row.id)"
                  size="small" border
                  @change="(val) => toggleDayOfWeek(row.id, val)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="ថ្ងៃឈប់សម្រាក">
              <template #default="{ row }">
                <el-checkbox
                  :disabled="!formData.day_of_weeks.includes(row.id)"
                  :model-value="dayOffSet.has(row.id)"
                  size="small" border
                  @change="(val) => toggleDayOff(row.id, val)"
                />
              </template>
            </el-table-column>
          </el-table>
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
import { ElMessage } from 'element-plus'
import { registerAsFormData, getuser } from '../services/userservice'
import { fetchDepartment } from '../services/department'
import { fetchPosition } from '../services/position'
import { fetchPositionLevel } from '../services/positionlevel'
import { fetchEmployeetype } from '../services/employeetype'
import { fetchOffice } from '../services/office'
import { fetchCurrency } from '../services/currency'
import { fetchBranch } from '../services/branch'
import { fetchShift } from '../services/shift'
import { fetchShiftSession } from '../services/shiftsession'
import { fetchEducationLevel } from '../services/educationlevel'
import { fetchRole } from '../services/role'
import { fetchManageBranch } from '../services/managebranch'
import { fetchPart } from '../services/part'
import { fetchProvince } from '../services/province'
import { fetchDistrict } from '../services/district'
import { fetchCommunce } from '../services/communce'
import { fetchVillage } from '../services/village'
import { fetchDayofweek } from '../services/dayofweek'
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'

const parentBorder = ref(true)
const formRef       = ref(null)
const submitting    = ref(false)
const loading       = ref(false)

const departments   = ref([])
const positions     = ref([])
const positionlevel = ref([])
const employeetypes = ref([])
const offices       = ref([])
const currencys     = ref([])
const branches      = ref([])
const shifts        = ref([])
const shiftsessions = ref([])
const educationlevels = ref([])
const roles         = ref([])
const managebranchs = ref([])
const users         = ref([])
const parts         = ref([])
const dayofweeks    = ref([])

// ទីកន្លែងកំណេីត
const provinces  = ref([])
const districts  = ref([])
const communces  = ref([])
const villages   = ref([])

// ទីកន្លែងបច្ចុប្បន្ន
const districtscurrent = ref([])
const communcescurrent = ref([])
const villagescurrent  = ref([])

// Image previews
const profileImageUrl = ref('')
const qrcodeimageUrl  = ref('')
const educationimage  = ref([])

const dayOffSet = ref(new Set())

const workExperiences = ref([0])
const educations      = ref([0])

const formData = reactive({
  profile_image:            null,
  name_en:                  '',
  name_kh:                  '',
  national_id_number:       '',
  gender:                   null,
  position_id:              null,
  hire_date:                '',
  promote_date:             '',
  employee_type_id:         null,
  office_id:                null,
  contact:                  '',
  branch_id:                null,
  role_id:                  null,
  manage_branch:            null,
  position_level_id:        null,
  dob:                      '',
  material_status:          '',
  family_phone:             '',
  bank_name:                '',
  bank_account_number:      '',
  qr_code_bank_account:     null,
  note:                     '',
  report_to:                null,
  wife_name:                '',
  husban_name:              '',
  son_number:               0,
  daughter_number:          0,

  // Work experience arrays
  company_name:             [''],
  position_title:           [''],
  start_date:               [''],
  end_date:                 [''],
  job_description:          [''],

  // Education arrays
  education_level_id:       [null],
  major_field_of_study:     [''],
  start_date_eud:           [''],
  end_date_eud:             [''],
  noteedu:                  [''],
  education_image:          [null],

  // Permissions
  part_ids:                 [],
  branch_ids:               [],

  // Shift 
  day_of_weeks:             [],   
  is_day_of:                [],   
  shift_id:                 null,

  // Salary
  base_salary:              0,
  work_day:                 0,
  daily_rate:               0,
  currency_id:              null,

  // UI-only helpers (not sent to backend)
  department_id:            null,
  province_id:              null,
  district_id:              null,
  communce_id:              null,
  village_id_of_birth:      null,
  province_id_currenct:     null,
  district_id_currenct:     null,
  communce_id_currenct:     null,
  village_id_current_address: null,
})

// const dailyRate = computed({
//   get() {
//     if (!formData.work_day || formData.work_day === 0) return 0
//     return parseFloat((formData.base_salary / formData.work_day).toFixed(2))
//   },
//   set(val) {
//     formData.daily_rate = val
//   }
// })

function toggleDayOfWeek(dayId, checked) {
  if (checked) {
    if (!formData.day_of_weeks.includes(dayId)) {
      formData.day_of_weeks.push(dayId)
    }
  } else {
    const idx = formData.day_of_weeks.indexOf(dayId)
    // indexOf() → រកទីតាំង
    // splice() → លុប
    if (idx !== -1) formData.day_of_weeks.splice(idx, 1)
    dayOffSet.value.delete(dayId)
    dayOffSet.value = new Set(dayOffSet.value) 
    // បង្កើត Set ថ្មី ដើម្បីឲ្យ Vue update UI
  }
}

function toggleDayOff(dayId, checked) {
  if (checked) {
    dayOffSet.value.add(dayId)
  } else {
    dayOffSet.value.delete(dayId)
  }
  dayOffSet.value = new Set(dayOffSet.value) 
}

const handleProfileFileChange = (file) => {
  const raw = file.raw
  if (!raw) return
  profileImageUrl.value = URL.createObjectURL(raw)
  formData.profile_image = raw
}

const handleQrCodeFileChange = (file) => {
  const raw = file.raw
  if (!raw) return
  qrcodeimageUrl.value = URL.createObjectURL(raw)
  formData.qr_code_bank_account = raw
}

const handleEducationImageFileChange = (file, index) => {
  const raw = file.raw
  if (!raw) return
  educationimage.value[index] = URL.createObjectURL(raw)
  formData.education_image[index] = raw
}

const addWorkExperience = () => {
  workExperiences.value.push(workExperiences.value.length)
  formData.company_name.push('')
  formData.position_title.push('')
  formData.start_date.push('')
  formData.end_date.push('')
  formData.job_description.push('')
}

const removeWorkExperience = (index) => {
  workExperiences.value.splice(index, 1)
  formData.company_name.splice(index, 1)
  formData.position_title.splice(index, 1)
  formData.start_date.splice(index, 1)
  formData.end_date.splice(index, 1)
  formData.job_description.splice(index, 1)
}

const addEducation = () => {
  educations.value.push(educations.value.length)
  formData.education_image.push(null)
  formData.education_level_id.push(null)
  formData.major_field_of_study.push('')
  formData.start_date_eud.push('')
  formData.end_date_eud.push('')
  formData.noteedu.push('')
}

const removeEducation = (index) => {
  educations.value.splice(index, 1)
  formData.education_image.splice(index, 1)
  formData.education_level_id.splice(index, 1)
  formData.major_field_of_study.splice(index, 1)
  formData.start_date_eud.splice(index, 1)
  formData.end_date_eud.splice(index, 1)
  formData.noteedu.splice(index, 1)
}

function buildFormData() {
  const fd = new FormData()

  // Scalar fields
  const scalars = [
    'name_en', 'name_kh', 'national_id_number', 'hire_date', 'promote_date',
    'contact', 'material_status', 'family_phone', 'bank_name',
    'bank_account_number', 'note', 'wife_name', 'husban_name',
  ]
  scalars.forEach(k => {
    if (formData[k] !== null && formData[k] !== undefined && formData[k] !== '') {
      fd.append(k, formData[k])
    }
  })

  //​k គឺជា key មួយៗ

  // Numeric scalars (always send even if 0)
  const numerics = [
    ['gender',           formData.gender],
    ['position_id',      formData.position_id],
    ['employee_type_id', formData.employee_type_id],
    ['office_id',        formData.office_id],
    ['branch_id',        formData.branch_id],
    ['role_id',          formData.role_id],
    ['manage_branch',    formData.manage_branch],
    ['position_level_id',formData.position_level_id],
    ['village_id_of_birth',       formData.village_id_of_birth],
    ['village_id_current_address',formData.village_id_current_address],
    ['report_to',        formData.report_to],
    ['son_number',       formData.son_number],
    ['daughter_number',  formData.daughter_number],
    ['shift_id',         formData.shift_id],
    ['base_salary',      formData.base_salary],
    ['work_day',         formData.work_day],
    ['daily_rate',       dailyRate.value],
    ['currency_id',      formData.currency_id],
    ['dob',              formData.dob],
  ]
  numerics.forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, v)
  })

  // File fields
  if (formData.profile_image)        fd.append('profile_image',        formData.profile_image)
  if (formData.qr_code_bank_account) fd.append('qr_code_bank_account', formData.qr_code_bank_account)

  // Education images (index-aligned with education_level_id)
  formData.education_image.forEach((img) => {
    // Always append a slot so server indices line up; empty string for missing
    fd.append('education_image', img instanceof File ? img : '')
    // instanceof File វាជា check ថា object នោះ: ត្រូវបានបង្កើតពី File ឬអត់
  })

  // Work experience arrays 
const hasWorkExperience = formData.company_name.some(v => v && v.trim() !== '')
if (hasWorkExperience) {
  formData.company_name.forEach(v    => fd.append('company_name',    v ?? ''))
  formData.position_title.forEach(v  => fd.append('position_title',  v ?? ''))
  formData.start_date.forEach(v      => fd.append('start_date',      v ?? ''))
  formData.end_date.forEach(v        => fd.append('end_date',        v ?? ''))
  formData.job_description.forEach(v => fd.append('job_description', v ?? ''))
}

  // Education arrays 
  formData.education_level_id.forEach(v   => fd.append('education_level_id', v ?? 0))
  formData.major_field_of_study.forEach(v => fd.append('major_field_of_study', v ?? ''))
  formData.start_date_eud.forEach(v       => fd.append('start_date_eud',      v ?? ''))
  formData.end_date_eud.forEach(v         => fd.append('end_date_eud',        v ?? ''))
  formData.noteedu.forEach(v              => fd.append('noteedu',             v ?? ''))

  // Permissions 
  formData.part_ids.forEach(v   => fd.append('part_ids',   v))
  formData.branch_ids.forEach(v => fd.append('branch_ids', v))

  // FIX: day_of_weeks is []int, is_day_of is []bool, same length, same order
  formData.day_of_weeks.forEach(dayId => {
    fd.append('day_of_weeks', dayId)
    fd.append('is_day_of',    dayOffSet.value.has(dayId) ? 'true' : 'false')
  })

  return fd
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ!')
      return
    }

const hasWorkExp = formData.company_name.some(v => v && v.trim() !== '')
if (hasWorkExp) {
  const weLen = formData.company_name.length
  if (
    formData.position_title.length  !== weLen ||
    formData.start_date.length      !== weLen ||
    formData.end_date.length        !== weLen ||
    formData.job_description.length !== weLen
  ) {
    ElMessage.error('ទិន្នន័យបទពិសោធន៍ការងារមិនត្រូវគ្នា!')
    return
  }
}

    // Guard: shift schedule
    if (formData.day_of_weeks.length === 0) {
      ElMessage.error('សូមជ្រើសរើសថ្ងៃធ្វើការយ៉ាងតិចមួយ!')
      return
    }

    try {
      submitting.value = true
      const fd = buildFormData()

      // FIX: always call registerAsFormData (multipart) — backend needs files
      const response = await registerAsFormData(fd)

      if (response.status === 200 || response.status === 201) {
        ElMessage.success('បង្កើតអ្នកប្រើប្រាស់បានជោគជ័យ!')
        resetForm()
      } else {
        ElMessage.error('មានបញ្ហា៖ ' + (response.data?.message || 'សូមពិនិត្យម្តងទៀត'))
      }
    } catch (error) {
      ElMessage.error(
        'បង្កើតអ្នកប្រើប្រាស់មិនជោគជ័យ៖ ' +
        (error.response?.data?.message || error.message)
      )
    } finally {
      submitting.value = false
    }
  })
}

// ─── Reset ───────────────────────────────────────────────────────────────────
const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()

  // Reset scalars / arrays in formData
  Object.assign(formData, {
    profile_image: null, name_en: '', name_kh: '', national_id_number: '',
    gender: null, position_id: null, hire_date: '', promote_date: '',
    employee_type_id: null, office_id: null, contact: '', branch_id: null,
    role_id: null, manage_branch: null, position_level_id: null, dob: '',
    material_status: '', family_phone: '', bank_name: '', bank_account_number: '',
    qr_code_bank_account: null, note: '', report_to: null, wife_name: '',
    husban_name: '', son_number: 0, daughter_number: 0,
    company_name: [''], position_title: [''], start_date: [''], end_date: [''], job_description: [''],
    education_level_id: [null], major_field_of_study: [''], start_date_eud: [''],
    end_date_eud: [''], noteedu: [''], education_image: [null],
    part_ids: [], branch_ids: [], day_of_weeks: [], is_day_of: [], shift_id: null,
    base_salary: 0, work_day: 0, daily_rate: 0, currency_id: null,
    department_id: null,
    province_id: null, district_id: null, communce_id: null, village_id_of_birth: null,
    province_id_currenct: null, district_id_currenct: null, communce_id_currenct: null,
    village_id_current_address: null,
  })

  workExperiences.value = [0]
  educations.value      = [0]
  profileImageUrl.value = ''
  qrcodeimageUrl.value  = ''
  educationimage.value  = []
  dayOffSet.value       = new Set()

  districts.value  = []; communces.value  = []; villages.value  = []
  districtscurrent.value = []; communcescurrent.value = []; villagescurrent.value = []
  positions.value  = []
  users.value      = []; shifts.value = []; shiftsessions.value = []
}


async function load(fn, target) {
  loading.value = true
  try {
    const res = await fn()
    target.value = res.data.data
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

onMounted(async() => {
  load(fetchDepartment,    departments)
  load(fetchPositionLevel, positionlevel)
  load(fetchEmployeetype,  employeetypes)
  load(fetchOffice,        offices)
  load(fetchCurrency,      currencys)
  load(fetchBranch,        branches)
  load(fetchEducationLevel,educationlevels)
  load(fetchRole,          roles)
  load(fetchManageBranch,  managebranchs)
  load(fetchPart,          parts)
  load(fetchProvince,      provinces)

    loading.value = true
  try {
    const res = await fetchDayofweek()
    dayofweeks.value = res.data.data
    dayofweeks.value.forEach(day => {
      formData.day_of_weeks.push(day.id)
    })
  } catch (e) {
    ElMessage.error(e?.message || 'Load dayofweek failed')
  } finally {
    loading.value = false;
  }
})

// ─── Watchers ────────────────────────────────────────────────────────────────
watch(() => formData.department_id, async (v) => {
  positions.value = []
  if (!v) return
  try { positions.value = (await fetchPosition(v)).data.data } catch (e) { ElMessage.error('Load position failed') }
})

watch(() => formData.branch_id, async (v) => {
  users.value = []; shifts.value = []; shiftsessions.value = []
  formData.report_to = null; formData.shift_id = null
  if (!v) return
  try {
    shifts.value = (await fetchShift(v)).data.data
    users.value  = (await getuser(v)).data.data
  } catch (e) { ElMessage.error(e?.message || 'Load branch data failed') }
})

watch(() => formData.shift_id, async (v) => {
  shiftsessions.value = []
  if (!v) return
  try { shiftsessions.value = (await fetchShiftSession(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})

// Birth address cascade
watch(() => formData.province_id, async (v) => {
  districts.value = []; communces.value = []; villages.value = []
  formData.district_id = null; formData.communce_id = null; formData.village_id_of_birth = null
  if (!v) return
  try { districts.value = (await fetchDistrict(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})
watch(() => formData.district_id, async (v) => {
  communces.value = []; villages.value = []
  formData.communce_id = null; formData.village_id_of_birth = null
  if (!v) return
  try { communces.value = (await fetchCommunce(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})
watch(() => formData.communce_id, async (v) => {
  villages.value = []; formData.village_id_of_birth = null
  if (!v) return
  try { villages.value = (await fetchVillage(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})

// Current address cascade (FIX: uses separate ref lists)
watch(() => formData.province_id_currenct, async (v) => {
  districtscurrent.value = []; communcescurrent.value = []; villagescurrent.value = []
  formData.district_id_currenct = null; formData.communce_id_currenct = null; formData.village_id_current_address = null
  if (!v) return
  try { districtscurrent.value = (await fetchDistrict(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})
watch(() => formData.district_id_currenct, async (v) => {
  communcescurrent.value = []; villagescurrent.value = []
  formData.communce_id_currenct = null; formData.village_id_current_address = null
  if (!v) return
  try { communcescurrent.value = (await fetchCommunce(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})
watch(() => formData.communce_id_currenct, async (v) => {
  villagescurrent.value = []; formData.village_id_current_address = null
  if (!v) return
  try { villagescurrent.value = (await fetchVillage(v)).data.data } catch (e) { ElMessage.error(e?.message) }
})

// ─── Validation rules ────────────────────────────────────────────────────────
const formRules = {
  name_en:            [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាអង់គ្លេស',         trigger: 'blur' }],
  name_kh:            [{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាខ្មែរ',             trigger: 'blur' }],
  national_id_number: [{ required: true, message: 'សូមបញ្ចូលអត្តលេខ',                  trigger: 'blur' }],
  gender:             [{ required: true, message: 'សូមជ្រើសរើសភេទ',                    trigger: 'change' }],
  position_id:        [{ required: true, message: 'សូមជ្រើសរើសតួនាទី',                 trigger: 'change' }],
  employee_type_id:   [{ required: true, message: 'សូមជ្រើសរើសប្រភេទបុគ្គលិក',        trigger: 'change' }],
  office_id:          [{ required: true, message: 'សូមជ្រើសើសការិយាល័យ',               trigger: 'change' }],
  branch_id:          [{ required: true, message: 'សូមជ្រើសរើសសាខា',                   trigger: 'change' }],
  role_id:            [{ required: true, message: 'សូមជ្រើសរើសតួនាទីក្នុងប្រព័ន្ធ',  trigger: 'change' }],
  manage_branch:      [{ required: true, message: 'សូមបញ្ចូលចំនួនសាខាដែលគ្រប់គ្រង',  trigger: 'blur' }],
  bank_name:          [{ required: true, message: 'សូមបញ្ចូលឈ្មោះធនាគារ',              trigger: 'blur' }],
  bank_account_number:[{ required: true, message: 'សូមបញ្ចូលលេខគណនីធនាគារ',           trigger: 'blur' }],
  base_salary:        [{ required: true, message: 'សូមបញ្ចូលប្រាក់ខែគោល',             trigger: 'blur' }],
  work_day:           [{ required: true, message: 'សូមបញ្ចូលចំនួនថ្ងៃធ្វើការ',         trigger: 'blur' }],
  currency_id:        [{ required: true, message: 'សូមជ្រើសរើសរូបិយប័ណ្ណ',             trigger: 'change' }],
  dob: [{required: true,message: 'សូមជ្រេីសរេីសថ្ងៃខែឆ្នាំកំណេីត',trigger: 'change'}],
  material_status: [{required: true,message: 'សូមជ្រេីសរេីសស្ថានភាពអាពាហ៍ពិពាហ៍'}],
  village_id_of_birth: [{required: true,message:'សូមជ្រេីសរេីសភូមិកំណេីត'}],
  village_id_current_address: [{required: true,message:'សូមជ្រេីសរេីសភូមិបច្ចុប្បន្ន'}],
  position_level_id: [{required: true,message:'សូមជ្រេីសរេីសកម្រិតតួនាទី'}],
  hire_date: [{required: true,message:  'សូមជ្រេីសរេីសថ្ងៃចូលធ្វេីការ'}],
  promote_date: [{required: true,message: 'សូមជ្រេីសរេីសកាលបរិច្ឆេទវាយតម្លៃការងារ'}],
  contact: [{required: true,message: 'សូមបញ្ចូលលេខទូរស័ព្ទសាមីខ្លួន'}],
  family_phone: [{required: true,message: 'សូមបញ្ចូលលេខទូរស័ព្ទគ្រួសារ'}],
  shift_id: [{required: true,message: 'សូមជ្រេីសរេីសវេនធ្វើការ'}],
  report_to: [{required: true,message: 'សូមជ្រេីសរេីសអ្នកត្រូវរាយការណ៍'}],
  part_ids: [{required: true,message: 'សូមជ្រេីសរេីសសិទ្ធក្នុងការមេីលទិន្ន័យ'}]

}
</script>

<style scoped>
.spaced-row { margin-top: 15px; margin-bottom: 15px; }

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
  max-width: 1700px;
  margin: 0 auto;
  border: 1 solid;
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

.el-divider { margin: 20px 0; }

:deep(.el-form-item) { margin-bottom: 18px; }

.avatar {
  width: 200px;
  height: 270px;
  border: 1px solid;
}
.avataredu {
  width: 500px;
  height: 350px;
  border: 1px solid;
}
</style>