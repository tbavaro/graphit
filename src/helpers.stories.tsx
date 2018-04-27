import * as React from "react";
import { Story } from "@storybook/react";
import { AllActions } from "./App";
import { isFunction } from "util";

export function centerOnPage(node: React.ReactNode): React.ReactNode {
  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
        children={node}
      />
    </div>
  );
}

class Box extends React.Component<{}, {}> {
  public render() {
    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          padding: "8px",
          lineHeight: "0"
        }}
      >
        {this.renderCorner("Top", "Left")}
        {this.renderCorner("Top", "Right")}
        {this.renderCorner("Bottom", "Left")}
        {this.renderCorner("Bottom", "Right")}
        <div
          style={{
            position: "relative",
            lineHeight: "normal",
            display: "inline-block",
            // width: "max-content"
          }}
          children={this.props.children}
        />
      </div>
    );
  }

  private renderCorner(side1: string, side2: string) {
    const style: any = {
      position: "absolute",
      display: "inline-block",
      width: "8px",
      height: "8px",
      boxSizing: "border-box",
      border: "1px solid lightgray"
    };
    style["border" + side1] = "none";
    style["border" + side2] = "none";
    style[side1.toLowerCase()] = "0";
    style[side2.toLowerCase()] = "0";
    return (
      <div style={style}/>
    );
  }
}

export function showCorners(node: React.ReactNode): React.ReactNode {
  return (
    <Box>{node}</Box>
  );
}

export function createVariations<P extends {}>(attrs: {
  storyGroup: Story,
  componentClass: React.ComponentClass<P> | React.SFC<P>,
  defaultProps: P | (() => P),
  centerOnPage?: boolean,
  showCorners?: boolean  // default is TRUE
}): (name: string, propOverrides: Partial<P>) => void {
  return (name: string, newProps: Partial<P>) => {
    let defProps: {};
    if (isFunction(attrs.defaultProps)) {
      defProps = (attrs.defaultProps as () => P)();
    } else {
      defProps = (attrs.defaultProps as P);
    }
    const props = { ...defProps, ...(newProps as {}) } as P;
    attrs.storyGroup.add(name, () => {
      let result: React.ReactNode = React.createElement(attrs.componentClass, props);
      if (attrs.showCorners !== false) {
        result = showCorners(result);
      }
      if (attrs.centerOnPage) {
        result = centerOnPage(result);
      }
      return result as JSX.Element;
    });
  };
}

function logStub(msg: string): () => void {
  return () => {
    console.log(msg);
  };
}

export const stubActionManager: Readonly<AllActions> = Object.freeze({
  togglePropertiesView: logStub("togglePropertiesView"),
  closePropertiesView: logStub("closePropertiesView"),
  openFilePicker: logStub("openFilePicker"),
  save: logStub("save"),
  saveAs: logStub("saveAs"),
  importUploadedFile: logStub("importUploadedFile"),
  mergeGoogleSheet: logStub("mergeGoogleSheet"),
  viewAsJSON: logStub("viewAsJSON")
});
