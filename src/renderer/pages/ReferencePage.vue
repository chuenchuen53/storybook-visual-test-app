<template>
  <div>This is the Reference Page</div>
  <div>{{ highlightKey }}</div>
  <div>{{ Array.from(expandedKeys) }}</div>

  <div class="grid grid-cols-2 text-sm">
    <Tree
      v-model:highlight-key="highlightKey"
      v-model:expanded-keys="expandedKeys"
      :data="data"
      @node-click="onNodeClick"
    >
      <template #node-content="{ node }">
        <div v-if="!node.children && typeof node.data === 'object'">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <i :class="iconCls(node.data.state)" style="font-size: 14px"></i>
              <div>
                {{ node.label }}
              </div>
              <i v-if="node.data.storyErr" class="pi pi-exclamation-triangle text-red-400" style="font-size: 14px"></i>
            </div>
            <div v-if="node.data.startTime && node.data.endTime" class="text-xs text-gray-500">
              {{ timeSpent(node.data.startTime, node.data.endTime) }}ms
            </div>
          </div>
        </div>
        <div v-else>
          <div>{{ node.label }}</div>
        </div>
      </template>
    </Tree>
    <StyledTree
      v-model:highlight-key="highlightKey"
      v-model:expanded-keys="expandedKeys"
      :data="data"
      @node-click="onNodeClick"
    >
      <template #node-content="{ node }">
        <div v-if="!node.children && typeof node.data === 'object'">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <i :class="iconCls(node.data.state)" style="font-size: 14px"></i>
              <div>
                {{ node.label }}
              </div>
              <i v-if="node.data.storyErr" class="pi pi-exclamation-triangle text-red-400" style="font-size: 14px"></i>
            </div>
            <div v-if="node.data.startTime && node.data.endTime" class="text-xs text-gray-500">
              {{ timeSpent(node.data.startTime, node.data.endTime) }}ms
            </div>
          </div>
        </div>
        <div v-else>
          <div>{{ node.label }}</div>
        </div>
      </template>
    </StyledTree>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StyledTree from "../components/general/tree/StyledTree.vue";
import Tree from "../components/general/tree/Tree.vue";
import { StoryState } from "../../shared/type";
import type { NodeData } from "../components/general/tree/type";

const highlightKey = ref<null | string>(null);

const expandedKeys = ref(new Set<string>());

function timeSpent(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime.getTime() - startTime.getTime();
  return diff.toString();
}

function iconCls(state: StoryState): string {
  switch (state) {
    case StoryState.WAITING:
      return "pi pi-hourglass opacity-50";
    case StoryState.CAPTURING:
      return "pi pi-camera text-green-400 animate-pulse";
    case StoryState.FINISHED:
      return "pi pi-check-circle text-green-400";
    case StoryState.FAILED:
      return "pi pi-times-circle text-red-400";
  }
}

const onNodeClick = (node: NodeData) => {
  console.log(node);
};

