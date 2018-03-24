import * as React from 'react';
import * as D3 from "d3";
import './NodeView.css';
import  { ListenerPureComponent, ListenerBinding } from './ui-helpers/ListenerPureComponent';
import { ListenableSimulationWrapper } from './ListenableSimulation';
import { NodeRenderMode } from './data/GraphDocument';
import { sanitizeForDisplay } from './util/HtmlSanitization';

export interface NodeActionManager {
  onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => void;
  toggleIsLocked: (id: number) => void;
}

export interface Position {
  x: number;
  y: number;
}

interface Props {
  actionManager?: NodeActionManager;
  id: number;
  label: string;
  isLocked: boolean;
  color?: string;
  position: Position;
  simulation: ListenableSimulationWrapper;
  isSelected: boolean;
  dragBehavior?: D3.DragBehavior<any, number, any>;
  renderMode: NodeRenderMode;
}

export class Component extends ListenerPureComponent<Props, object> {
  protected readonly bindings: ListenerBinding<Props>[] = [
    {
      propertyName: "simulation",
      eventType: "tick",
      callback: () => this.onSignal()
    }
  ];

  ref?: HTMLDivElement;

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

  componentWillReceiveProps(newProps: Readonly<Props>) {
    // clear old drag behavior if it's changing
    if (this.ref && this.props.dragBehavior !== newProps.dragBehavior) {
      D3.select(this.ref).on(".drag", null);
    }

    super.componentWillReceiveProps(newProps);
  }

  render() {
    var style = {
      left: this.props.position.x,
      top: this.props.position.y,
      transform: ""
    };
    var children: string | undefined;
    var innerHTML: { __html: string } | undefined;
    switch (this.props.renderMode) {
      case NodeRenderMode.RAW_HTML:
        innerHTML = { __html: sanitizeForDisplay(this.props.label) };
        break;

      case NodeRenderMode.BASIC:
      default:
        children = this.props.label;
        break;
    }
    var contentStyle = {
      backgroundColor: this.props.isSelected ? undefined : this.props.color
    };
    return (
      <div
        ref={this.setRef}
        className={"NodeView" + (this.props.isLocked ? " locked" : "") + (this.props.isSelected ? " selected" : "")}
        style={style}
      >
        <div
          style={contentStyle}
          className="NodeView-content"
          onDoubleClick={this.onDoubleClick}
          children={children}
          dangerouslySetInnerHTML={innerHTML}
        />
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

  protected onSignal() {
    if (this.ref) {
      this.ref.style.left = this.props.position.x + "px";
      this.ref.style.top = this.props.position.y + "px";
    }
  }
}
