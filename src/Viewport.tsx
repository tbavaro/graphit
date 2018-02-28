import * as React from 'react';
import * as D3 from "d3";
import * as D3Selection from "d3-selection";
import * as D3Zoom from "d3-zoom";
import './Viewport.css';

interface Props {
  autoTransformedChildren?: any;
  manuallyTransformedChildren?: any;
  onZoom?: (ev: D3Zoom.D3ZoomEvent<any, any>) => void;
}

class Viewport extends React.Component<Props, object> {
  outerRef?: HTMLDivElement;
  innerRef?: HTMLDivElement;

  componentDidMount() {
    if (!this.outerRef) {
      throw new Error("ref not set");
    }

    var zoom = D3Zoom.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", this.zoomed);

    D3Selection.select(this.outerRef).call(zoom);
  }

  render() {
    return (
      <div className="Viewport" ref={this.setOuterRef}>
        <div className="Viewport-contents" ref={this.setInnerRef}>
          {this.props.autoTransformedChildren}
        </div>
        {this.props.manuallyTransformedChildren}
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

    if (this.innerRef) {
      var t = ev.transform;
      this.innerRef.style.transform = "translate(" + t.x + "px, " + t.y + "px) scale(" + t.k + ")";
    }

    if (this.props.onZoom) {
      this.props.onZoom(ev);
    }
  }
}

export default Viewport;
