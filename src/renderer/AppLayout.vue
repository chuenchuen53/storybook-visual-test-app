<template>
  <div id="app-layout">
    <nav>
      <TabMenu :model="items">
        <template #item="{ item, props }">
          <router-link v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span v-bind="props.icon" />
              <span v-bind="props.label">{{ item.label }}</span>
            </a>
          </router-link>
        </template>
      </TabMenu>
    </nav>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TabMenu from "primevue/tabmenu";

const items = ref([
  { label: "Saved", icon: "pi pi-book", route: "/saved-set" },
  { label: "Screenshot", icon: "pi pi-camera", route: "/screenshot" },
  { label: "Comparison", icon: "pi pi-eye", route: "/comparison" },
]);
</script>

<style scoped>
#app-layout {
  display: grid;
  grid-template-rows: 50px calc(100vh - 50px);
  grid-template-columns: 100vw;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
