import { Datastore } from "src/data/Datastore";
import * as NavDrawerContents from "src/ui-structure/NavDrawerContents";

export type Actions = NavDrawerContents.Actions;

export default class ActionManager implements Actions {
  private datastore: Datastore;

  constructor(datastore: Datastore) {
    this.datastore = datastore;
  }

  public signIn = () => this.datastore.signIn();
  public signOut = () => this.datastore.signOut();
}
