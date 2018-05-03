import * as React from 'react';
import * as MaterialSlider from "./ui-helpers/MaterialSlider";

import './PropertiesView.css';

import { GraphDocument } from './data/GraphDocument';
import { SimpleListenable } from './data/Listenable';
import { ValueFormatter, ValueFormatters } from "./ValueFormatters";

export interface Actions {
  closePropertiesView: () => void;
}

interface SliderPropertyProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  exponent?: number;
  formatter: ValueFormatter<number>;
  onValueChange?: (newValue: number) => void;
}

interface SliderPropertyState {
  displayValue: number;
}

class SliderPropertyComponent extends React.PureComponent<SliderPropertyProps, SliderPropertyState> {
  state = {
    displayValue: this.props.value
  };

  componentWillReceiveProps(newProps: SliderPropertyProps) {
    this.setState({
      displayValue: newProps.value
    });
  }

  render() {
    return (
      <div className="PropertiesView-content-property-container">
        <div className="PropertiesView-content-property-labelRow">
          <div className="PropertiesView-content-property-label">
            {this.props.label}
          </div>
          <div className="PropertiesView-content-property-value">
            {this.props.formatter.format(this.state.displayValue)}
          </div>
        </div>
        <MaterialSlider.Component
          extraClassName="PropertiesView-content-property-slider"
          value={this.state.displayValue}
          minValue={this.props.minValue}
          maxValue={this.props.maxValue}
          exponent={this.props.exponent}
          onChangeValue={this.onSliderValueChanged}
        />
      </div>
    );
  }

  private onSliderValueChanged = (newValue: number, isDone: boolean) => {
    this.setState({
      displayValue: newValue
    });
    if (/* isDone && */this.props.onValueChange) {
      this.props.onValueChange(newValue);
    }
  }
}

export interface Props {
  actionManager: Actions;
  isOpen: boolean;
  document: GraphDocument;
  simulationConfigListener: SimpleListenable;
}

export class Component extends React.PureComponent<Props, object> {
  private _getForceSimulationConfig = () => this.props.document.layoutState.forceSimulationConfig;

  private _controlRenderers = [
    this.configSlider({
      label: "Origin Pull Strength",
      getParentObject: this._getForceSimulationConfig,
      fieldName: "originPullStrength",
      maxValue: 0.1,
      exponent: 2,
      formatter: ValueFormatters.fixedPrecision(5)
    }),
    this.configSlider({
      label: "Particle Charge",
      getParentObject: this._getForceSimulationConfig,
      fieldName: "particleCharge",
      maxValue: 10000
    }),
    this.configSlider({
      label: "Charge Distance Max",
      getParentObject: this._getForceSimulationConfig,
      fieldName: "chargeDistanceMax",
      maxValue: 10000
    }),
    this.configSlider({
      label: "Link Distance",
      getParentObject: this._getForceSimulationConfig,
      fieldName: "linkDistance",
      maxValue: 1000
    })
  ];

  render() {
    if (!this.props.isOpen) {
      return "";
    }

    return (
      <div className={"PropertiesView" + (this.props.isOpen ? " open" : "")}>
        <div className="PropertiesView-header">
          Simulation Properties
          <div
            className="PropertiesView-header-closeButton material-icons"
            onClick={this.props.actionManager.closePropertiesView}
            children="close"
          />
        </div>
        <div className="PropertiesView-content">
          {this._controlRenderers.map((renderer, index) => renderer.render(index))}
        </div>
      </div>
    );
  }

  private configSlider<FieldName extends string, Parent extends { [F in FieldName]: number }>(attrs: {
    label: string,
    getParentObject: () => Parent,
    fieldName: FieldName,
    minValue?: number,
    maxValue: number,
    exponent?: number,
    formatter?: ValueFormatter<number>
  }) {
    var onValueChange = (newValue: number) => {
      attrs.getParentObject()[attrs.fieldName] = newValue;
      this.props.simulationConfigListener.triggerListeners();
    };
    return {
      render: (index: number) => {
        return (
          <SliderPropertyComponent
            key={"slider:" + index}
            label={attrs.label}
            value={attrs.getParentObject()[attrs.fieldName]}
            minValue={attrs.minValue || 0}
            maxValue={attrs.maxValue}
            exponent={attrs.exponent}
            formatter={attrs.formatter || ValueFormatters.roundedInt}
            onValueChange={onValueChange}
          />
        );
      }
    };
  }
}
