export type FileResult = {
  name: string;
  data: string;
};

export function openLocalFile(callback: (result: FileResult) => void) {
  var element = document.createElement("input");
  element.type = "file";
  element.accept = "application/json";
  element.style.display = "none";
  element.onchange = function() {
    const files = (this as HTMLInputElement).files || [];

    if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        callback({
          name: file.name,
          data: reader.result
        });
      };
      reader.readAsText(file, "utf-8");
    }
  };

  element.click();
}
