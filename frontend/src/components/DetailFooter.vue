<template>
  <div class="detail-footer">
    <div class="detail-footer-left">
      <slot name="left"></slot>
    </div>
    <div class="detail-footer-center">
      <slot name="center"></slot>
    </div>
    <div class="detail-footer-right">
      <slot name="right">
        <el-button v-if="canEdit" type="primary" icon="Edit" @click="handleEdit">
          {{ $t('action.edit') }}
        </el-button>
        <el-button v-if="canPrint" type="info" icon="Printer" @click="handlePrint">
          {{ $t('action.print') }}
        </el-button>
        <el-button v-if="canBack" icon="Back" @click="handleBack">
          {{ $t('action.back') }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup name="DetailFooter">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
defineProps({
  canEdit: {
    type: Boolean,
    default: false
  },
  canPrint: {
    type: Boolean,
    default: false
  },
  canBack: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['edit', 'print', 'back'])

// Methods
function handleEdit() {
  emit('edit')
}

function handlePrint() {
  emit('print')
}

function handleBack() {
  emit('back')
}
</script>

<style lang="scss" scoped>
.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;

  .detail-footer-left {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .detail-footer-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .detail-footer-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
}

@media print {
  .detail-footer {
    display: none;
  }
}
</style>
