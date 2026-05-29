<script setup>
import SidebarIcon from "../icons/Sidebar.vue";

defineEmits(["toggle"]);
</script>

<template>
    <div class="box">
        <span class="traffic-spacer" />
    <button
        class="icon-btn no-drag"
        type="button"
        :title="collapsed ? 'Show Sidebar' : 'Hide Sidebar'"
        @click="$emit('toggle')"
      >
        <SidebarIcon :size="18" />
      </button>
    </div>
</template>

<style scoped>
.box {
    display: flex;
  align-items: center;
  gap: 8px;
}
.traffic-spacer {
  display: inline-block;
  width: 68px;
  height: 1px;
}
.icon-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 16px;
  line-height: 1;
  transition: background-color 120ms ease, color 120ms ease;
  font-family: inherit;
}

.icon-btn:hover {
  background: var(--row-hover);
  color: var(--text-primary);
}

.no-drag {
  -webkit-app-region: no-drag;
}

</style>
