<template>
  <div id="app-layout">
    <div class="relative h-[50px]">
      <nav>
        <TabMenu :model="items" :pt="{ itemLink: { style: { height: '50px' } } }">
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
      <div class="z-1 absolute right-4 top-1/2 -translate-y-1/2">
        <DarkThemeSwitch />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TabMenu from "primevue/tabmenu";
import DarkThemeSwitch from "./components/general/DarkThemeSwitch.vue";

const items = ref([
  { label: "Saved", icon: "pi pi-folder", route: "/saved-set" },
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
