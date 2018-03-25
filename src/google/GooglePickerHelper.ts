import * as GoogleApi from "../google/GoogleApi";

export const GRAPHIT_MIME_TYPE = "application/me.timba.graphit+json";
export const SPREADSHEET_MIME_TYPE = "application/vnd.google-apps.spreadsheet";

const JSON_MIME_TYPES = [
  GRAPHIT_MIME_TYPE,
  "application/json"
];

export interface FileResult {
  id: string;
  mimeType: string;
  name: string;
  downloadUrl: string;
}

type PickerConfig = {
  type: "files",
  mimeTypes: string[]
} | {
  type: "spreadsheets"
};

export default class GooglePickerHelper {
  constructor() {
    GoogleApi.pickerSingleton();
  }

  private createPicker(attrs: {
    configs: PickerConfig[];
    onPicked: (file: FileResult) => void;
  }) {
    var callback = (data) => {
      if (data.action === "picked") {
        if (data.docs.length !== 1) {
          throw new Error("expected just one result, got " + data.docs.length);
        }
        var docResult = data.docs[0];
        attrs.onPicked({
          id: docResult.id,
          name: docResult.name,
          downloadUrl: docResult.url,
          mimeType: docResult.mimeType
        });
      }
    };

    GoogleApi.pickerSingleton().then((Picker) => {
      var builder = new Picker.PickerBuilder()
        .setCallback(callback)
        .setOAuthToken(GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().access_token);

      // hack to make it better on mobile
      if (window.innerWidth < 800 || window.innerHeight < 800) {
        // if the screen is small, ask for the max size to try to fill the space
        builder.setSize(1051, 650);
      }

      attrs.configs.forEach((config) => {
        if (config.type === "files") {
          builder.addView(new Picker.DocsView().setMimeTypes(config.mimeTypes.join(",")));
        } else if (config.type === "spreadsheets") {
          builder.addView(Picker.ViewId.SPREADSHEETS);
        }
      });

      var picker = builder.build();
      picker.setVisible(true);
    });
  }

  private FILES_CONFIG: PickerConfig = {
    type: "files",
    mimeTypes: JSON_MIME_TYPES
  };

  private SHEETS_CONFIG: PickerConfig = {
    type: "spreadsheets"
  };

  createJsonFilePicker(onPicked: (file: FileResult) => void) {
    this.createPicker({
      configs: [ this.FILES_CONFIG ],
      onPicked: onPicked
    });
  }

  createGoogleSheetPicker(onPicked: (file: FileResult) => void) {
    this.createPicker({
      configs: [ this.SHEETS_CONFIG ],
      onPicked: onPicked
    });
  }

  createAnythingPicker(onPicked: (file: FileResult) => void) {
    this.createPicker({
      configs: [ this.FILES_CONFIG, this.SHEETS_CONFIG ],
      onPicked: onPicked
    });
  }
}
