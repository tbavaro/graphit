import * as React from "react";
import "./MaterialDialog.css";
import * as classNames from "classnames";
import mdc from "./mdchack";

// for scrollable regions, this is a proxy for vertical margin + header & button heights
const WINDOW_HEIGHT_ADJUSTMENT = 300;

export interface Props {
  title: string;
  body: string;
  preformattedBody?: boolean;
  scrollable?: boolean;
  selectable?: boolean;
  dismissDialog?: () => void;
}

interface State {
  bodyMaxHeight?: string;
}

let nextId = 0;

function generatePrefix() {
  return `dialog${nextId++}`;
}

export class Component extends React.PureComponent<Props, State> {
  state: State = {};

  private readonly myPrefix = generatePrefix();
  private ref?: HTMLElement;

  componentWillMount() {
    if (super.componentWillMount) {
      super.componentWillMount();
    }

    window.addEventListener("resize", this.measureWindow);
    this.measureWindow();
  }

  componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }

    window.removeEventListener("resize", this.measureWindow);
  }

  componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    if (!this.ref) {
      throw new Error("ref not set");
    }

    const dialog = mdc.dialog.MDCDialog.attachTo(this.ref);
    dialog.listen("MDCDialog:accept", this.onDismiss);
    dialog.listen("MDCDialog:cancel", this.onDismiss);
    dialog.show();
  }

  render() {
    const titleId = `${this.myPrefix}-label`;
    const bodyId = `${this.myPrefix}-body`;
    return (
      <aside
        className={classNames("mdc-dialog")}
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        ref={this.setRef}
      >
        <div className="mdc-dialog__surface">
          <header className="mdc-dialog__header">
            <h2 id={titleId} className="mdc-dialog__header__title">
              {this.props.title}
            </h2>
          </header>
          <section
            id={bodyId}
            className={classNames(
              "mdc-dialog__body",
              {
                "preformatted": this.props.preformattedBody,
                "mdc-dialog__body--scrollable": this.props.scrollable
              }
            )}
            style={{
              maxHeight: (this.props.scrollable ? this.state.bodyMaxHeight : undefined),
              userSelect: (this.props.selectable ? "text" : undefined)
            }}
          >
            {this.props.body}
          </section>
          <footer className="mdc-dialog__footer">
            <button
              type="button"
              className={classNames([
                "mdc-button",
                "mdc-dialog__footer__button",
                "mdc-dialog__footer__button--accept"
              ])}
            >
              OK
            </button>
          </footer>
        </div>
        <div className="mdc-dialog__backdrop" />
      </aside>
    );
  }

  private setRef = (newRef: HTMLElement) => this.ref = newRef;
  private onDismiss = () => {
    if (this.props.dismissDialog) {
      this.props.dismissDialog();
    }
  }

  private measureWindow = () => {
    this.setState({
      bodyMaxHeight: `${window.innerHeight - WINDOW_HEIGHT_ADJUSTMENT}px`
    });
  }
}
