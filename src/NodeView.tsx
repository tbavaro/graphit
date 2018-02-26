import * as React from 'react';
import * as Interact from 'interactjs';
// import MyNodeDatum from './MyNodeDatum';
import './NodeView.css';

interface Props {
  label: string;
  x: number;
  y: number;
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
    this.setInteractions();
  }

  render() {

    var style = {
      left: this.props.x,
      top: this.props.y
    };
    return (
      <div
        ref={this.ref}
        className="NodeView"
        style={style}
      >
        <div className="NodeView-content">{this.props.label}</div>
      </div>
    );
  }

  private ref = (node: HTMLDivElement) => {
    this.node = node;
  }

  private setInteractions() {
    this.interact = Interact(this.node);
    this.interact.draggable({
      onmove: this.onDragMove
    });
  }

  private onDragMove = (event: Interact.InteractEvent) => {
    console.log(this.dataX, this.dataY);
    var x = this.dataX + event.dx;
    var y = this.dataY + event.dy;
    console.log(x, y);
    event.target.style.transform = "translate(" + x + "px, " + y + "px)";

    this.dataX = x;
    this.dataY = y;
    // console.log("move", event.x0);
  }
}

export default NodeView;
