import * as React from "react";
import "./MaterialList.css";

export interface ItemProps {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface Props {
  items: ItemProps[];
}

export class Component extends React.PureComponent<Props, object> {
  render() {
    return (
      <ul className="MaterialList mdc-list">
        {this.props.items.map(this.renderItem)}
      </ul>
    );
  }

  private renderItem = (itemProps: ItemProps) => {
    var result = (
      <li
        className="mdc-list-item"
        key={itemProps.key}
        onClick={itemProps.onClick}
        children={itemProps.label}
      />
    );

    if (itemProps.href) {
      result = <a href={itemProps.href} children={result}/>;
    }

    return result;
  }
}
