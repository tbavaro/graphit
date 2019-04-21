import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import * as React from "react";

import { GraphDocument } from "../data/GraphDocument";
import { MyNodeDatum } from "../data/MyNodeDatum";

import "./SearchPopperContents.css";

export interface Actions {
  jumpToNode: (node: MyNodeDatum) => void;
}

interface Props {
  actions: Actions;
  query: string;
  document: GraphDocument;
}

interface State {
  maxHeightPx: number;
}

const elementHelper = document.createElement("div");

// hack until i remove html labels
function cleanLabel(label: string) {
  let headersRemoved = label.replace(/\<[^\>]*\>/g, "\t").trim().replace(/\t+/g, " / ");

  // fix html entities
  if (/&/.exec(headersRemoved)) {
    elementHelper.innerHTML = headersRemoved;
    headersRemoved = elementHelper.innerText;
  }

  return headersRemoved;
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
      <List
        component="nav"
        className="SearchPopperContents"
        dense={true}
        style={{ maxHeight: `${this.state.maxHeightPx}px` }}
      >
        {
          results.length === 0
            ? this.renderEmptyState()
            : this.renderResults(results)
        }
      </List>
    );
  }

  private renderEmptyState() {
    return "No results";
  }

  private renderResults(results: MyNodeDatum[]) {
    const limitedResults = results.slice(0, 50);

    return limitedResults.map(result => (
      <MyResultListItem key={result.id} node={result} jumpToNode={this.props.actions.jumpToNode}/>
    ));
  }

  private updateMaxHeight = () => {
    this.setState({ maxHeightPx: Math.floor((window.innerHeight - 48) * 0.8) });
  }
}

interface MyResultListItemProps {
  node: MyNodeDatum;
  jumpToNode: (node: MyNodeDatum) => void;
};

class MyResultListItem extends React.PureComponent<MyResultListItemProps, {}> {
  private handleClick = () => {
    this.props.jumpToNode(this.props.node);
  }

  public render() {
    const { node } = this.props;
    return (
      <ListItem button={true} onClick={this.handleClick}>
        <ListItemText primary={cleanLabel(node.label)}/>
      </ListItem>
    );
  }
}

export default SearchPopperContents;
