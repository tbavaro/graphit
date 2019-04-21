import * as React from "react";

import "./SearchPopperContents.css";

export interface Props {
  query: string;
}

class SearchPopperContents extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div className="SearchPopperContents">
        {this.props.query}
      </div>
    );
  }
}

export default SearchPopperContents;
