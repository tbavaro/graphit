import * as React from 'react';
import * as D3 from "d3";
import './NodeView.css';

export interface NodeActionManager {
  onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => void;
  toggleIsLocked: (id: number) => void;
}

interface Props {
  actionManager?: NodeActionManager;
  id: number;
  label: string;
  isLocked: boolean;
  x: number;
  y: number;
  isSelected: boolean;
  dragBehavior?: D3.DragBehavior<any, number, any>;
}

class NodeView extends React.PureComponent<Props, object> {
  ref?: HTMLDivElement;

  componentDidMount() {
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
  }

  render() {
    var style = {
      left: this.props.x,
      top: this.props.y,
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
}

export default NodeView;
