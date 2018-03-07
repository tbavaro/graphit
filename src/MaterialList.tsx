import * as React from "react";
import "./MaterialList.css";

export interface ItemProps {
  id: string;
  label: string;
  href?: string;
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
      <li className="mdc-list-item" key={"item:" + itemProps.id}>{itemProps.label}</li>
    );

    if (itemProps.href) {
      result = <a href={itemProps.href} children={result}/>;
    }

    return result;
  }
}
