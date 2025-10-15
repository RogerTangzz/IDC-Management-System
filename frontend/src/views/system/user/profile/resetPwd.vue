<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item :label="t('system.user.profile.oldPassword')" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="t('system.user.profile.placeholder.oldPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="t('system.user.profile.newPassword')" prop="newPassword">
      <el-input v-model="user.newPassword" :placeholder="t('system.user.profile.placeholder.newPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="t('system.user.profile.confirmPassword')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" :placeholder="t('system.user.profile.placeholder.confirmPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">{{ t('system.common.submit') }}</el-button>
      <el-button type="danger" @click="close">{{ t('system.common.close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { updateUserPwd } from "@/api/system/user"

const { t } = useI18n()
const { proxy } = getCurrentInstance()

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error(t('system.user.profile.validation.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = ref({
  oldPassword: [{ required: true, message: t('system.user.profile.validation.oldPasswordRequired'), trigger: "blur" }],
  newPassword: [
    { required: true, message: t('system.user.profile.validation.newPasswordRequired'), trigger: "blur" },
    { min: 6, max: 20, message: t('system.user.profile.validation.newPasswordLength'), trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: t('system.user.profile.validation.newPasswordIllegal'), trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: t('system.user.profile.validation.confirmPasswordRequired'), trigger: "blur" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(_response => {
        proxy.$modal.msgSuccess(t('system.user.profile.message.updateSuccess'))
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
