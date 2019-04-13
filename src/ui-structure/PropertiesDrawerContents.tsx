import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import CloseIcon from "@material-ui/icons/Close";
import * as React from "react";

import { GraphDocument } from "../data/GraphDocument";
import { ValueFormatter, ValueFormatters } from "../ValueFormatters";

import "./PropertiesDrawerContents.css";

interface MySliderListItemProps<F extends string> {
  label: string;
  field: F;
  object: { [K in F]: number };
  formatter: ValueFormatter<number>;
}

class MySliderListItem<F extends string> extends React.Component<MySliderListItemProps<F>, {}> {
  public render() {
    const value = this.props.object[this.props.field];

    return (
      <ListItem className="PropertiesDrawerContents-sliderContainer" button={false}>
        <ListItemText
          primary={
            <React.Fragment>
              {this.props.label}
              <span className="PropertiesDrawerContents-sliderValue">
                {this.props.formatter.format(value)}
              </span>
            </React.Fragment>
          }
          secondary={"slider here"}
        />
      </ListItem>
    );
  }
}

interface Props {
  document: GraphDocument | null;
}

const FORMATTER_PRECISION_5 = ValueFormatters.fixedPrecision(5);

class PropertiesDrawerContents extends React.Component<Props, {}> {
  public render() {
    if (this.props.document === null) {
      return <div className="PropertiesDrawerContents"/>;
    }

    const values = this.props.document.layoutState.forceSimulationConfig;

    return (
      <div className="PropertiesDrawerContents">
        <List className="PropertiesDrawerContents-header" dense={true}>
          <ListItem button={false}>
            <ListItemText primary="Simulation Properties"/>
            <ListItemSecondaryAction>
              <IconButton aria-label="Close">
                <CloseIcon className="PropertiesDrawerContents-closeIcon"/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <List dense={true}>
          <MySliderListItem
            label="Origin pull strength"
            object={values}
            field={"originPullStrength"}
            formatter={FORMATTER_PRECISION_5}
          />
          <MySliderListItem
            label="Particle charge"
            object={values}
            field={"particleCharge"}
            formatter={ValueFormatters.roundedInt}
          />
          <MySliderListItem
            label="Charge distance max"
            object={values}
            field={"chargeDistanceMax"}
            formatter={ValueFormatters.roundedInt}
          />
          <MySliderListItem
            label="Link distance"
            object={values}
            field={"linkDistance"}
            formatter={ValueFormatters.roundedInt}
          />
        </List>
      </div>
    );
  }
}

export default PropertiesDrawerContents;
