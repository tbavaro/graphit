import * as classNames from "classnames";
import * as React from 'react';
import * as D3 from "d3";
import './NodeView.css';
import { Document } from './data/GraphData';
import { sanitizeForDisplay } from './util/HtmlSanitization';

export interface NodeActionManager {
  onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => void;
  toggleIsLocked: (id: number) => void;
}

type SharedProps = {
  renderMode: Document["displayConfig"]["nodeRenderMode"];
  label: string;
  color?: string;
  isLocked: boolean;
  isSelected: boolean;
};

export type InnerProps = SharedProps & {
  onDoubleClick?: () => void;
  extraStyle?: React.CSSProperties;
};

type Props = SharedProps & {
  actionManager?: NodeActionManager;
  id: number;
  initialX: number;
  initialY: number;
  dragBehavior?: D3.DragBehavior<any, number, any>;
};

export class InnerComponent extends React.Component<InnerProps, {}> {
  render() {
    var children: string | undefined;
    var innerHTML: { __html: string } | undefined;
    switch (this.props.renderMode) {
      case "raw_html":
        innerHTML = { __html: sanitizeForDisplay(this.props.label) };
        break;

      case "basic":
      default:
        children = this.props.label;
        break;
    }
    var contentStyle = {
      backgroundColor: this.props.isSelected ? undefined : this.props.color,
      ...this.props.extraStyle
    };
    return (
      <div
        style={contentStyle}
        className={classNames(
          "NodeView-content",
          {
            "locked": this.props.isLocked,
            "selected": this.props.isSelected
          }
        )}
        onDoubleClick={this.props.onDoubleClick}
        children={children}
        dangerouslySetInnerHTML={innerHTML}
      />
    );
  }
}

export class Component extends React.PureComponent<Props, {}> {
  ref?: HTMLDivElement;

  // not using State because we explicitly don't want to re-render
  private x: number = this.props.initialX;
  private y: number = this.props.initialY;

  componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    if (!this.ref) {
      throw new Error("ref not set");
    }

    var sel = D3.select(this.ref);
    sel.datum(this.props.id);

    if (this.props.dragBehavior) {
      sel.call(this.props.dragBehavior);
    }
  }

  componentWillReceiveProps(newProps: Readonly<Props>, nextContext: any) {
    // clear old drag behavior if it's changing
    if (this.ref && this.props.dragBehavior !== newProps.dragBehavior) {
      D3.select(this.ref).on(".drag", null);
    }

    if (newProps.initialX !== this.props.initialX || newProps.initialY !== this.props.initialY) {
      this.setPosition(newProps.initialX, newProps.initialY);
    }

    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps, nextContext);
    }
  }

  render() {
    var style = { transform: "" };
    this.updateStyleForPosition(style);
    const innerComponent = React.createElement(InnerComponent, {
      ...this.props as InnerProps,
      onDoubleClick: this.onDoubleClick
    });
    return (
      <div
        ref={this.setRef}
        className={"NodeView"}
        style={style}
      >
        {innerComponent}
      </div>
    );
  }

  private setRef = (newRef: HTMLDivElement) => {
    this.ref = newRef;
  }

  private onDoubleClick = () => {
    if (this.props.actionManager) {
      this.props.actionManager.toggleIsLocked(this.props.id);
    }
  }

  private updateStyleForPosition(style: React.CSSProperties | CSSStyleDeclaration) {
    style.left = `${this.x}px`;
    style.top = `${this.y}px`;
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    if (this.ref) {
      this.updateStyleForPosition(this.ref.style);
    }
  }
}
