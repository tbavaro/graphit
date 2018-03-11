import * as React from "react";
import "./MaterialSlider.css";
import * as classNames from "classnames";

export interface Props {
  value: number;
  minValue: number;
  maxValue: number;
  onChangeValue?: (nemValue: number, isDone: boolean) => void;
  extraClassName?: string;
}

export class Component extends React.PureComponent<Props, object> {
  private ref?: HTMLDivElement;

  componentDidMount() {
    if (!this.ref) {
      throw new Error("ref not set");
    }

    var mdc = ((window as any).mdc);
    var mdcRef = mdc.slider.MDCSlider.attachTo(this.ref);
    mdcRef.listen("MDCSlider:input", () => {
      if (this.props.onChangeValue) {
        this.props.onChangeValue(mdcRef.value, /*isDone=*/false);
      }
    });
    mdcRef.listen("MDCSlider:change", () => {
      if (this.props.onChangeValue) {
        this.props.onChangeValue(mdcRef.value, /*isDone=*/true);
      }
    });
  }

  render() {
    return (
      <div
        className={classNames([
          "MaterialSlider",
          "mdc-slider",
          this.props.extraClassName
        ])}
        tabIndex={0}
        role="slider"
        aria-valuemin={this.props.minValue}
        aria-valuemax={this.props.maxValue}
        aria-valuenow={this.props.value}
        aria-label="Select Value"
        ref={this.setRef}
      >
        <div className="mdc-slider__track-container">
          <div className="mdc-slider__track"/>
        </div>
        <div className="mdc-slider__thumb-container">
          <svg className="mdc-slider__thumb" width="21" height="21">
            <circle cx="10.5" cy="10.5" r="7.875"/>
          </svg>
          <div className="mdc-slider__focus-ring"/>
        </div>
      </div>
    );
  }

  private setRef = (newRef: HTMLDivElement) => {
    this.ref = newRef;
  }
}
