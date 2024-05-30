import { describe, expect, it } from "vitest";
import { generateTreeFromFlatData } from "@renderer/utils/story-tree-utils";
import type { TreeObj } from "@renderer/utils/story-tree-utils";
import type { StoryTree } from "../../../../renderer/components/shared/story-explorer/helper";
import type { StoryMetadata } from "@shared/type";

interface TreeData {
  id: string;
  title: string;
  name: string;
}

describe("generateTreeFromFlatData", () => {
  it("should return an empty object when given an empty array", () => {
    const metadataArr: StoryMetadata[] = [];
    const expectedResult: StoryTree = {};
    expect(generateTreeFromFlatData(metadataArr)).toEqual(expectedResult);
  });

  // Should correctly create a StoryTree object from an array of StoryMetadata
  it("should return a StoryTree object with correct structure", () => {
    const flatDataArr: TreeData[] = [
      {
        id: "general-button--main",
        title: "general/Button",
        name: "Main",
      },
      {
        id: "general-button--disabled",
        title: "general/Button",
        name: "Disabled",
      },
      {
        id: "general-iconbutton--icon-button",
        title: "general/IconButton",
        name: "Icon Button",
      },
    ];
    const expectedResult: TreeObj<TreeData> = {
      general: {
        Button: {
          Main: flatDataArr[0],
          Disabled: flatDataArr[1],
        },
        IconButton: {
          "Icon Button": flatDataArr[2],
        },
      },
    };
    expect(generateTreeFromFlatData(flatDataArr)).toEqual(expectedResult);
  });

  it("test mock data", () => {
    const mockData: TreeData[] = [
      {
        id: "general-button--main",
        title: "general/Button",
        name: "Main",
      },
      {
        id: "general-button--disabled",
        title: "general/Button",
        name: "Disabled",
      },
      {
        id: "general-button--loading",
        title: "general/Button",
        name: "Loading",
      },
      {
        id: "general-iconbutton--icon-button",
        title: "general/IconButton",
        name: "Icon Button",
      },
      {
        id: "general-linkbutton--link-button",
        title: "general/LinkButton",
        name: "Link Button",
      },
      {
        id: "general-datepicker--date-picker",
        title: "general/DatePicker",
        name: "Date Picker",
      },
      {
        id: "general-dropdown--dropdown",
        title: "general/Dropdown",
        name: "Dropdown",
      },
      {
        id: "general-input--input",
        title: "general/Input",
        name: "Input",
      },
      {
        id: "general-message--message",
        title: "general/Message",
        name: "Message",
      },
      {
        id: "general-modal--modal",
        title: "general/Modal",
        name: "Modal",
      },
      {
        id: "general-select-multipleselect--multiple-select",
        title: "general/Select/MultipleSelect",
        name: "Multiple Select",
      },
      {
        id: "general-select-singleselect--single-select",
        title: "general/Select/SingleSelect",
        name: "Single Select",
      },
      {
        id: "general-timepicker--time-picker",
        title: "general/TimePicker",
        name: "Time Picker",
      },
      {
        id: "dev-test-testnew--test-new",
        title: "dev-test/TestNew",
        name: "Test New",
      },
      {
        id: "dev-test-testremove--test-remove",
        title: "dev-test/TestRemove",
        name: "Test Remove",
      },
      {
        id: "dev-test-testrename--test-rename",
        title: "dev-test/TestRename",
        name: "Test Rename",
      },
      {
        id: "dev-test-testresize--test-resize",
        title: "dev-test/TestResize",
        name: "Test Resize",
      },
      {
        id: "app-eventcard--event-card",
        title: "app/EventCard",
        name: "Event Card",
      },
      {
        id: "app-tagcard--tag-card",
        title: "app/TagCard",
        name: "Tag Card",
      },
    ];

    const expectedResult: TreeObj<TreeData> = {
      general: {
        Button: {
          Main: mockData[0],
          Disabled: mockData[1],
          Loading: mockData[2],
        },
        IconButton: {
          "Icon Button": mockData[3],
        },
        LinkButton: {
          "Link Button": mockData[4],
        },
        DatePicker: {
          "Date Picker": mockData[5],
        },
        Dropdown: {
          Dropdown: mockData[6],
        },
        Input: {
          Input: mockData[7],
        },
        Message: {
          Message: mockData[8],
        },
        Modal: {
          Modal: mockData[9],
        },
        Select: {
          MultipleSelect: {
            "Multiple Select": mockData[10],
          },
          SingleSelect: {
            "Single Select": mockData[11],
          },
        },
        TimePicker: {
          "Time Picker": mockData[12],
        },
      },
      "dev-test": {
        TestNew: {
          "Test New": mockData[13],
        },
        TestRemove: {
          "Test Remove": mockData[14],
        },
        TestRename: {
          "Test Rename": mockData[15],
        },
        TestResize: {
          "Test Resize": mockData[16],
        },
      },
      app: {
        EventCard: {
          "Event Card": mockData[17],
        },
        TagCard: {
          "Tag Card": mockData[18],
        },
      },
    };
    expect(generateTreeFromFlatData(mockData)).toEqual(expectedResult);
  });
});
