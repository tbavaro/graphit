import * as React from "react";

import { storiesOf } from "@storybook/react";
import * as NodeView from "./NodeView";
// import { action } from "@storybook/addon-actions";
// import { linkTo } from "@storybook/addon-links";

function fixPositioning(node: React.ReactNode) {
  const ref = (parent: HTMLDivElement) => {
    if (parent && parent.children.length === 1) {
      const child = parent.children.item(0) as HTMLElement;
      child.style.transform = "none";
    }
  };
  return (
    <div
      key={Math.random()}
      ref={ref}
      children={node}
    />
  );
}

storiesOf("NodeView", module)
  .add("simple", () => {
    return fixPositioning(
      <NodeView.InnerComponent
        label="Hey"
        isSelected={false}
        renderMode="basic"
      />
    );
  })
  .add("simple selected", () => {
    return fixPositioning(
      <NodeView.InnerComponent
        label="Hey2"
        isSelected={true}
        renderMode="basic"
      />
    );
  });
