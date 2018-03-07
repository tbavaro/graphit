import * as React from "react";
import mdc from "./mdc";
import "./AppBar.css";

interface Props {
  title: string;
  onClickNavButton?: () => void;
}

class AppBar extends React.PureComponent<Props, object> {
  private ref?: HTMLDivElement;

  componentDidMount() {
    if (!this.ref) {
      throw new Error("ref not set");
    }

    mdc.MDCTopAppBar.attachTo(this.ref);
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
        </div>
      </div>
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

export default AppBar;
