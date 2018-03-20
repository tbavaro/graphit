var cachedInputElement: HTMLInputElement | undefined;

export type FileResult = {
  name: string;
  data: string;
};

function getOrCreateInputElement(callback: (result: FileResult) => void) {
  if (!cachedInputElement) {
    cachedInputElement = document.createElement("input");
    cachedInputElement.type = "file";
    cachedInputElement.accept = "application/json";
    cachedInputElement.style.display = "none";
    cachedInputElement.onchange = function() {
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
  }

  return cachedInputElement;
}

export function openLocalFile(callback: (result: FileResult) => void) {
  getOrCreateInputElement(callback).click();
}
