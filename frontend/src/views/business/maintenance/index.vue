<template>
  <div class="maintenance-list">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { maintenanceApi } from '@/api/business/maintenance'

const loading = ref(false)
const dataList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})

const getList = async () => {
  loading.value = true
  try {
    const res = await maintenanceApi.page(queryParams)
    dataList.value = res.rows
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>