// const data: NodeData[] = [
//   {
//     key: "general",
//     label: "general",
//     children: [
//       {
//         key: "general-button",
//         label: "button",
//         children: [
//           {
//             key: "general-button-main",
//             label: "main",
//             data: {
//               id: "general-button--main",
//               componentId: "general-button",
//               title: "general/Button",
//               kind: "general/Button",
//               tags: ["dev", "test"],
//               name: "Main",
//               story: "Main",
//               state: "FINISHED",
//               browserName: "browser-0",
//               startTime: "2024-05-22T02:33:36.805Z",
//               endTime: "2024-05-22T02:33:38.486Z",
//               storyErr: false,
//             },
//           },
//           {
//             key: "general-button-disabled",
//             label: "disabled",
//             data: {
//               id: "general-button--disabled",
//               componentId: "general-button",
//               title: "general/Button",
//               kind: "general/Button",
//               tags: ["dev", "test"],
//               name: "Disabled",
//               story: "Disabled",
//               state: "FINISHED",
//               browserName: "browser-1",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:38.493Z",
//               storyErr: false,
//             },
//           },
//           {
//             key: "general-button-loading",
//             label: "loading",
//             data: {
//               id: "general-button--loading",
//               componentId: "general-button",
//               title: "general/Button",
//               kind: "general/Button",
//               tags: ["dev", "test"],
//               name: "Loading",
//               story: "Loading",
//               state: "FINISHED",
//               browserName: "browser-2",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:38.252Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-iconbutton",
//         label: "iconbutton",
//         children: [
//           {
//             key: "general-iconbutton-icon-button",
//             label: "icon-button",
//             data: {
//               id: "general-iconbutton--icon-button",
//               componentId: "general-iconbutton",
//               title: "general/IconButton",
//               kind: "general/IconButton",
//               tags: ["dev", "test"],
//               name: "Icon Button",
//               story: "Icon Button",
//               state: "FINISHED",
//               browserName: "browser-3",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:39.503Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-linkbutton",
//         label: "linkbutton",
//         children: [
//           {
//             key: "general-linkbutton-link-button",
//             label: "link-button",
//             data: {
//               id: "general-linkbutton--link-button",
//               componentId: "general-linkbutton",
//               title: "general/LinkButton",
//               kind: "general/LinkButton",
//               tags: ["dev", "test"],
//               name: "Link Button",
//               story: "Link Button",
//               state: "FINISHED",
//               browserName: "browser-4",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:39.508Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-datepicker",
//         label: "datepicker",
//         children: [
//           {
//             key: "general-datepicker-date-picker",
//             label: "date-picker",
//             data: {
//               id: "general-datepicker--date-picker",
//               componentId: "general-datepicker",
//               title: "general/DatePicker",
//               kind: "general/DatePicker",
//               tags: ["dev", "test"],
//               name: "Date Picker",
//               story: "Date Picker",
//               state: "FINISHED",
//               browserName: "browser-5",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:39.541Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-dropdown",
//         label: "dropdown",
//         children: [
//           {
//             key: "general-dropdown-dropdown",
//             label: "dropdown",
//             data: {
//               id: "general-dropdown--dropdown",
//               componentId: "general-dropdown",
//               title: "general/Dropdown",
//               kind: "general/Dropdown",
//               tags: ["dev", "test"],
//               name: "Dropdown",
//               story: "Dropdown",
//               state: "FINISHED",
//               browserName: "browser-6",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:39.523Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-input",
//         label: "input",
//         children: [
//           {
//             key: "general-input-input",
//             label: "input",
//             data: {
//               id: "general-input--input",
//               componentId: "general-input",
//               title: "general/Input",
//               kind: "general/Input",
//               tags: ["dev", "test"],
//               name: "Input",
//               story: "Input",
//               state: "FINISHED",
//               browserName: "browser-7",
//               startTime: "2024-05-22T02:33:36.806Z",
//               endTime: "2024-05-22T02:33:38.485Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-message",
//         label: "message",
//         children: [
//           {
//             key: "general-message-message",
//             label: "message",
//             data: {
//               id: "general-message--message",
//               componentId: "general-message",
//               title: "general/Message",
//               kind: "general/Message",
//               tags: ["dev", "test"],
//               name: "Message",
//               story: "Message",
//               state: "FINISHED",
//               browserName: "browser-2",
//               startTime: "2024-05-22T02:33:38.252Z",
//               endTime: "2024-05-22T02:33:39.545Z",
//               storyErr: false,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-modal",
//         label: "modal",
//         children: [
//           {
//             key: "general-modal-modal",
//             label: "modal",
//             data: {
//               id: "general-modal--modal",
//               componentId: "general-modal",
//               title: "general/Modal",
//               kind: "general/Modal",
//               tags: ["dev", "test"],
//               name: "Modal",
//               story: "Modal",
//               state: "CAPTURING",
//               browserName: "browser-7",
//               startTime: "2024-05-22T02:33:38.485Z",
//               endTime: null,
//               storyErr: null,
//             },
//           },
//         ],
//       },
//       {
//         key: "general-select",
//         label: "select",
//         children: [
//           {
//             key: "general-select-multipleselect",
//             label: "multipleselect",
//             children: [
//               {
//                 key: "general-select-multipleselect-multiple-select",
//                 label: "multiple-select",
//                 data: {
//                   id: "general-select-multipleselect--multiple-select",
//                   componentId: "general-select-multipleselect",
//                   title: "general/Select/MultipleSelect",
//                   kind: "general/Select/MultipleSelect",
//                   tags: ["dev", "test"],
//                   name: "Multiple Select",
//                   story: "Multiple Select",
//                   state: "CAPTURING",
//                   browserName: "browser-0",
//                   startTime: "2024-05-22T02:33:38.486Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//           {
//             key: "general-select-singleselect",
//             label: "singleselect",
//             children: [
//               {
//                 key: "general-select-singleselect-single-select",
//                 label: "single-select",
//                 data: {
//                   id: "general-select-singleselect--single-select",
//                   componentId: "general-select-singleselect",
//                   title: "general/Select/SingleSelect",
//                   kind: "general/Select/SingleSelect",
//                   tags: ["dev", "test"],
//                   name: "Single Select",
//                   story: "Single Select",
//                   state: "CAPTURING",
//                   browserName: "browser-1",
//                   startTime: "2024-05-22T02:33:38.493Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//         ],
//       },
//       {
//         key: "general-timepicker",
//         label: "timepicker",
//         children: [
//           {
//             key: "general-timepicker-time-picker",
//             label: "time-picker",
//             data: {
//               id: "general-timepicker--time-picker",
//               componentId: "general-timepicker",
//               title: "general/TimePicker",
//               kind: "general/TimePicker",
//               tags: ["dev", "test"],
//               name: "Time Picker",
//               story: "Time Picker",
//               state: "CAPTURING",
//               browserName: "browser-3",
//               startTime: "2024-05-22T02:33:39.503Z",
//               endTime: null,
//               storyErr: null,
//             },
//           },
//         ],
//       },
//     ],
//   },
//   {
//     key: "dev",
//     label: "dev",
//     children: [
//       {
//         key: "dev-test",
//         label: "test",
//         children: [
//           {
//             key: "dev-test-testnew",
//             label: "testnew",
//             children: [
//               {
//                 key: "dev-test-testnew-test-new",
//                 label: "test-new",
//                 data: {
//                   id: "dev-test-testnew--test-new",
//                   componentId: "dev-test-testnew",
//                   title: "dev-test/TestNew",
//                   kind: "dev-test/TestNew",
//                   tags: ["dev", "test"],
//                   name: "Test New",
//                   story: "Test New",
//                   state: "CAPTURING",
//                   browserName: "browser-4",
//                   startTime: "2024-05-22T02:33:39.508Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//           {
//             key: "dev-test-testremove",
//             label: "testremove",
//             children: [
//               {
//                 key: "dev-test-testremove-test-remove",
//                 label: "test-remove",
//                 data: {
//                   id: "dev-test-testremove--test-remove",
//                   componentId: "dev-test-testremove",
//                   title: "dev-test/TestRemove",
//                   kind: "dev-test/TestRemove",
//                   tags: ["dev", "test"],
//                   name: "Test Remove",
//                   story: "Test Remove",
//                   state: "CAPTURING",
//                   browserName: "browser-6",
//                   startTime: "2024-05-22T02:33:39.523Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//           {
//             key: "dev-test-testrename",
//             label: "testrename",
//             children: [
//               {
//                 key: "dev-test-testrename-test-rename",
//                 label: "test-rename",
//                 data: {
//                   id: "dev-test-testrename--test-rename",
//                   componentId: "dev-test-testrename",
//                   title: "dev-test/TestRename",
//                   kind: "dev-test/TestRename",
//                   tags: ["dev", "test"],
//                   name: "Test Rename",
//                   story: "Test Rename",
//                   state: "CAPTURING",
//                   browserName: "browser-5",
//                   startTime: "2024-05-22T02:33:39.541Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//           {
//             key: "dev-test-testresize",
//             label: "testresize",
//             children: [
//               {
//                 key: "dev-test-testresize-test-resize",
//                 label: "test-resize",
//                 data: {
//                   id: "dev-test-testresize--test-resize",
//                   componentId: "dev-test-testresize",
//                   title: "dev-test/TestResize",
//                   kind: "dev-test/TestResize",
//                   tags: ["dev", "test"],
//                   name: "Test Resize",
//                   story: "Test Resize",
//                   state: "CAPTURING",
//                   browserName: "browser-2",
//                   startTime: "2024-05-22T02:33:39.545Z",
//                   endTime: null,
//                   storyErr: null,
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     key: "app",
//     label: "app",
//     children: [
//       {
//         key: "app-eventcard",
//         label: "eventcard",
//         children: [
//           {
//             key: "app-eventcard-event-card",
//             label: "event-card",
//             data: {
//               id: "app-eventcard--event-card",
//               componentId: "app-eventcard",
//               title: "app/EventCard",
//               kind: "app/EventCard",
//               tags: ["dev", "test"],
//               name: "Event Card",
//               story: "Event Card",
//               state: "WAITING",
//               browserName: null,
//               startTime: null,
//               endTime: null,
//               storyErr: null,
//             },
//           },
//         ],
//       },
//       {
//         key: "app-tagcard",
//         label: "tagcard",
//         children: [
//           {
//             key: "app-tagcard-tag-card",
//             label: "tag-card",
//             data: {
//               id: "app-tagcard--tag-card",
//               componentId: "app-tagcard",
//               title: "app/TagCard",
//               kind: "app/TagCard",
//               tags: ["dev", "test"],
//               name: "Tag Card",
//               story: "Tag Card",
//               state: "WAITING",
//               browserName: null,
//               startTime: null,
//               endTime: null,
//               storyErr: null,
//             },
//           },
//         ],
//       },
//     ],
//   },
// ];

const data = [
  {
    key: "1",
    label: "Node 1",
    children: [
      { key: "1-1", label: "Node 1-1", data: { id: "1-1" } },
      { key: "1-2", label: "Node 1-2", data: { id: "1-2" } },
      {
        key: "1-3",
        label: "Node 1-3",
        children: [{ key: "1-3-1", label: "Node 1-3-1", data: { id: "1-3-1" } }],
      },
    ],
  },
  {
    key: "2",
    label: "Node 2",
    data: { id: "2" },
  },
];
</script>
