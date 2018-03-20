import * as GoogleApi from "../google/GoogleApi";

const JSON_MIME_TYPES = [
  "application/me.timba.graphit+json",
  "application/json"
];

export interface FileResult {
  id: string;
  name: string;
  downloadUrl: string;
}

export default class GooglePickerHelper {
  constructor() {
    GoogleApi.pickerSingleton();
  }

  private createPicker(attrs: {
    config: {
      type: "files",
      mimeTypes: string[]
    } | {
      type: "spreadsheets"
    };
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
          downloadUrl: docResult.url
        });
      }
    };

    GoogleApi.pickerSingleton().then((Picker) => {
      var builder = new Picker.PickerBuilder()
        .setCallback(callback)
        .setOAuthToken(GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().access_token);

      if (attrs.config.type === "files") {
        builder.addView(new Picker.DocsView().setMimeTypes(attrs.config.mimeTypes.join(",")));
      } else if (attrs.config.type === "spreadsheets") {
        builder.addView(Picker.ViewId.SPREADSHEETS);
      }

      var picker = builder.build();
      picker.setVisible(true);
    });
  }

  createJsonFilePicker(onPicked: (file: FileResult) => void) {
    this.createPicker({
      config: {
        type: "files",
        mimeTypes: JSON_MIME_TYPES
      },
      onPicked: onPicked
    });
  }

  createGoogleSheetPicker(onPicked: (file: FileResult) => void) {
    this.createPicker({
      config: {
        type: "spreadsheets"
      },
      onPicked: onPicked
    });
  }
}
