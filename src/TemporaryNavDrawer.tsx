import * as React from 'react';
import './TemporaryNavDrawer.css';
import { MDCTemporaryDrawer } from  "@material/drawer";

interface Props {
  isOpen: boolean;
}

class TemporaryNavDrawer extends React.Component<Props, object> {
  private ref?: HTMLDivElement;
  private mdcRef?: MDCTemporaryDrawer;

  componentDidMount() {
    if (!this.ref) {
      throw new Error("ref not set");
    }

    this.mdcRef = MDCTemporaryDrawer.attachTo(this.ref);
    this.mdcRef.open = this.props.isOpen;
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.mdcRef) {
      this.mdcRef.open = newProps.isOpen;
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <aside className="mdc-drawer mdc-drawer--temporary mdc-typography" ref={this.setRef}>
        <nav className="mdc-drawer__drawer">
          <header className="mdc-drawer__toolbar-spacer"/>
          <nav id="icon-with-text-demo" className="mdc-drawer__content mdc-list">
            <a className="mdc-list-item mdc-list-item--activated" href="#">
              <i className="material-icons mdc-list-item__graphic" aria-hidden="true">inbox</i>Inbox
            </a>
            <a className="mdc-list-item" href="#">
              <i className="material-icons mdc-list-item__graphic" aria-hidden="true">star</i>Star
            </a>
          </nav>
        </nav>
      </aside>
    );
  }

  private setRef = (newRef: HTMLDivElement) => {
    this.ref = newRef;
  }
}

export default TemporaryNavDrawer;
