import * as React from "react";
import "./AppBar.css";

export interface Actions {
  togglePropertiesView: () => void;
}

interface Props {
  actionManager: Actions;
  title: string;
  onClickNavButton?: () => void;
  isDocumentLoaded: boolean;
}

export class Component extends React.PureComponent<Props, object> {
  private ref?: HTMLDivElement;

  componentDidMount() {
    if (!this.ref) {
      throw new Error("ref not set");
    }

    var mdc = ((window as any).mdc);
    mdc.topAppBar.MDCTopAppBar.attachTo(this.ref);
    this.ref.addEventListener("MDCTopAppBar:nav", this.onClickNavButton);
  }

  render() {
    return (
      <div className="AppBar mdc-top-app-bar" ref={this.setRef}>
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <a href="#" className="material-icons mdc-top-app-bar__navigation-icon">menu</a>
            <span className="mdc-top-app-bar__title">{this.props.title}</span>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            {this.renderButton({
              iconName: "edit",
              ariaLabel: "Edit",
              onClick: this.props.actionManager.togglePropertiesView,
              isDisabled: !this.props.isDocumentLoaded
            })}
          </section>
        </div>
      </div>
    );
  }

  private renderButton = (attrs: {
    iconName: string;
    ariaLabel: string;
    onClick?: () => void;
    isDisabled?: boolean;
  }) => {
    return (
      <a
        href={attrs.isDisabled ? undefined : "#"}
        className={[
          "AppBar-iconButton",
          "material-icons",
          "mdc-top-app-bar__action-item",
          (attrs.isDisabled ? " disabled" : "")
        ].join(" ")}
        aria-label={attrs.ariaLabel}
        onClick={attrs.onClick}
        children={attrs.iconName}
      />
    );
  }

  private setRef = (newRef: HTMLDivElement) => {
    this.ref = newRef;
  }

  private onClickNavButton = () => {
    if (this.props.onClickNavButton) {
      this.props.onClickNavButton();
    }
  }
}
