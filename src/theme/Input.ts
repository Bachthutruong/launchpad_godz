import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";
import { inputAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
);
const outlineInput = definePartsStyle({
  field: {
    border: "1px solid",
    borderColor: "#51517A",
    color: "#B5B0D1",
    width: "100%",
    bg: "#2E2E46",
  },
});
const unstyledInput = definePartsStyle({
  field: {
    border: "0px solid",
    borderColor: "transparent",
    color: "#B5B0D1",
    width: "100%",
    bg: "transparent",
  },
});
const baseStyle = definePartsStyle({
  // define the part you're going to style
  field: {
    fontFamily: "mono", // change the font family
    color: "teal.500", // change the input text color
  },
});
export const Input = defineMultiStyleConfig({
  baseStyle,
  variants: { outline: outlineInput, unstyled: unstyledInput },
});
