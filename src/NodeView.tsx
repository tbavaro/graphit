import * as React from 'react';
import * as D3 from "d3";
import './NodeView.css';
import { SimpleListenable } from './Listenable';
import SingleListenerPureComponent from './SingleListenerPureComponent';

export interface NodeActionManager {
  onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => void;
  toggleIsLocked: (id: number) => void;
}

export class ListenablePosition extends SimpleListenable {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    (this as any).x = x;
    (this as any).y = y;
    this.triggerListeners();
  }
}

interface Props {
  actionManager?: NodeActionManager;
  id: number;
  label: string;
  isLocked: boolean;
  position: ListenablePosition;
  isSelected: boolean;
  dragBehavior?: D3.DragBehavior<any, number, any>;
}

export class Component extends SingleListenerPureComponent<Props, object> {
  protected readonly _listenerFieldName = "position";

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

  // private setInteractions() {
  //   this.interact = Interact(this.node);
  //   this.interact.draggable({
  //     onmove: this.onDragMove,
  //     onend: this.onDragEnd,
  //     stop
  //   }).preventDefault("always");
  // }

  // private onDragMove = (event: Interact.InteractEvent) => {
  //   this.dataX += event.dx / this.props.viewportZoom;
  //   this.dataY += event.dy / this.props.viewportZoom;

  //   // event.target.style.transform = "translate(" + this.dataX + "px, " + this.dataY + "px)";

  //   this.triggerOnNodeMoved(/*stopped=*/false);
  // }

  // private onDragEnd = (event: Interact.InteractEvent) => {
  //   this.triggerOnNodeMoved(/*stopped=*/true);
  // }

  // private triggerOnNodeMoved(stopped: boolean) {
  //   if (this.props.actionManager) {
  //     this.props.actionManager.onNodeMoved(
  //       this.props.id,
  //       this.props.x + this.dataX,
  //       this.props.y + this.dataY,
  //       stopped);
  //   }
  // }

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
