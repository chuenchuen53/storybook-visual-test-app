import { describe, expect, it } from "vitest";
import { generateTreeFromFlatData } from "../../../utils/story-tree-utils";
import type { TreeObj } from "../../../utils/story-tree-utils";
import type { StoryTree } from "../../../components/screenshot/story-explorer/helper";
import type { StoryMetadata } from "../../../../shared/type";

interface TreeData {
  id: string;
  label: string;
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
        label: "general/Button/Main",
      },
      {
        id: "general-button--disabled",
        label: "general/Button/Disabled",
      },
      {
        id: "general-iconbutton--icon-button",
        label: "general/IconButton/Icon Button",
      },
    ];
    const expectedResult: TreeObj<TreeData> = {
      general: {
        button: {
          main: flatDataArr[0],
          disabled: flatDataArr[1],
        },
        iconbutton: {
          "icon-button": flatDataArr[2],
        },
      },
    };
    expect(generateTreeFromFlatData(flatDataArr)).toEqual(expectedResult);
  });

  it("test mock data", () => {
    const mockData: TreeData[] = [
      {
        id: "general-button--main",
        label: "general/Button/Main",
      },
      {
        id: "general-button--disabled",
        label: "general/Button/Disabled",
      },
      {
        id: "general-button--loading",
        label: "general/Button/Loading",
      },
      {
        id: "general-iconbutton--icon-button",
        label: "general/IconButton/Icon Button",
      },
      {
        id: "general-linkbutton--link-button",
        label: "general/LinkButton/Link Button",
      },
      {
        id: "general-datepicker--date-picker",
        label: "general/DatePicker/Date Picker",
      },
      {
        id: "general-dropdown--dropdown",
        label: "general/Dropdown/Dropdown",
      },
      {
        id: "general-input--input",
        label: "general/Input/Input",
      },
      {
        id: "general-message--message",
        label: "general/Message/Message",
      },
      {
        id: "general-modal--modal",
        label: "general/Modal/Modal",
      },
      {
        id: "general-select-multipleselect--multiple-select",
        label: "general/Select/MultipleSelect",
      },
      {
        id: "general-select-singleselect--single-select",
        label: "general/Select/SingleSelect",
      },
      {
        id: "general-timepicker--time-picker",
        label: "general/TimePicker/Time Picker",
      },
      {
        id: "dev-test-testnew--test-new",
        label: "dev-test/TestNew/Test New",
      },
      {
        id: "dev-test-testremove--test-remove",
        label: "dev-test/TestRemove/Test Remove",
      },
      {
        id: "dev-test-testrename--test-rename",
        label: "dev-test/TestRename/Test Rename",
      },
      {
        id: "dev-test-testresize--test-resize",
        label: "dev-test/TestResize/Test Resize",
      },
      {
        id: "app-eventcard--event-card",
        label: "app/EventCard/Event Card",
      },
      {
        id: "app-tagcard--tag-card",
        label: "app/TagCard/Tag Card",
      },
    ];

    const expectedResult: TreeObj<TreeData> = {
      general: {
        button: {
          main: mockData[0],
          disabled: mockData[1],
          loading: mockData[2],
        },
        iconbutton: {
          "icon-button": mockData[3],
        },
        linkbutton: {
          "link-button": mockData[4],
        },
        datepicker: {
          "date-picker": mockData[5],
        },
        dropdown: {
          dropdown: mockData[6],
        },
        input: {
          input: mockData[7],
        },
        message: {
          message: mockData[8],
        },
        modal: {
          modal: mockData[9],
        },
        select: {
          multipleselect: {
            "multiple-select": mockData[10],
          },
          singleselect: {
            "single-select": mockData[11],
          },
        },
        timepicker: {
          "time-picker": mockData[12],
        },
      },
      dev: {
        test: {
          testnew: {
            "test-new": mockData[13],
          },
          testremove: {
            "test-remove": mockData[14],
          },
          testrename: {
            "test-rename": mockData[15],
          },
          testresize: {
            "test-resize": mockData[16],
          },
        },
      },
      app: {
        eventcard: {
          "event-card": mockData[17],
        },
        tagcard: {
          "tag-card": mockData[18],
        },
      },
    };
    expect(generateTreeFromFlatData(mockData)).toEqual(expectedResult);
  });
});
