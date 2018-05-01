import * as React from "react";
import * as D3 from "d3";
import { MyLinkDatum, MyNodeDatum } from "./data/MyNodeDatum";
import { Component as NodeView } from "./NodeView";
import { NodeActionManager } from "./NodeView";
import "./GraphViewport.css";
import * as Viewport from "./ui-helpers/Viewport";
import * as LinkRenderers from "./LinkRenderers";
import * as GraphData from "./data/GraphData";

interface SVGLinesComponentProps {
  links: MyLinkDatum[];
  gRef?: (newRef: SVGGElement) => void;
  onClick?: () => void;
}

class SVGLinesComponent extends React.PureComponent<SVGLinesComponentProps, {}> {
  linkRenderer = new LinkRenderers.MiddleArrowDirectedLinkRenderer();

  private _gRef?: SVGGElement;

  render() {
    return (
      <svg
        key="linkLines"
        className="GraphViewport-linkLines"
        onClick={this.props.onClick}
      >
        <defs>
          {this.linkRenderer.renderDefs()}
        </defs>
        <g ref={this._setGRef} style={this.linkRenderer.parentStyle()}>
          {this.linkRenderer.renderLinks(this.props.links)}
        </g>
      </svg>
    );
  }

  public updatePositions(index?: number) {
    if (this._gRef) {
      this.linkRenderer.updateLinkElements(this._gRef, this.props.links);
    }
  }

  private _setGRef = (newRef: SVGGElement) => {
    this._gRef = newRef;
    if (this.props.gRef) {
      this.props.gRef(newRef);
    }
  }
}

export type Props = {
  nodes: MyNodeDatum[];
  links: MyLinkDatum[];
  zoomState: GraphData.ZoomState;
  nodeRenderMode: GraphData.NodeRenderMode;
  onChange?: () => void;
};

type State = {
  selectedNodeIndexes: Set<number>;
};

export class Component extends React.PureComponent<Props, State> {
  state: State = {
    selectedNodeIndexes: new Set()
  };

  private linksViewRef: SVGLinesComponent | null = null;
  private svgRef: SVGGElement | null = null;
  private nodeRefs: Array<NodeView | null> = [];
  private drag = D3.drag<any, any, number>();

  private nodeActionManager: NodeActionManager = {
    onNodeMoved: (index: number, x: number, y: number, stopped: boolean) => {
      var node = this.props.nodes[index];
      node.x = x;
      node.y = y;
      if (stopped && !node.isLocked) {
        node.fx = undefined;
        node.fy = undefined;
      } else {
        node.fx = x;
        node.fy = y;
      }
      this.onChange(index);
    },

    toggleIsLocked: (index: number) => {
      var node = this.props.nodes[index];
      node.isLocked = !node.isLocked;
      node.fx = (node.isLocked ? node.x : undefined);
      node.fy = (node.isLocked ? node.y : undefined);
      this.onChange(index);
    }
  };

  public render() {
    return (
      <Viewport.Viewport
        manuallyTransformedChildren={this.renderLinks()}
        autoTransformedChildren={this.renderNodes()}
        onZoom={this.onViewportZoom}
        dragBehavior={this.drag}
        onDrag={this.onDrag}
        onDragStart={this.onDragStart}
        initialZoomState={this.props.zoomState}
      />
    );
  }

  private setLinksViewRef = (newRef: SVGLinesComponent | null) => this.linksViewRef = newRef;

  private renderLinks() {
    return (
      <SVGLinesComponent
        ref={this.setLinksViewRef}
        links={this.props.links}
        onClick={this.deselectAll}
        gRef={this.setSvgRef}
      />
    );
  }

  private renderNodes() {
    // if the number of nodes has changed, truncate/pad nodeRefs with nulls
    if (this.nodeRefs.length !== this.props.nodes.length) {
      const oldNodeRefs = this.nodeRefs;
      this.nodeRefs = this.props.nodes.map(
        (_, i) => (i < oldNodeRefs.length ? oldNodeRefs[i] : null)
      );
    }

    return this.props.nodes.map((node: MyNodeDatum, index: number) => (
      <NodeView
        key={"node." + index}
        ref={(newRef) => this.nodeRefs[index] = newRef}
        actionManager={this.nodeActionManager}
        id={index}
        label={node.label}
        isLocked={node.isLocked}
        color={node.color || undefined}
        renderMode={this.props.nodeRenderMode}
        initialX={node.x || 0}
        initialY={node.y || 0}
        isSelected={this.state.selectedNodeIndexes.has(index)}
        dragBehavior={this.drag}
      />
    ));
  }

  public updatePositions(index?: number) {
    let start: number, end: number;
    if (index === undefined) {
      start = 0;
      end = this.nodeRefs.length;
    } else {
      start = index;
      end = index + 1;
    }
    for (var i = start; i < end; ++i) {
      const nodeRef = this.nodeRefs[i];
      if (nodeRef !== null) {
        const node = this.props.nodes[i];
        nodeRef.setPosition(node.x || 0, node.y || 0);
      }
    }
    if (this.linksViewRef !== null) {
      this.linksViewRef.updatePositions(index);
    }
  }

  private setSvgRef = (newRef: SVGGElement | null) => {
    this.svgRef = newRef;
  }

  private onViewportZoom = (zoomState: Viewport.ZoomState, transform: string) => {
    const dzs = this.props.zoomState;
    dzs.centerX = zoomState.centerX;
    dzs.centerY = zoomState.centerY;
    dzs.scale = zoomState.scale;

    if (this.svgRef) {
      this.svgRef.style.transform = transform;
    }
  }

  private onDrag = (index: number, dx: number, dy: number, isEnd: boolean) => {
    this.state.selectedNodeIndexes.forEach(i => {
      const node = this.props.nodes[i];

      if (dx !== 0 || dy !== 0) {
        node.isLocked = true;
      }

      node.x = (node.x || 0) + dx;
      node.y = (node.y || 0) + dy;
      if (isEnd && !node.isLocked) {
        node.fx = undefined;
        node.fy = undefined;
      } else {
        node.fx = node.x;
        node.fy = node.y;
      }
    });

    if (dx !== 0 || dy !== 0) {
      this.onChange();
    }
  }

  private onDragStart = (index: number, metaKey: boolean) => {
    var newSelectedNodeIndexes: Set<number> | undefined;
    if (!metaKey) {
      // if the node is already selected, don't do anything else
      if (!this.state.selectedNodeIndexes.has(index)) {
        newSelectedNodeIndexes = new Set([index]);
      }
    } else {
      newSelectedNodeIndexes = new Set(this.state.selectedNodeIndexes);
      if (newSelectedNodeIndexes.has(index) && newSelectedNodeIndexes.size > 1) {
        newSelectedNodeIndexes.delete(index);
      } else {
        newSelectedNodeIndexes.add(index);
      }
    }

    if (newSelectedNodeIndexes) {
      this.setState({
        selectedNodeIndexes: newSelectedNodeIndexes
      });
    }

    this.onDrag(index, 0, 0, false);
  }

  private deselectAll = () => {
    this.setState({
      selectedNodeIndexes: new Set()
    });
  }

  private onChange = (index?: number) => {
    if (this.props.onChange) {
      this.props.onChange();
    }
    this.updatePositions(index);
  }
}
