import * as React from 'react';
import './PropertiesView.css';
import * as MaterialSlider from "./MaterialSlider";
import { ValueFormatter, ValueFormatters } from "./ValueFormatters";

interface MyActions {
  closePropertiesView: () => void;
}

interface SliderPropertyProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  formatter: ValueFormatter<number>;
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
          onChangeValue={this.onSliderValueChanged}
        />
      </div>
    );
  }

  private onSliderValueChanged = (newValue: number) => {
    this.setState({
      displayValue: newValue
    });
  }
}

interface Props {
  actionManager: MyActions;
  isOpen: boolean;
}

class PropertiesView extends React.PureComponent<Props, object> {
  render() {
    if (!this.props.isOpen) {
      return "";
    }

    return (
      <div className={"PropertiesView" + (this.props.isOpen ? " open" : "")}>
        <div className="PropertiesView-header">
          Properties
          <div
            className="PropertiesView-header-closeButton material-icons"
            onClick={this.props.actionManager.closePropertiesView}
            children="close"
          />
        </div>
        <div className="PropertiesView-content">
          <SliderPropertyComponent
            label="Gravity"
            value={20}
            minValue={0}
            maxValue={100}
            formatter={ValueFormatters.roundedInt}
          />
          <SliderPropertyComponent
            label="Particle Charge"
            value={10}
            minValue={0}
            maxValue={100}
            formatter={ValueFormatters.roundedInt}
          />
        </div>
      </div>
    );
  }
}

export default PropertiesView;
