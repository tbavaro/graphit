import * as React from 'react';
import * as D3 from "d3";
import './Viewport.css';

export interface ZoomState {
  centerX: number;
  centerY: number;
  scale: number;
}

interface Props<DragSubject> {
  initialZoomState?: ZoomState;

  autoTransformedChildren?: any;
  manuallyTransformedChildren?: any;
  onZoom?: (zoomState: ZoomState, transform: string) => void;

  // drag
  dragBehavior?: D3.DragBehavior<any, any, DragSubject>;
  onDrag?: (targetSubject: DragSubject, dx: number, dy: number, isEnd: boolean) => void;
}

export class Viewport<DragSubject> extends React.Component<Props<DragSubject>, object> {
  outerRef?: HTMLDivElement;
  innerRef?: HTMLDivElement;
  zoom = D3.zoom();

  zoomState: ZoomState = this.props.initialZoomState || {
      centerX: 0,
      centerY: 0,
      scale: 1
  };

  componentDidMount() {
    if (!this.innerRef || !this.outerRef) {
      throw new Error("refs not set");
    }

    this.zoom.scaleExtent([0.1, 3]).on("zoom", this.zoomed);

    D3.select(this.outerRef).call(this.zoom).on("dblclick.zoom", null);

    alert(JSON.stringify(this.zoomState));

    this.setCenterPoint(this.zoomState.centerX, this.zoomState.centerY, this.zoomState.scale);
    this.configureDrag();

    // (window as any).moveBy = (dx: number, dy: number) => {
    //   this.setCenterPoint(this.zoomState.centerX + dx, this.zoomState.centerY + dy);
    // };
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
    if (!this.outerRef) {
      throw new Error("refs not set");
    }

    var ev = D3.event as D3.D3ZoomEvent<any, any>;
    var t = ev.transform;

    this.zoomState.centerX = (this.outerRef.clientWidth / 2 - t.x) / t.k;
    this.zoomState.centerY = (this.outerRef.clientHeight / 2 - t.y) / t.k;
    this.zoomState.scale = t.k;

    var transformString = "translate(" + t.x + "px, " + t.y + "px) scale(" + t.k + ")";

    if (this.innerRef) {
      this.innerRef.style.transform = transformString;
    }

    if (this.props.onZoom) {
      this.props.onZoom(this.zoomState, transformString);
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
      var scale = this.zoomState.scale;
      this.props.onDrag(ev.subject, ev.dx / scale, ev.dy / scale, isEnd);
    }
  }

  private onDragMove = () => {
    this.onDragEvent(/*isEnd=*/false);
  }

  private onDragEnd = () => {
    this.onDragEvent(/*isEnd=*/true);
  }

  private setCenterPoint(x: number, y: number, scale?: number) {
    if (!this.outerRef) {
      throw new Error("refs not set");
    }

    var sel = D3.select(this.outerRef);
    this.zoom.translateTo(sel, x, y);

    if (scale !== undefined) {
      this.zoom.scaleTo(sel, scale);
    }
  }
}
