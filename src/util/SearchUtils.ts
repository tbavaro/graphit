import Fuse from "fuse.js";

import { MyNodeDatum } from "../data/MyNodeDatum";

export class NodeSearchHelper {
  private fuse: Fuse<MyNodeDatum>;

  constructor(nodes: ReadonlyArray<MyNodeDatum>) {
    const options: Fuse.FuseOptions<MyNodeDatum> = {
      keys: ["label"],
      tokenize: true,
      matchAllTokens: true,
      threshold: 0.6
    };

    this.fuse = new Fuse(nodes, options);
  }

  public search(query: string): MyNodeDatum[] {
    return this.fuse.search(query);
  }
}
