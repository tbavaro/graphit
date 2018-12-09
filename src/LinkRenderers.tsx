import * as React from "react";
import { MyLinkDatum, MyNodeDatum } from './data/MyNodeDatum';

export abstract class LinkRenderer {
  renderDefs(): any {
    return undefined;
  }

  parentStyle(): React.CSSProperties {
    return {};
  }

  abstract renderLinks(links: MyLinkDatum[]): any;
  abstract updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]): void;
}

export class BasicLinkRenderer extends LinkRenderer {
  renderLinks(links: MyLinkDatum[]) {
    return links.map((link, index) => {
      var source = link.source as MyNodeDatum;
      var target = link.target as MyNodeDatum;
      return (
        <line
          key={"link." + index}
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
        />
      );
    });
  }

  updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]) {
    var linkElements: SVGLineElement[] = (parentElement.children as any);
    links.forEach((link, index) => {
      var linkElement = linkElements[index];
      var source = (link.source as MyNodeDatum);
      var target = (link.target as MyNodeDatum);
      linkElement.setAttribute("x1", (source.x || 0) + "px");
      linkElement.setAttribute("y1", (source.y || 0) + "px");
      linkElement.setAttribute("x2", (target.x || 0) + "px");
      linkElement.setAttribute("y2", (target.y || 0) + "px");
    });
  }
}

export class MiddleArrowDirectedLinkRenderer extends LinkRenderer {
  renderDefs(): any {
    return (
      <marker
        id="arrow"
        viewBox="0 -5 10 10"
        refX="5"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path d="M 0 -5 L 10 0 L 0 5"/>
      </marker>
    );
  }

  parentStyle() {
    return {
      markerMid: "url(#arrow)"
    };
  }

  private static pathFor(link: MyLinkDatum): string {
    var source = link.source as MyNodeDatum;
    var target = link.target as MyNodeDatum;
    var x0 = source.x || 0;
    var y0 = source.y || 0;
    var x2 = target.x || 0;
    var y2 = target.y || 0;
    var x1 = (x0 + x2) / 2;
    var y1 = (y0 + y2) / 2;
    return [
      "M", x0, y0,
      "L", x1, y1,
      "L", x2, y2
    ].join(" ");
  }

  renderLinks(links: MyLinkDatum[]) {
    return links.map((link, index) => {
      return (
        <path
          key={"link." + index}
          d={MiddleArrowDirectedLinkRenderer.pathFor(link)}
          className={link.stroke === "dashed" ? "stroke-dashed" : undefined}
        />
      );
    });
  }

  updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[], index?: number) {
    var linkElements: SVGLineElement[] = (parentElement.children as any);
    let start: number, end: number;
    if (index === undefined) {
      start = 0;
      end = links.length;
    } else {
      start = index;
      end = index + 1;
    }
    for (let i = start; i < end; ++i) {
      const link = links[i];
      linkElements[i].setAttribute("d", MiddleArrowDirectedLinkRenderer.pathFor(link));
    }
  }
}

export class RightAngleLinkRenderer extends LinkRenderer {
  private static pathFor(link: MyLinkDatum): string {
    var source = link.source as MyNodeDatum;
    var target = link.target as MyNodeDatum;
    var x0 = source.x || 0;
    var y0 = source.y || 0;
    var x3 = target.x || 0;
    var y3 = target.y || 0;
    var x1: number;
    var y1: number;
    var x2: number;
    var y2: number;
    var deltaX = x3 - x0;
    var deltaY = y3 - y0;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      x1 = x0 + deltaX / 2;
      y1 = y0;
      x2 = x1;
      y2 = y3;
    } else {
      x1 = x0;
      y1 = y0 + deltaY / 2;
      x2 = x3;
      y2 = y1;
    }
    return [
      "M", x0, y0,
      "L", x1, y1,
      "L", x2, y2,
      "L", x3, y3
    ].join(" ");
  }

  renderLinks(links: MyLinkDatum[]) {
    return links.map((link, index) => {
      return (
        <path
          key={"link." + index}
          d={RightAngleLinkRenderer.pathFor(link)}
        />
      );
    });
  }

  updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]) {
    var linkElements: SVGLineElement[] = (parentElement.children as any);
    links.forEach((link, index) => {
      linkElements[index].setAttribute("d", RightAngleLinkRenderer.pathFor(link));
    });
  }
}
