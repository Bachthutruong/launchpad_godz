import { selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  selectAnatomy.keys
);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  field: {
    background: "#2E2E46",
    color: "#FFFFFF",
    borderColor: "#51517A",
  },
  icon: {
    color: "blue.400",
  },
});

export const Select = defineMultiStyleConfig({ baseStyle });
