export default {
  editor: {
    label: {
      en: "Tokban Date Picker",
    },
    customStylePropertiesOrder: [
      "direction",
      "alignement",
      "primaryColor",
      "primaryLightColor",
      "primaryHoverColor",
      "textColor",
      "borderColor",
      "borderRadius",
      "isDarkMode",
      ["rows", "columns"],
    ],
    bubble: {
      icon: "calendar",
    },
  },
  triggerEvents: [
    {
      name: "change",
      label: { en: "On change" },
      event: {
        value: { start: new Date().toString(), end: new Date().toString() },
      },
    },
    {
      name: "initValueChange",
      label: { en: "On init value change" },
      event: { value: "" },
    },
    {
      name: "value-change",
      label: { en: "On variable change" },
      event: {
        value: { start: "", end: "" },
      },
    },
  ],
  properties: {
    // ─── Settings Tab ───
    initValueStart: {
      label: { en: "Start init value" },
      type: "Text",
      bindable: true,
      defaultValue: "",
      section: "settings",
      bindingValidation: {
        type: "string",
        tooltip:
          'A string, ISO Date or Timestamp: "2021-03-11T10:11:20.000+00:00" or "1667825290"',
      },
    },
    initValueEnd: {
      label: { en: "End init value" },
      type: "Text",
      bindable: true,
      defaultValue: "",
      section: "settings",
      bindingValidation: {
        type: "string",
        tooltip: 'A string ISO date: "2021-03-11T10:11:20.000+00:00"',
      },
    },
    pickerMode: {
      label: { en: "Picker mode" },
      type: "TextSelect",
      options: {
        options: [
          { value: "single", label: { en: "Single date" } },
          { value: "range", label: { en: "Date range" } },
        ],
      },
      defaultValue: "range",
      section: "settings",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: 'A string: "single" or "range"',
      },
      /* wwEditor:end */
    },
    showOn: {
      label: { en: "Show on" },
      type: "TextSelect",
      options: {
        options: [
          { value: "alwaysVisible", label: { en: "Always visible" } },
          { value: "hover", label: { en: "Hover" } },
          { value: "click", label: { en: "Click" } },
        ],
      },
      defaultValue: "click",
      section: "settings",
    },
    startEndInputs: {
      hidden: (content) =>
        content.showOn === "alwaysVisible" || content.pickerMode === "single",
      label: { en: "Show start & end inputs" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },
    placeholder: {
      label: { en: "Placeholder" },
      type: "Text",
      defaultValue: "Select date",
      section: "settings",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: 'Placeholder text for the main date input (or start date in range mode).',
      },
      /* wwEditor:end */
    },
    placeholderEnd: {
      hidden: (content) =>
        content.showOn === "alwaysVisible" || content.pickerMode === "single" || !content.startEndInputs,
      label: { en: "End date placeholder" },
      type: "Text",
      defaultValue: "",
      section: "settings",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: 'Placeholder text for the end date input in range mode. Falls back to translated "End date" if empty.',
      },
      /* wwEditor:end */
    },
    dateFormat: {
      label: { en: "Date display format" },
      type: "TextSelect",
      options: {
        options: [
          { value: "dd MMM yyyy", label: { en: "14 Mar 2026" } },
          { value: "yyyy-MM-dd", label: { en: "2026-03-14" } },
          { value: "dd/MM/yyyy", label: { en: "14/03/2026" } },
          { value: "MM/dd/yyyy", label: { en: "03/14/2026" } },
          { value: "dd-MM-yyyy", label: { en: "14-03-2026" } },
          { value: "d MMMM yyyy", label: { en: "14 March 2026" } },
        ],
      },
      defaultValue: "dd MMM yyyy",
      section: "settings",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip:
          'Format string: "dd MMM yyyy" | "yyyy-MM-dd" | "dd/MM/yyyy" | "MM/dd/yyyy" | "dd-MM-yyyy" | "d MMMM yyyy"',
      },
      /* wwEditor:end */
    },
    rangeDelimiter: {
      hidden: (content) => content.pickerMode === "single",
      label: { en: "Range delimiter" },
      type: "Text",
      defaultValue: " \u2013 ",
      section: "settings",
    },
    lang: {
      label: { en: "Language" },
      type: "TextSelect",
      options: {
        options: [
          { value: "pageLang", label: { en: "Page lang (auto)" } },
          { value: "en", label: { en: "English" } },
          { value: "id", label: { en: "Indonesian" } },
          { value: "zh-CN", label: { en: "Chinese Simplified" } },
          { value: "zh-TW", label: { en: "Chinese Traditional" } },
        ],
      },
      defaultValue: "pageLang",
      bindable: true,
      section: "settings",
      bindingValidation: {
        type: "string",
        tooltip:
          'A string that defines the lang: "en" | "id" | "zh-CN" | "zh-TW" or "pageLang"',
      },
    },
    showPresets: {
      label: { en: "Show preset sidebar" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },
    showTodayButton: {
      label: { en: "Show Today button" },
      type: "OnOff",
      defaultValue: false,
      section: "settings",
    },
    showClearButton: {
      label: { en: "Show Clear button" },
      type: "OnOff",
      defaultValue: false,
      section: "settings",
    },
    clearOnClose: {
      label: { en: "Allow clear on close" },
      type: "OnOff",
      defaultValue: false,
      section: "settings",
    },
    firstDayOfWeek: {
      label: { en: "First day of week" },
      type: "TextSelect",
      options: {
        options: [
          { value: 0, label: { en: "Sunday" } },
          { value: 1, label: { en: "Monday" } },
        ],
      },
      defaultValue: 0,
      section: "settings",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "0 for Sunday, 1 for Monday",
      },
      /* wwEditor:end */
    },
    minDate: {
      label: { en: "Min date (earliest)" },
      type: "Text",
      bindable: true,
      defaultValue: "",
      section: "settings",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip:
          'ISO date string or timestamp to restrict earliest selectable date. E.g. "2026-03-14" or leave empty for no restriction.',
      },
      propertyHelp: {
        tooltip:
          "Set the earliest date users can select. Bind to today's date to prevent backdating. Leave empty for no restriction.",
      },
      /* wwEditor:end */
    },
    maxDate: {
      label: { en: "Max date (latest)" },
      type: "Text",
      bindable: true,
      defaultValue: "",
      section: "settings",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip:
          'ISO date string or timestamp to restrict latest selectable date. E.g. "2026-12-31" or leave empty for no restriction.',
      },
      propertyHelp: {
        tooltip:
          "Set the latest date users can select. Leave empty for no restriction.",
      },
      /* wwEditor:end */
    },

    // ─── Styles Tab ───
    primaryColor: {
      label: { en: "Primary color" },
      type: "Color",
      defaultValue: "#F08227",
    },
    primaryLightColor: {
      label: { en: "Range fill color" },
      type: "Color",
      defaultValue: "#FFF3E8",
    },
    primaryHoverColor: {
      label: { en: "Hover color" },
      type: "Color",
      defaultValue: "#FFFAF5",
    },
    textColor: {
      label: { en: "Text color" },
      type: "Color",
      defaultValue: "#2C3131",
    },
    borderColor: {
      label: { en: "Border color" },
      type: "Color",
      defaultValue: "#E8E8E8",
    },
    borderRadius: {
      label: { en: "Border radius" },
      type: "Number",
      options: () => ({ min: 0, max: 24, step: 1 }),
      defaultValue: 8,
    },
    inputPadding: {
      label: { en: "Input padding" },
      type: "Text",
      defaultValue: "",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: 'CSS padding for the input. E.g. "8px 14px" or "12px 16px". Right padding is always 40px for the icon.',
      },
      propertyHelp: {
        tooltip: "Control vertical/horizontal padding inside the date input. Right side is always reserved for the calendar icon.",
      },
      /* wwEditor:end */
    },
    inputFontSize: {
      label: { en: "Input font size" },
      type: "Text",
      defaultValue: "",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: 'CSS font-size for the input. E.g. "14px" or "0.875rem". Defaults to 14px.',
      },
      /* wwEditor:end */
    },
    isDarkMode: {
      label: { en: "Dark mode" },
      type: "OnOff",
      defaultValue: false,
    },
    rows: {
      type: "Number",
      label: { en: "Rows" },
      options: () => ({ min: 1, max: 4, step: 1 }),
      responsive: true,
      defaultValue: 1,
    },
    columns: {
      hidden: (content) => content.pickerMode === "single",
      type: "Number",
      label: { en: "Columns (range)" },
      options: () => ({ min: 1, max: 3, step: 1 }),
      responsive: true,
      defaultValue: 1,
    },
    direction: {
      label: { en: "Direction" },
      type: "TextSelect",
      options: {
        options: [
          { value: "row", label: { en: "Horizontal" } },
          { value: "column", label: { en: "Vertical" } },
        ],
      },
      responsive: true,
      defaultValue: "row",
    },
    alignement: {
      label: { en: "Alignement" },
      type: "TextRadioGroup",
      options: (content) => {
        if (content.direction === "row") {
          return {
            choices: [
              {
                value: "flex-start",
                title: { en: "Start" },
                icon: "align-x-start",
              },
              {
                value: "center",
                title: { en: "Center" },
                icon: "align-x-center",
              },
              {
                value: "flex-end",
                title: { en: "End" },
                icon: "align-x-end",
              },
              {
                value: "space-around",
                title: { en: "Space around" },
                icon: "align-x-space-around",
              },
              {
                value: "space-between",
                title: { en: "Space between" },
                icon: "align-x-space-between",
              },
            ],
          };
        } else {
          return {
            choices: [
              { value: "start", title: { en: "Start" }, icon: "align-left" },
              {
                value: "center",
                title: { en: "Center" },
                icon: "align-center",
              },
              { value: "end", title: { en: "End" }, icon: "align-right" },
            ],
          };
        }
      },
      responsive: true,
      defaultValue: "center",
    },
    dateElement: {
      hidden: true,
      defaultValue: { isWwObject: true, type: "ww-text" },
    },
  },
};
