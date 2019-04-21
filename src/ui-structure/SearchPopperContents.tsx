import * as React from "react";

import { GraphDocument } from "../data/GraphDocument";
import { MyNodeDatum } from "../data/MyNodeDatum";

import "./SearchPopperContents.css";

interface Props {
  query: string;
  document: GraphDocument;
}

interface State {
  maxHeightPx: number;
}

class SearchPopperContents extends React.PureComponent<Props, State> {
  public state: State = {
    maxHeightPx: 100
  };

  public componentWillMount() {
    if (super.componentWillMount) {
      super.componentWillMount();
    }

    window.addEventListener("resize", this.updateMaxHeight);
    this.updateMaxHeight();
  }

  public componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }

    window.removeEventListener("resize", this.updateMaxHeight);
  }

  public render() {
    const { document } = this.props;
    const results = document.nodeSearchHelper.search(this.props.query);

    return (
      <div className="SearchPopperContents" style={{ maxHeight: `${this.state.maxHeightPx}px` }}>
        {
          results.length === 0
            ? this.renderEmptyState()
            : this.renderResults(results)
        }
      </div>
    );
  }

  private renderEmptyState() {
    return "No results";
  }

  private renderResults(results: MyNodeDatum[]) {
    return (
      <ul>
        {
          results.map(result => (
            <li>{result.label}</li>
          ))
        }
      </ul>
    );
  }

  private updateMaxHeight = () => {
    this.setState({ maxHeightPx: Math.floor((window.innerHeight - 48) * 0.8) });
  }
}

export default SearchPopperContents;
