<template>
  <div class="detail-skeleton">
    <!-- 头部操作栏骨架 -->
    <el-card class="header-card mb20">
      <div class="header-skeleton">
        <el-skeleton :rows="1" animated />
      </div>
    </el-card>

    <!-- 基本信息骨架 -->
    <el-card class="mb20">
      <template #header>
        <el-skeleton-item variant="text" style="width: 100px" />
      </template>
      <el-skeleton :rows="3" animated />
    </el-card>

    <!-- 楼层 Tab 骨架 -->
    <el-card class="mb20">
      <template #header>
        <el-skeleton-item variant="text" style="width: 120px" />
      </template>
      <div class="tabs-skeleton">
        <el-skeleton-item variant="text" style="width: 80px; margin-bottom: 16px" />
        <el-skeleton :rows="5" animated />
      </div>
    </el-card>

    <!-- 照片骨架 -->
    <el-card class="mb20">
      <template #header>
        <el-skeleton-item variant="text" style="width: 100px" />
      </template>
      <div class="photos-skeleton">
        <el-skeleton-item
          v-for="i in 3"
          :key="i"
          variant="image"
          style="width: 150px; height: 150px; margin-right: 10px"
        />
      </div>
    </el-card>

    <!-- 操作历史骨架 -->
    <el-card>
      <template #header>
        <el-skeleton-item variant="text" style="width: 100px" />
      </template>
      <el-skeleton :rows="4" animated />
    </el-card>
  </div>
</template>

<script setup name="DetailSkeleton">
// 纯展示组件，无需逻辑
</script>

<style lang="scss" scoped>
.detail-skeleton {
  .header-skeleton {
    height: 40px;
  }

  .tabs-skeleton {
    padding: 16px 0;
  }

  .photos-skeleton {
    display: flex;
    align-items: center;
    padding: 16px 0;
  }

  .mb20 {
    margin-bottom: 20px;
  }
}
</style>
