import * as React from 'react';
import * as D3 from "d3";
import './NodeView.css';
import  { ListenerPureComponent, ListenerBinding } from './SingleListenerPureComponent';
import { ListenableSimulationWrapper } from './ListenableSimulation';

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
  position: Position;
  simulation: ListenableSimulationWrapper;
  isSelected: boolean;
  dragBehavior?: D3.DragBehavior<any, number, any>;
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
    return (
      <div
        ref={this.setRef}
        className={"NodeView" + (this.props.isLocked ? " locked" : "") + (this.props.isSelected ? " selected" : "")}
        style={style}
      >
        <div
          className="NodeView-content"
          onDoubleClick={this.onDoubleClick}
          children={this.props.label}
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
