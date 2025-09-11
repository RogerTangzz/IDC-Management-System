<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span
          v-if="(item.elTagType == 'default' || item.elTagType == '') && (item.elTagClass == '' || item.elTagClass == null)"
          :key="item.value" :index="index" :class="item.elTagClass">{{ item.label + " " }}</span>
        <el-tag v-else :disable-transitions="true" :key="item.value + ''" :index="index" :type="item.elTagType"
          :class="item.elTagClass">{{ item.label + " " }}</el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchDisplay }}
    </template>
  </div>
</template>

<script setup>
// 记录未匹配的项
const unmatchArray = ref([])

const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: null,
  },
  // 当前的值
  value: [Number, String, Array],
  // 当未找到匹配的数据时，显示value
  showValue: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: ",",
  }
})

const values = computed(() => {
  if (props.value === null || typeof props.value === 'undefined' || props.value === '') return []
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator)
})

// 监听 props / values 变化更新未匹配数组，避免在 computed 内产生副作用
const unmatch = ref(false)
watch([values, () => props.options], () => {
  unmatchArray.value = []
  unmatch.value = false
  if (props.value === null || typeof props.value === 'undefined' || props.value === '' || !Array.isArray(props.options) || props.options.length === 0) return
  values.value.forEach(item => {
    if (!props.options.some(v => v.value === item)) {
      unmatchArray.value.push(item)
      unmatch.value = true
    }
  })
}, { immediate: true })

const unmatchDisplay = computed(() => handleArray(unmatchArray.value))

function handleArray(array) {
  if (array.length === 0) return ""
  return array.reduce((pre, cur) => {
    return pre + " " + cur
  })
}
</script>

<style scoped>
.el-tag+.el-tag {
  margin-left: 10px;
}
</style>
