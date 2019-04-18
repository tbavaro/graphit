import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Slider from "@material-ui/lab/Slider";

import * as React from "react";

import { GraphDocument, SimulationPropertyField } from "../data/GraphDocument";
import { ValueFormatter, ValueFormatters } from "../ValueFormatters";

import "./PropertiesDrawerContents.css";

interface MySliderListItemProps<F extends string> {
  label: string;
  field: F;
  object: Readonly<{ [K in F]: number }>;
  formatter: ValueFormatter<number>;
  minValue?: number;
  maxValue: number;
  exponent?: number;
  setValue: (field: F, value: number) => void;
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
    this.props.setValue(this.props.field, this.adjustValue(value, true));
    this.forceUpdate();
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
  setSimulationProperty: (field: SimulationPropertyField, value: number) => void;
}

interface Props {
  actions: Actions;
  document: GraphDocument | null;
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
        <List dense={true}>
          <MySliderListItem
            label="Origin pull strength"
            object={values}
            field="originPullStrength"
            formatter={FORMATTER_PRECISION_5}
            maxValue={0.1}
            exponent={2}
            setValue={this.props.actions.setSimulationProperty}
          />
          <MySliderListItem
            label="Particle charge"
            object={values}
            field="particleCharge"
            formatter={ValueFormatters.roundedInt}
            maxValue={10000}
            setValue={this.props.actions.setSimulationProperty}
          />
          <MySliderListItem
            label="Charge distance max"
            object={values}
            field={"chargeDistanceMax"}
            formatter={ValueFormatters.roundedInt}
            maxValue={10000}
            setValue={this.props.actions.setSimulationProperty}
          />
          <MySliderListItem
            label="Link distance"
            object={values}
            field={"linkDistance"}
            formatter={ValueFormatters.roundedInt}
            maxValue={1000}
            setValue={this.props.actions.setSimulationProperty}
          />
        </List>
      </div>
    );
  }
}

export default PropertiesDrawerContents;
