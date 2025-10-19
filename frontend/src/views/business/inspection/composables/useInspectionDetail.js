/**
 * 巡检详情页 Composable
 * 封装详情页的数据加载、状态管理和业务逻辑
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getInspection, getInspectionHistory, deleteInspection } from '@/api/business/inspection'
import { debounce } from '@/utils/business/inspectionPerformance'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useInspectionDetail() {
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  // 数据状态
  const form = ref({})
  const formItems = ref({ floor1: {}, floor2: {}, floor3: {}, floor4: {} })
  const history = ref([])

  // 加载状态
  const loading = ref(false)
  const historyLoading = ref(false)

  // 过滤条件
  const historyType = ref('all')

  /**
   * 加载巡检详情
   */
  async function loadInspectionDetail(inspectionId) {
    if (!inspectionId) {
      ElMessage.error(t('business.inspection.message.invalidInspectionId'))
      router.back()
      return
    }

    loading.value = true
    try {
      const res = await getInspection(inspectionId)
      const data = res?.data || res
      form.value = data || {}

      // 解析 items JSON
      if (data.items) {
        if (typeof data.items === 'string') {
          try {
            formItems.value = JSON.parse(data.items)
          } catch {
            formItems.value = { floor1: {}, floor2: {}, floor3: {}, floor4: {} }
          }
        } else if (typeof data.items === 'object') {
          formItems.value = data.items
        }
      }
    } catch (error) {
      console.error('Failed to load inspection detail:', error)
      ElMessage.error(t('business.inspection.message.loadFailed'))
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载操作历史（防抖优化）
   */
  const loadHistory = debounce(async (inspectionId) => {
    if (!inspectionId) return

    historyLoading.value = true
    try {
      const res = await getInspectionHistory(inspectionId, { type: historyType.value })
      history.value = res.data || []
    } catch (error) {
      console.error('Failed to load history:', error)
      ElMessage.error(t('business.inspection.message.historyLoadFailed'))
    } finally {
      historyLoading.value = false
    }
  }, 300)

  /**
   * 监听历史类型变化
   */
  watch(historyType, () => {
    const inspectionId = route.params.inspectionId || route.params.id
    if (inspectionId) {
      loadHistory(inspectionId)
    }
  })

  /**
   * 删除巡检
   */
  async function handleDelete(inspectionId) {
    try {
      await ElMessageBox.confirm(
        t('business.inspection.message.confirmDelete', { id: inspectionId }),
        t('common.prompt'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      await deleteInspection(inspectionId)
      ElMessage.success(t('business.inspection.message.deleteSuccess'))
      router.push('/business/inspection')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Delete failed:', error)
      }
    }
  }

  /**
   * 返回列表
   */
  function handleBack() {
    router.back()
  }

  /**
   * 编辑巡检
   */
  function handleEdit(inspectionId) {
    router.push(`/business/inspection/edit/${inspectionId}`)
  }

  /**
   * 复制巡检
   */
  function handleCopy(inspectionId) {
    router.push(`/business/inspection/create?copy=${inspectionId}`)
  }

  /**
   * 计算照片数组
   */
  const photos = computed(() => {
    if (!form.value.photos) return []
    if (Array.isArray(form.value.photos)) return form.value.photos
    try {
      return JSON.parse(form.value.photos)
    } catch {
      return []
    }
  })

  /**
   * 计算异常项数组
   */
  const anomalyItems = computed(() => {
    if (!form.value.anomalies || !Array.isArray(form.value.anomalies)) {
      return []
    }
    return form.value.anomalies
  })

  /**
   * 获取操作类型标签样式
   */
  function getActionTagType(action) {
    const map = {
      'create': 'success',
      'update': 'primary',
      'copy': 'info',
      'generate_ticket': 'warning',
      'delete': 'danger'
    }
    return map[action] || ''
  }

  /**
   * 获取操作类型文本
   */
  function getActionText(action) {
    return t(`business.inspection.history.${action}`) || action
  }

  /**
   * 获取时间线类型
   */
  function getTimelineType(action) {
    const map = {
      'create': 'success',
      'update': 'primary',
      'copy': 'info',
      'generate_ticket': 'warning',
      'delete': 'danger'
    }
    return map[action] || 'primary'
  }

  return {
    // 数据
    form,
    formItems,
    history,
    photos,
    anomalyItems,

    // 状态
    loading,
    historyLoading,
    historyType,

    // 方法
    loadInspectionDetail,
    loadHistory,
    handleDelete,
    handleBack,
    handleEdit,
    handleCopy,
    getActionTagType,
    getActionText,
    getTimelineType
  }
}
