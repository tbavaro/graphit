import * as React from "react";
import { MyLinkDatum, MyNodeDatum } from "./data/MyNodeDatum";

export abstract class LinkRenderer {
  public renderDefs(): any {
    return undefined;
  }

  public parentStyle(): React.CSSProperties {
    return {};
  }

  public abstract renderLinks(links: MyLinkDatum[]): any;
  public abstract updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]): void;
}

export class BasicLinkRenderer extends LinkRenderer {
  public renderLinks(links: MyLinkDatum[]) {
    return links.map((link, index) => {
      const source = link.source as MyNodeDatum;
      const target = link.target as MyNodeDatum;
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

  public updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]) {
    const linkElements: SVGLineElement[] = (parentElement.children as any);
    links.forEach((link, index) => {
      const linkElement = linkElements[index];
      const source = (link.source as MyNodeDatum);
      const target = (link.target as MyNodeDatum);
      linkElement.setAttribute("x1", (source.x || 0) + "px");
      linkElement.setAttribute("y1", (source.y || 0) + "px");
      linkElement.setAttribute("x2", (target.x || 0) + "px");
      linkElement.setAttribute("y2", (target.y || 0) + "px");
    });
  }
}

export class MiddleArrowDirectedLinkRenderer extends LinkRenderer {
  public renderDefs(): any {
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

  public parentStyle() {
    return {
      markerMid: "url(#arrow)"
    };
  }

  private static pathFor(link: MyLinkDatum): string {
    const source = link.source as MyNodeDatum;
    const target = link.target as MyNodeDatum;
    const x0 = source.x || 0;
    const y0 = source.y || 0;
    const x2 = target.x || 0;
    const y2 = target.y || 0;
    const x1 = (x0 + x2) / 2;
    const y1 = (y0 + y2) / 2;
    return [
      "M", x0, y0,
      "L", x1, y1,
      "L", x2, y2
    ].join(" ");
  }

  public renderLinks(links: MyLinkDatum[]) {
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

  public updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[], index?: number) {
    const linkElements: SVGLineElement[] = (parentElement.children as any);
    let start: number;
    let end: number;
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
    const source = link.source as MyNodeDatum;
    const target = link.target as MyNodeDatum;
    const x0 = source.x || 0;
    const y0 = source.y || 0;
    const x3 = target.x || 0;
    const y3 = target.y || 0;
    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;
    const deltaX = x3 - x0;
    const deltaY = y3 - y0;
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

  public renderLinks(links: MyLinkDatum[]) {
    return links.map((link, index) => {
      return (
        <path
          key={"link." + index}
          d={RightAngleLinkRenderer.pathFor(link)}
        />
      );
    });
  }

  public updateLinkElements(parentElement: SVGGElement, links: MyLinkDatum[]) {
    const linkElements: SVGLineElement[] = (parentElement.children as any);
    links.forEach((link, index) => {
      linkElements[index].setAttribute("d", RightAngleLinkRenderer.pathFor(link));
    });
  }
}
