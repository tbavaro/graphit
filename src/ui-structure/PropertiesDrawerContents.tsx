import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import CloseIcon from "@material-ui/icons/Close";
import Slider from "@material-ui/lab/Slider";

import * as React from "react";

import { GraphDocument } from "../data/GraphDocument";
import { SimpleListenable } from "../data/Listenable";
import { ValueFormatter, ValueFormatters } from "../ValueFormatters";

import "./PropertiesDrawerContents.css";

interface MySliderListItemProps<F extends string> {
  label: string;
  field: F;
  object: { [K in F]: number };
  formatter: ValueFormatter<number>;
  minValue?: number;
  maxValue: number;
  exponent?: number;
  listener: SimpleListenable;
}

class MySliderListItem<F extends string> extends React.PureComponent<MySliderListItemProps<F>, {}> {
  public render() {
    const value = this.props.object[this.props.field];

    return (
      <ListItem className="PropertiesDrawerContents-sliderItem" button={false}>
        <ListItemText
          primary={
            <React.Fragment>
              {this.props.label}
              <span className="PropertiesDrawerContents-sliderValue">
                {this.props.formatter.format(value)}
              </span>
            </React.Fragment>
          }
          secondary={
            <Slider
              value={this.adjustValue(value, false)}
              min={this.adjustValue(this.props.minValue || 0, false)}
              max={this.adjustValue(this.props.maxValue, false)}
              aria-labelledby="label"
              onChange={this.onChange}
            />
          }
          secondaryTypographyProps={{
            className: "PropertiesDrawerContents-sliderContainer",
            component: "span"
          }}
        />
      </ListItem>
    );
  }

  private onChange = (event: any, value: number) => {
    this.props.object[this.props.field] = this.adjustValue(value, true);
    this.forceUpdate();
    this.props.listener.triggerListeners();
  }

  private adjustValue(value: number, reverse: boolean) {
    if (this.props.exponent === undefined) {
      return value;
    } else {
      return Math.pow(value, reverse ? this.props.exponent : (1 / this.props.exponent));
    }
  }
}

export interface Actions {
  closePropertiesDrawer: () => void;
}

interface Props {
  actions: Actions;
  document: GraphDocument | null;
  simulationConfigListener: SimpleListenable;
}

const FORMATTER_PRECISION_5 = ValueFormatters.fixedPrecision(5);

class PropertiesDrawerContents extends React.PureComponent<Props, {}> {
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
              <IconButton aria-label="Close" onClick={this.props.actions.closePropertiesDrawer}>
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
            maxValue={0.1}
            exponent={2}
            listener={this.props.simulationConfigListener}
          />
          <MySliderListItem
            label="Particle charge"
            object={values}
            field={"particleCharge"}
            formatter={ValueFormatters.roundedInt}
            maxValue={10000}
            listener={this.props.simulationConfigListener}
          />
          <MySliderListItem
            label="Charge distance max"
            object={values}
            field={"chargeDistanceMax"}
            formatter={ValueFormatters.roundedInt}
            maxValue={10000}
            listener={this.props.simulationConfigListener}
          />
          <MySliderListItem
            label="Link distance"
            object={values}
            field={"linkDistance"}
            formatter={ValueFormatters.roundedInt}
            maxValue={1000}
            listener={this.props.simulationConfigListener}
          />
        </List>
      </div>
    );
  }
}

export default PropertiesDrawerContents;
