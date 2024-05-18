import { describe, expect, it } from "vitest";
import { treeOfStoryMetadata } from "../view/utils";
import type { StoryTree } from "../view/utils";
import type { StoryMetadata } from "src/service/crawler/type";

describe("treeOfStoryMetadata", () => {
  it("should return an empty object when given an empty array", () => {
    const metadataArr: StoryMetadata[] = [];
    const expectedResult: StoryTree = {};
    expect(treeOfStoryMetadata(metadataArr)).toEqual(expectedResult);
  });

  // Should correctly create a StoryTree object from an array of StoryMetadata
  it("should return a StoryTree object with correct structure", () => {
    const metadataArr: StoryMetadata[] = [
      {
        id: "general-button--main",
        componentId: "general-button",
        title: "general/Button",
        kind: "general/Button",
        tags: ["dev", "test"],
        name: "Main",
        story: "Main",
      },
      {
        id: "general-button--disabled",
        componentId: "general-button",
        title: "general/Button",
        kind: "general/Button",
        tags: ["dev", "test"],
        name: "Disabled",
        story: "Disabled",
      },
      {
        id: "general-iconbutton--icon-button",
        componentId: "general-iconbutton",
        title: "general/IconButton",
        kind: "general/IconButton",
        tags: ["dev", "test"],
        name: "Icon Button",
        story: "Icon Button",
      },
    ];

    const expectedResult: StoryTree = {
      general: {
        button: {
          main: {
            id: "general-button--main",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Main",
            story: "Main",
          },
          disabled: {
            id: "general-button--disabled",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Disabled",
            story: "Disabled",
          },
        },
        iconbutton: {
          "icon-button": {
            id: "general-iconbutton--icon-button",
            componentId: "general-iconbutton",
            title: "general/IconButton",
            kind: "general/IconButton",
            tags: ["dev", "test"],
            name: "Icon Button",
            story: "Icon Button",
          },
        },
      },
    };

    expect(treeOfStoryMetadata(metadataArr)).toEqual(expectedResult);
  });

  it("test mock data", () => {
    const mockData: StoryMetadata[] = [
      {
        id: "general-button--main",
        componentId: "general-button",
        title: "general/Button",
        kind: "general/Button",
        tags: ["dev", "test"],
        name: "Main",
        story: "Main",
      },
      {
        id: "general-button--disabled",
        componentId: "general-button",
        title: "general/Button",
        kind: "general/Button",
        tags: ["dev", "test"],
        name: "Disabled",
        story: "Disabled",
      },
      {
        id: "general-button--loading",
        componentId: "general-button",
        title: "general/Button",
        kind: "general/Button",
        tags: ["dev", "test"],
        name: "Loading",
        story: "Loading",
      },
      {
        id: "general-iconbutton--icon-button",
        componentId: "general-iconbutton",
        title: "general/IconButton",
        kind: "general/IconButton",
        tags: ["dev", "test"],
        name: "Icon Button",
        story: "Icon Button",
      },
      {
        id: "general-linkbutton--link-button",
        componentId: "general-linkbutton",
        title: "general/LinkButton",
        kind: "general/LinkButton",
        tags: ["dev", "test"],
        name: "Link Button",
        story: "Link Button",
      },
      {
        id: "general-datepicker--date-picker",
        componentId: "general-datepicker",
        title: "general/DatePicker",
        kind: "general/DatePicker",
        tags: ["dev", "test"],
        name: "Date Picker",
        story: "Date Picker",
      },
      {
        id: "general-dropdown--dropdown",
        componentId: "general-dropdown",
        title: "general/Dropdown",
        kind: "general/Dropdown",
        tags: ["dev", "test"],
        name: "Dropdown",
        story: "Dropdown",
      },
      {
        id: "general-input--input",
        componentId: "general-input",
        title: "general/Input",
        kind: "general/Input",
        tags: ["dev", "test"],
        name: "Input",
        story: "Input",
      },
      {
        id: "general-message--message",
        componentId: "general-message",
        title: "general/Message",
        kind: "general/Message",
        tags: ["dev", "test"],
        name: "Message",
        story: "Message",
      },
      {
        id: "general-modal--modal",
        componentId: "general-modal",
        title: "general/Modal",
        kind: "general/Modal",
        tags: ["dev", "test"],
        name: "Modal",
        story: "Modal",
      },
      {
        id: "general-select-multipleselect--multiple-select",
        componentId: "general-select-multipleselect",
        title: "general/Select/MultipleSelect",
        kind: "general/Select/MultipleSelect",
        tags: ["dev", "test"],
        name: "Multiple Select",
        story: "Multiple Select",
      },
      {
        id: "general-select-singleselect--single-select",
        componentId: "general-select-singleselect",
        title: "general/Select/SingleSelect",
        kind: "general/Select/SingleSelect",
        tags: ["dev", "test"],
        name: "Single Select",
        story: "Single Select",
      },
      {
        id: "general-timepicker--time-picker",
        componentId: "general-timepicker",
        title: "general/TimePicker",
        kind: "general/TimePicker",
        tags: ["dev", "test"],
        name: "Time Picker",
        story: "Time Picker",
      },
      {
        id: "dev-test-testnew--test-new",
        componentId: "dev-test-testnew",
        title: "dev-test/TestNew",
        kind: "dev-test/TestNew",
        tags: ["dev", "test"],
        name: "Test New",
        story: "Test New",
      },
      {
        id: "dev-test-testremove--test-remove",
        componentId: "dev-test-testremove",
        title: "dev-test/TestRemove",
        kind: "dev-test/TestRemove",
        tags: ["dev", "test"],
        name: "Test Remove",
        story: "Test Remove",
      },
      {
        id: "dev-test-testrename--test-rename",
        componentId: "dev-test-testrename",
        title: "dev-test/TestRename",
        kind: "dev-test/TestRename",
        tags: ["dev", "test"],
        name: "Test Rename",
        story: "Test Rename",
      },
      {
        id: "dev-test-testresize--test-resize",
        componentId: "dev-test-testresize",
        title: "dev-test/TestResize",
        kind: "dev-test/TestResize",
        tags: ["dev", "test"],
        name: "Test Resize",
        story: "Test Resize",
      },
      {
        id: "app-eventcard--event-card",
        componentId: "app-eventcard",
        title: "app/EventCard",
        kind: "app/EventCard",
        tags: ["dev", "test"],
        name: "Event Card",
        story: "Event Card",
      },
      {
        id: "app-tagcard--tag-card",
        componentId: "app-tagcard",
        title: "app/TagCard",
        kind: "app/TagCard",
        tags: ["dev", "test"],
        name: "Tag Card",
        story: "Tag Card",
      },
    ];

    const expectedResult: StoryTree = {
      general: {
        button: {
          main: {
            id: "general-button--main",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Main",
            story: "Main",
          },
          disabled: {
            id: "general-button--disabled",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Disabled",
            story: "Disabled",
          },
          loading: {
            id: "general-button--loading",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Loading",
            story: "Loading",
          },
        },
        iconbutton: {
          "icon-button": {
            id: "general-iconbutton--icon-button",
            componentId: "general-iconbutton",
            title: "general/IconButton",
            kind: "general/IconButton",
            tags: ["dev", "test"],
            name: "Icon Button",
            story: "Icon Button",
          },
        },
        linkbutton: {
          "link-button": {
            id: "general-linkbutton--link-button",
            componentId: "general-linkbutton",
            title: "general/LinkButton",
            kind: "general/LinkButton",
            tags: ["dev", "test"],
            name: "Link Button",
            story: "Link Button",
          },
        },
        datepicker: {
          "date-picker": {
            id: "general-datepicker--date-picker",
            componentId: "general-datepicker",
            title: "general/DatePicker",
            kind: "general/DatePicker",
            tags: ["dev", "test"],
            name: "Date Picker",
            story: "Date Picker",
          },
        },
        dropdown: {
          dropdown: {
            id: "general-dropdown--dropdown",
            componentId: "general-dropdown",
            title: "general/Dropdown",
            kind: "general/Dropdown",
            tags: ["dev", "test"],
            name: "Dropdown",
            story: "Dropdown",
          },
        },
        input: {
          input: {
            id: "general-input--input",
            componentId: "general-input",
            title: "general/Input",
            kind: "general/Input",
            tags: ["dev", "test"],
            name: "Input",
            story: "Input",
          },
        },
        message: {
          message: {
            id: "general-message--message",
            componentId: "general-message",
            title: "general/Message",
            kind: "general/Message",
            tags: ["dev", "test"],
            name: "Message",
            story: "Message",
          },
        },

        modal: {
          modal: {
            id: "general-modal--modal",
            componentId: "general-modal",
            title: "general/Modal",
            kind: "general/Modal",
            tags: ["dev", "test"],
            name: "Modal",
            story: "Modal",
          },
        },
        select: {
          multipleselect: {
            "multiple-select": {
              id: "general-select-multipleselect--multiple-select",
              componentId: "general-select-multipleselect",
              title: "general/Select/MultipleSelect",
              kind: "general/Select/MultipleSelect",
              tags: ["dev", "test"],
              name: "Multiple Select",
              story: "Multiple Select",
            },
          },
          singleselect: {
            "single-select": {
              id: "general-select-singleselect--single-select",
              componentId: "general-select-singleselect",
              title: "general/Select/SingleSelect",
              kind: "general/Select/SingleSelect",
              tags: ["dev", "test"],
              name: "Single Select",
              story: "Single Select",
            },
          },
        },
        timepicker: {
          "time-picker": {
            id: "general-timepicker--time-picker",
            componentId: "general-timepicker",
            title: "general/TimePicker",
            kind: "general/TimePicker",
            tags: ["dev", "test"],
            name: "Time Picker",
            story: "Time Picker",
          },
        },
      },
      dev: {
        test: {
          testnew: {
            "test-new": {
              id: "dev-test-testnew--test-new",
              componentId: "dev-test-testnew",
              title: "dev-test/TestNew",
              kind: "dev-test/TestNew",
              tags: ["dev", "test"],
              name: "Test New",
              story: "Test New",
            },
          },
          testremove: {
            "test-remove": {
              id: "dev-test-testremove--test-remove",
              componentId: "dev-test-testremove",
              title: "dev-test/TestRemove",
              kind: "dev-test/TestRemove",
              tags: ["dev", "test"],
              name: "Test Remove",
              story: "Test Remove",
            },
          },
          testrename: {
            "test-rename": {
              id: "dev-test-testrename--test-rename",
              componentId: "dev-test-testrename",
              title: "dev-test/TestRename",
              kind: "dev-test/TestRename",
              tags: ["dev", "test"],
              name: "Test Rename",
              story: "Test Rename",
            },
          },
          testresize: {
            "test-resize": {
              id: "dev-test-testresize--test-resize",
              componentId: "dev-test-testresize",
              title: "dev-test/TestResize",
              kind: "dev-test/TestResize",
              tags: ["dev", "test"],
              name: "Test Resize",
              story: "Test Resize",
            },
          },
        },
      },
      app: {
        eventcard: {
          "event-card": {
            id: "app-eventcard--event-card",
            componentId: "app-eventcard",
            title: "app/EventCard",
            kind: "app/EventCard",
            tags: ["dev", "test"],
            name: "Event Card",
            story: "Event Card",
          },
        },
        tagcard: {
          "tag-card": {
            id: "app-tagcard--tag-card",
            componentId: "app-tagcard",
            title: "app/TagCard",
            kind: "app/TagCard",
            tags: ["dev", "test"],
            name: "Tag Card",
            story: "Tag Card",
          },
        },
      },
    };

    expect(treeOfStoryMetadata(mockData)).toEqual(expectedResult);
  });
});
