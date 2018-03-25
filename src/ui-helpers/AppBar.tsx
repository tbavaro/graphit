import * as React from "react";
import "./AppBar.css";

export interface Actions {
  togglePropertiesView: () => void;
}

interface Props {
  actionManager: Actions;
  title: string;
  onClickNavButton?: () => void;
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
            {this.renderButton("edit", "Edit", this.props.actionManager.togglePropertiesView)}
          </section>
        </div>
      </div>
    );
  }

  private renderButton = (iconName: string, ariaLabel: string, onClick?: () => void, isDisabled?: boolean) => {
    return (
      <a
        href={isDisabled ? undefined : "#"}
        className={"AppBar-iconButton material-icons mdc-top-app-bar__action-item" + (isDisabled ? " disabled" : "")}
        aria-label={ariaLabel}
        onClick={onClick}
        children={iconName}
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
