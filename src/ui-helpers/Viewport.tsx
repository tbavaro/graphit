import * as React from 'react';
import * as D3 from "d3";
import './Viewport.css';

export interface ZoomState {
  centerX: number;
  centerY: number;
  scale: number;
}

function defaultZoomState(): ZoomState {
  return {
    centerX: 0,
    centerY: 0,
    scale: 1
  };
}

interface Props<DragSubject> {
  initialZoomState?: ZoomState;

  autoTransformedChildren?: any;
  manuallyTransformedChildren?: any;
  onZoom?: (zoomState: ZoomState, transform: string) => void;

  // drag
  dragBehavior?: D3.DragBehavior<any, any, DragSubject>;
  onDrag?: (targetSubject: DragSubject, dx: number, dy: number, isEnd: boolean) => void;
  onDragStart?: (targetSubject: DragSubject, metaKey: boolean) => void;
}

export class Viewport<DragSubject> extends React.Component<Props<DragSubject>, object> {
  outerRef?: HTMLDivElement;
  innerRef?: HTMLDivElement;
  zoom = D3.zoom();

  zoomState: ZoomState = this.props.initialZoomState || defaultZoomState();

  componentDidMount() {
    if (!this.innerRef || !this.outerRef) {
      throw new Error("refs not set");
    }

    this.zoom.scaleExtent([0.1, 3]).on("zoom", this.zoomed);

    D3.select(this.outerRef).call(this.zoom).on("dblclick.zoom", null);
    this.setZoomState(this.props.initialZoomState || defaultZoomState());

    this.configureDrag();
  }

  componentDidUpdate(prevProps: Readonly<Props<DragSubject>>) {
    this.configureDrag();
  }

  componentWillReceiveProps(newProps: Props<DragSubject>) {
    if (this.props.initialZoomState !== newProps.initialZoomState) {
      this.setZoomState(newProps.initialZoomState || defaultZoomState());
    }
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
      drag.on("start", this.onDragStart);
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

  private onDragStart = () => {
    var ev = D3.event as D3.D3DragEvent<any, any, DragSubject>;
    if (this.props.onDragStart) {
      this.props.onDragStart(ev.subject, ev.sourceEvent.metaKey);
    }
  }

  private onDragMove = () => {
    this.onDragEvent(/*isEnd=*/false);
  }

  private onDragEnd = () => {
    this.onDragEvent(/*isEnd=*/true);
  }

  // private setCenterPoint(x: number, y: number, scale?: number) {
  private setZoomState(zoomState: ZoomState) {
    if (!this.outerRef) {
      throw new Error("refs not set");
    }

    this.zoomState = zoomState;

    var sel = D3.select(this.outerRef);
    var scale = zoomState.scale;
    this.zoom.translateTo(sel, zoomState.centerX, zoomState.centerY);
    this.zoom.scaleTo(sel, scale);
  }
}
