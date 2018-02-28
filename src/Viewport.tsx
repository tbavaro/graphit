import * as React from 'react';
import * as D3 from "d3";
import * as D3Selection from "d3-selection";
import * as D3Zoom from "d3-zoom";
import './Viewport.css';

interface Props {
  autoTransformedChildren?: any;
  manuallyTransformedChildren?: any;
  onZoom?: (transform: string) => void;
  innerRef?: (ref: HTMLDivElement) => void;
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

    D3Selection.select(this.outerRef).call(zoom).on("dblclick.zoom", null);
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
    if (this.props.innerRef) {
      this.props.innerRef(newRef);
    }
  }

  private zoomed = () => {
    var ev = D3.event as D3.D3ZoomEvent<any, any>;
    var t = ev.transform;
    var transformString = "translate(" + t.x + "px, " + t.y + "px) scale(" + t.k + ")";

    if (this.innerRef) {
      this.innerRef.style.transform = transformString;
    }

    if (this.props.onZoom) {
      this.props.onZoom(transformString);
    }
  }
}

export default Viewport;
