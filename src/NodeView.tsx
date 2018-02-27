import * as React from 'react';
import * as Interact from 'interactjs';
// import MyNodeDatum from './MyNodeDatum';
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
  viewportZoom: number;
}

class NodeView extends React.Component<Props, object> {
  node: HTMLDivElement;
  interact: Interact.Interactable;
  dataX = 0;
  dataY = 0;

  componentDidMount() {
    this.setInteractions();
  }

  componentWillReceiveProps() {
    this.dataX = 0;
    this.dataY = 0;
    this.setInteractions();
  }

  render() {
    var style = {
      left: this.props.x,
      top: this.props.y,
      transform: ""
    };
    return (
      <div
        ref={this.ref}
        className={"NodeView" + (this.props.isLocked ? " locked" : "")}
        style={style}
      >
        <div className="NodeView-content" onDoubleClick={this.onDoubleClick}>{this.props.label}</div>
      </div>
    );
  }

  private ref = (node: HTMLDivElement) => {
    this.node = node;
  }

  private setInteractions() {
    this.interact = Interact(this.node);
    this.interact.draggable({
      onmove: this.onDragMove,
      onend: this.onDragEnd
    });
  }

  private onDragMove = (event: Interact.InteractEvent) => {
    this.dataX += event.dx / this.props.viewportZoom;
    this.dataY += event.dy / this.props.viewportZoom;

    event.target.style.transform = "translate(" + this.dataX + "px, " + this.dataY + "px)";

    this.triggerOnNodeMoved(/*stopped=*/false);
  }

  private onDragEnd = (event: Interact.InteractEvent) => {
    this.triggerOnNodeMoved(/*stopped=*/true);
  }

  private triggerOnNodeMoved(stopped: boolean) {
    if (this.props.actionManager) {
      this.props.actionManager.onNodeMoved(
        this.props.id,
        this.props.x + this.dataX,
        this.props.y + this.dataY,
        stopped);
    }
  }

  private onDoubleClick = () => {
    if (this.props.actionManager) {
      this.props.actionManager.toggleIsLocked(this.props.id);
    }
  }
}

export default NodeView;
