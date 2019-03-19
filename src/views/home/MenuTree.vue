<template>
  <div>
    <template v-for="value in this.menuData">
      <el-submenu :key="value.id" :index="value.id + ''" v-if="value.children && value.children.length > 0">
        <template slot="title">
          <svg-icon :icon-class="value.icon" class="icon-lagger"/>
          <span slot="title" class="title-lagger">{{value.name}}</span>
        </template>
        <MenuTree :menuData="value.children" @clickMenu="clickMenu"></MenuTree>
      </el-submenu>
      <el-menu-item :key="value.id" :index="value.id + ''" v-else @click="handleClick(value)">
        <svg-icon :icon-class="value.icon" class="icon-lagger"/>
        <span slot="title" class="title-lagger">{{value.name}}</span>
      </el-menu-item>
    </template>
  </div>
</template>

<script>
import '@/icons'

export default {
  props: ['menuData'],
  name: 'MenuTree',
  methods: {
    handleClick (data) {
      this.$emit('clickMenu', data && data.url ? data.url : '')
    },
    clickMenu (data) {
      this.$emit('clickMenu', data)
    }
  }
}
</script>
<style>
  .icon-lagger {
    font-size: 15px;
  }
  .title-lagger {
    font-size: 15px;
  }

  .el-menu .el-menu-item {
    min-width: 99%;
  }
</style>
