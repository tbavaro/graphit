import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";

import * as helpers from "./helpers.stories";
import * as NodeView from "./NodeView";

const DEFAULT_PROPS: NodeView.InnerProps = {
  label: "Hey",
  isLocked: false,
  isSelected: false,
  renderMode: "basic",
  onDoubleClick: action("double click"),
  extraStyle: {
    "position": "relative",
    "transform": "none"
  }
};

const addVariation = helpers.createVariations({
  storyGroup: storiesOf("NodeView", module),
  componentClass: NodeView.InnerComponent,
  defaultProps: DEFAULT_PROPS,
  centerOnPage: true
});

// basic states
addVariation("normal", {});
addVariation("locked", { isLocked: true });
addVariation("selected", { isSelected: true });

// colors
addVariation("colored", { color: "red" });
addVariation("light colored", { color: "#eeeeee" });

// handling weird sizes
addVariation("long label", {
  label: "This is a really long label. It's good to test things like this sometimes."
});
addVariation("long label without spaces", {
  label: "ThisisareallylonglabelItsgoodtotestthingslikethissometimes"
});

// html
addVariation("html", {
  label: "<h3>Big</h3>normal<h6>small</h6>",
  renderMode: "raw_html"
});
addVariation("normal with html label", {
  label: "<h3>Big</h3>normal<h6>small</h6>"
});
