import * as React from "react";

import { storiesOf } from "@storybook/react";
import * as NodeView from "./NodeView";
// import { action } from "@storybook/addon-actions";
// import { linkTo } from "@storybook/addon-links";

function centerOnPage(node: React.ReactNode) {
  return (
    <div
      key={Math.random()}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%"
      }}
      children={node}
    />
  );
}

const DEFAULT_PROPS: NodeView.InnerProps = {
  label: "Hey",
  isLocked: false,
  isSelected: false,
  renderMode: "basic"
  // extraStyle: { "transform": "none" }
};

const storyGroup = storiesOf("NodeView", module);

function addVariation(name: string, newProps: Partial<NodeView.InnerProps>) {
  const props = { ...DEFAULT_PROPS, ...newProps } as NodeView.InnerProps;
  storyGroup.add(name, () => {
    return centerOnPage(React.createElement(NodeView.InnerComponent, props));
  });
}

addVariation("normal", {});
addVariation("locked", { isLocked: true });
addVariation("selected", { isSelected: true });
addVariation("colored", { color: "red" });
addVariation("light colored", { color: "#eeeeee" });
addVariation("long label", { label: "This is a really long label. It's good to test things like this sometimes." });
addVariation("long label without spaces", { label: "ThisisareallylonglabelItsgoodtotestthingslikethissometimes" });
addVariation("html", {
  label: "<h3>Big</h3>normal<h6>small</h6>",
  renderMode: "raw_html"
});
addVariation("normal with html label", {
  label: "<h3>Big</h3>normal<h6>small</h6>"
});
