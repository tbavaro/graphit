import * as GoogleApi from "../google/GoogleApi";

const MIME_TYPES = [
  "application/me.timba.graphit+json",
  "application/json"
];

export default class GooglePickerHelper {
  constructor() {
    GoogleApi.pickerSingleton();
  }

  createPicker() {
    return new Promise((resolve, reject) => {
      GoogleApi.pickerSingleton().then((Picker) => {
        var picker = new Picker.PickerBuilder()
          .addView(new Picker.DocsView().setMimeTypes(MIME_TYPES.join(",")))
          .setCallback(resolve)
          .setOAuthToken(GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().access_token)
          .build();
        picker.setVisible(true);
      });
    }).then((data) => {
      return data;
    });
  }
}
