import * as React from 'react';
import * as D3 from "d3";
import './Viewport.css';

interface Props<DragSubject> {
  autoTransformedChildren?: any;
  manuallyTransformedChildren?: any;
  onZoom?: (transform: string) => void;

  // drag
  dragBehavior?: D3.DragBehavior<any, any, DragSubject>;
  onDrag?: (targetSubject: DragSubject, dx: number, dy: number, isEnd: boolean) => void;
}

class Viewport<DragSubject> extends React.Component<Props<DragSubject>, object> {
  outerRef?: HTMLDivElement;
  innerRef?: HTMLDivElement;
  zoom = D3.zoom();

  currentScale = 1;

  componentDidMount() {
    if (!this.innerRef || !this.outerRef) {
      throw new Error("refs not set");
    }

    this.zoom.scaleExtent([0.1, 3]).on("zoom", this.zoomed);

    D3.select(this.outerRef).call(this.zoom).on("dblclick.zoom", null);

    this.setCenterPoint(0, 0);
    this.configureDrag();
  }

  componentDidUpdate(prevProps: Readonly<Props<DragSubject>>) {
    this.configureDrag();
  }

  render() {
    return (
      <div className="Viewport" ref={this.setOuterRef}>
        {this.props.manuallyTransformedChildren}
        <div className="Viewport-contents" ref={this.setInnerRef}>
          {this.props.autoTransformedChildren}
        </div>
      </div>
    );
  }

  private setOuterRef = (newRef: HTMLDivElement) => {
    this.outerRef = newRef;
  }

  private setInnerRef = (newRef: HTMLDivElement) => {
    this.innerRef = newRef;
  }

  private zoomed = () => {
    var ev = D3.event as D3.D3ZoomEvent<any, any>;
    var t = ev.transform;

    this.currentScale = t.k;

    var transformString = "translate(" + t.x + "px, " + t.y + "px) scale(" + t.k + ")";

    if (this.innerRef) {
      this.innerRef.style.transform = transformString;
    }

    if (this.props.onZoom) {
      this.props.onZoom(transformString);
    }
  }

  private assertInnerRef(): HTMLDivElement {
    if (!this.innerRef) {
      throw new Error("innerRef not set");
    }

    return this.innerRef;
  }

  private configureDrag() {
    var drag = this.props.dragBehavior;
    if (drag) {
      drag.container(this.assertInnerRef());
      drag.on("drag", this.onDragMove);
      drag.on("end", this.onDragEnd);
    }
  }

  private onDragEvent = (isEnd: boolean) => {
    var ev = D3.event as D3.D3DragEvent<any, any, DragSubject>;
    if (this.props.onDrag) {
      this.props.onDrag(ev.subject, ev.dx / this.currentScale, ev.dy / this.currentScale, isEnd);
    }
  }

  private onDragMove = () => {
    this.onDragEvent(/*isEnd=*/false);
  }

  private onDragEnd = () => {
    this.onDragEvent(/*isEnd=*/true);
  }

  private setCenterPoint(x: number, y: number) {
    if (!this.outerRef) {
      throw new Error("refs not set");
    }

    this.zoom.translateTo(D3.select(this.outerRef), x, y);
  }
}

export default Viewport;
