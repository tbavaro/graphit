import { Datastore } from "src/data/Datastore";
import GooglePickerHelper from "src/google/GooglePickerHelper";
import * as NavDrawerContents from "src/ui-structure/NavDrawerContents";

export type Actions = NavDrawerContents.Actions;

export interface SideEffects {
  loadDocumentById: (id: string) => void;
}

export default class ActionManager implements Actions {
  private datastore: Datastore;
  private sideEffects: SideEffects;

  constructor(datastore: Datastore, sideEffects: SideEffects) {
    this.datastore = datastore;
    this.sideEffects = sideEffects;
  }

  // sign in/out
  public signIn = () => this.datastore.signIn();
  public signOut = () => this.datastore.signOut();

  // open things
  public openFromGoogle = () => {
    new GooglePickerHelper().createAnythingPicker((fileResult) => {
      alert("open from google");
      this.sideEffects.loadDocumentById(fileResult.id);
    });
  }
}
