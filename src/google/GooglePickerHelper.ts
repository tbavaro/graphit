import * as GoogleApi from "../google/GoogleApi";

const MIME_TYPES = [
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

  createPicker(attrs: {
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
      var picker = new Picker.PickerBuilder()
        .addView(new Picker.DocsView().setMimeTypes(MIME_TYPES.join(",")))
        .setCallback(callback)
        .setOAuthToken(GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().access_token)
        .build();
      picker.setVisible(true);
    });
  }
}
