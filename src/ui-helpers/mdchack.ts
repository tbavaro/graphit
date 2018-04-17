// there's a problem with webpack and mdc; but this should be effectively:
// import * as mdc from "material-components-web";

const mdc = (window as any).mdc as {
  dialog: {
    MDCDialog: {
      attachTo: (element: Element) => {
        listen: (event: string, callback: () => void) => void;
        show: () => void;
      }
    }
  },
  drawer: any,
  slider: any,
  topAppBar: {
    MDCTopAppBar: {
      attachTo: (element: Element) => void
    }
  }
};

export default mdc;