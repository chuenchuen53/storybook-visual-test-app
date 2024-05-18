<template>
  <div class="flex min-h-screen flex-col">
    <nav class="fixed inset-x-0 z-10">
      <TabMenu :model="items">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate">
              <span v-bind="props.icon" />
              <span v-bind="props.label">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
            <span v-bind="props.icon" />
            <span v-bind="props.label">{{ item.label }}</span>
          </a>
        </template>
      </TabMenu>
      <div />
    </nav>
    <main class="flex flex-[1_1_auto] flex-col pt-[50px]">
      <slot />
    </main>
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
