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
      <div />
    </nav>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TabMenu from "primevue/tabmenu";

const items = ref([
  { label: "Reference", icon: "pi pi-book", route: "/reference" },
  { label: "Screenshot", icon: "pi pi-camera", route: "/screenshot" },
  { label: "Compare", icon: "pi pi-eye", route: "/compare" },
]);
</script>

<style scoped>
#app-layout {
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-template-columns: 1fr;
  height: 100vh;
  width: 100vw;
}
</style>
