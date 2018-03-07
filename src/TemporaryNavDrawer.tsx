import * as React from 'react';
import './TemporaryNavDrawer.css';
import { MDCTemporaryDrawer } from  "@material/drawer";

export interface Props {
  isOpen: boolean;
}

export class TemporaryNavDrawer extends React.Component<Props, object> {
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

  render() {
    return (
      <aside className="mdc-drawer mdc-drawer--temporary mdc-typography" ref={this.setRef}>
        <nav className="mdc-drawer__drawer">
          <header className="mdc-drawer__toolbar-spacer"/>
          <nav id="icon-with-text-demo" className="mdc-drawer__content mdc-list">
            {this.props.children}
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
