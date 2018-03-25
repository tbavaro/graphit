import * as React from "react";
import "./MaterialList.css";

export interface ItemProps {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
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
        className={"mdc-list-item" + (itemProps.disabled ? " disabled" : "")}
        key={itemProps.key}
        onClick={itemProps.disabled ? undefined : itemProps.onClick}
        children={itemProps.label}
        aria-disabled={!!itemProps.disabled}
        tabIndex={itemProps.disabled ? -1 : undefined}
      />
    );

    if (itemProps.href) {
      result = <a href={itemProps.href} children={result}/>;
    }

    return result;
  }
}
