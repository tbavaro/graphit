import { Datastore } from "./data/Datastore";
import * as GooglePickerHelper from "./google/GooglePickerHelper";
import * as NavDrawerContents from "./ui-structure/NavDrawerContents";
import * as PropertiesDrawerContents from "./ui-structure/PropertiesDrawerContents";

export type Actions = NavDrawerContents.Actions & PropertiesDrawerContents.Actions;

export interface SideEffects {
  loadDocumentById: (id: string) => void;
  importOrMergeGoogleSheet: (fileResult: GooglePickerHelper.FileResult, shouldMerge: boolean) => void;
  save: () => void;
  saveAs: () => void;
  closeRightDrawer: () => void;
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
    new GooglePickerHelper.default().createAnythingPicker((fileResult) => {
      if (fileResult.mimeType === GooglePickerHelper.SPREADSHEET_MIME_TYPE) {
        this.sideEffects.importOrMergeGoogleSheet(fileResult, /*shouldMerge=*/false);
      } else {
        this.sideEffects.loadDocumentById(fileResult.id);
      }
    });
  }

  public mergeGoogleSheet = () => {
    new GooglePickerHelper.default().createGoogleSheetPicker((fileResult) => {
      this.sideEffects.importOrMergeGoogleSheet(fileResult, /*shouldMerge=*/true);
    });
  }

  // save things
  public save = () => this.sideEffects.save()
  public saveAs = () => this.sideEffects.saveAs()

  // trigger UI events
  public closePropertiesDrawer = () => this.sideEffects.closeRightDrawer()
}
