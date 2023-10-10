module.exports = {
  plugins: [
    require("postcss-extract-value")({
      templateVariableName: "sf-material-[propertyName]",
      filterByProps: [
        "color",
        "background-color",
        "border-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "background",
      ],
    }),
  ],
};
