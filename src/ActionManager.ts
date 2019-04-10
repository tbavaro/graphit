import { Datastore } from "./data/Datastore";
import GooglePickerHelper, { SPREADSHEET_MIME_TYPE } from "./google/GooglePickerHelper";
import * as NavDrawerContents from "./ui-structure/NavDrawerContents";

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
      if (fileResult.mimeType === SPREADSHEET_MIME_TYPE) {
        alert("loading spreadsheets not yet supported");
      } else {
        this.sideEffects.loadDocumentById(fileResult.id);
      }
    });
  }
}
