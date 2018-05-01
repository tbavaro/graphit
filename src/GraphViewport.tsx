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

  public updatePositions() {
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
  selectedNodes: Set<MyNodeDatum>;
};

export class Component extends React.PureComponent<Props, State> {
  state: State = {
    selectedNodes: new Set()
  };

  private renderNodes = true;
  private renderLinks = true;

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
      this.onChange();
    },

    toggleIsLocked: (id: number) => {
      var node = this.props.nodes[id];
      node.isLocked = !node.isLocked;
      node.fx = (node.isLocked ? node.x : undefined);
      node.fy = (node.isLocked ? node.y : undefined);
      this.onChange();
      // this.forceUpdate();
    }
  };

  componentWillMount() {
    this.reconfigure();
    if (super.componentWillMount) {
      super.componentWillMount();
    }
  }

  componentWillReceiveProps?(nextProps: Readonly<Props>, nextContext: any): void {
    this.reconfigure();
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(nextProps, nextContext);
    }
  }

  public render() {
    var nodeViews = (!this.renderNodes ? "" : this.props.nodes.map(this.renderNode));

    return (
      <Viewport.Viewport
        manuallyTransformedChildren={
          this.renderLinks
            ? (
                <SVGLinesComponent
                  ref={this.setLinksViewRef}
                  links={this.props.links}
                  onClick={this.deselectAll}
                  gRef={this.setSvgRef}
                />
              )
            : ""
        }
        autoTransformedChildren={nodeViews}
        onZoom={this.onViewportZoom}
        dragBehavior={this.drag}
        onDrag={this.onDrag}
        onDragStart={this.onDragStart}
        initialZoomState={this.props.zoomState}
      />
    );
  }

  private setLinksViewRef = (newRef: SVGLinesComponent | null) => this.linksViewRef = newRef;

  private reconfigure() {
    if (this.nodeRefs.length !== this.props.nodes.length) {
      const oldNodeRefs = this.nodeRefs;
      this.nodeRefs = this.props.nodes.map((_, i) => (i < oldNodeRefs.length ? oldNodeRefs[i] : null));
    }
  }

  private renderNode = (node: MyNodeDatum, index: number) => {
    return (
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
        isSelected={this.state.selectedNodes.has(node)}
        dragBehavior={this.drag}
      />
    );
  }

  public updatePositions() {
    for (var i = 0; i < this.nodeRefs.length; ++i) {
      const nodeRef = this.nodeRefs[i];
      if (nodeRef !== null) {
        const node = this.props.nodes[i];
        nodeRef.setPosition(node.x || 0, node.y || 0);
      }
    }
    if (this.linksViewRef !== null) {
      this.linksViewRef.updatePositions();
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
    this.state.selectedNodes.forEach((node) => {
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
    var node = this.props.nodes[index];

    var newSelectedNodes: Set<MyNodeDatum> | undefined;
    if (!metaKey) {
      // if the node is already selected, don't do anything else
      if (!this.state.selectedNodes.has(node)) {
        newSelectedNodes = new Set([node]);
      }
    } else {
      newSelectedNodes = new Set(this.state.selectedNodes);
      if (newSelectedNodes.has(node) && newSelectedNodes.size > 1) {
        newSelectedNodes.delete(node);
      } else {
        newSelectedNodes.add(node);
      }
    }

    if (newSelectedNodes) {
      this.setState({
        selectedNodes: newSelectedNodes
      });
    }

    this.onDrag(index, 0, 0, false);
  }

  private deselectAll = () => {
    this.setState({
      selectedNodes: new Set()
    });
  }

  private onChange = () => {
    if (this.props.onChange) {
      this.props.onChange();
    }
    this.updatePositions();
  }
}
