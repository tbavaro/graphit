import * as React from "react";
import { Listenable } from "./Listenable";

abstract class SingleListenerPureComponent<Props, State> extends React.PureComponent<Props, State> {
  protected readonly abstract _listenerFieldName: string; // keyof Props;
  protected readonly _listenerEventType: any = "changed";

  componentWillMount() {
    this._updateSubscription(null, this._getListener(this.props));
  }

  componentWillUnmount() {
    this._updateSubscription(this._getListener(this.props), null);
  }

  componentWillReceiveProps(newProps: Props) {
    this._updateSubscription(this._getListener(this.props), this._getListener(newProps));
  }

  protected abstract onSignal();

  private  _getListener(props: Props): Listenable<any> {
    return (props as any)[this._listenerFieldName];
  }

  private _updateSubscription(oldListener: Listenable<any> | null, newListener: Listenable<any> | null) {
    if (oldListener !== newListener) {
      if (oldListener) {
        oldListener.removeListener(this._listenerEventType, this._onListenerSignal);
      }

      if (newListener) {
        newListener.addListener(this._listenerEventType, this._onListenerSignal);
      }
    }
  }

  private _onListenerSignal = () => {
    this.onSignal();
  }
}

export interface ListenerBinding<Props, PropertyName extends keyof Props> {
  propertyName: PropertyName;
  eventType: any;
  callback: () => void;
}

export abstract class ListenerPureComponent<Props, State> extends React.PureComponent<Props, State> {
  protected abstract readonly bindings: ListenerBinding<Props, any>[];
  private _boundCallbacks: (() => void)[] = [];

  componentWillMount() {
    this._updateSubscriptions(null, this.props);
  }

  componentWillUnmount() {
    this._updateSubscriptions(this.props, null);
  }

  componentWillReceiveProps(newProps: Props) {
    this._updateSubscriptions(this.props, newProps);
  }

  private _getListener(props: Props | null, binding: ListenerBinding<Props, any>): Listenable<any> | undefined {
    if (props === null) {
      return undefined;
    } else {
      return (props as any)[binding.propertyName];
    }
  }

  private _updateSubscriptions(oldProps: Props | null, newProps: Props | null) {
    if (this._boundCallbacks.length !== this.bindings.length) {
      this._boundCallbacks = this.bindings.map((binding) => () => binding.callback());
    }

    this.bindings.forEach((binding, index) => {
      const oldListener = this._getListener(oldProps, binding);
      const newListener = this._getListener(newProps, binding);
      if (oldListener !== newListener) {
        if (oldListener) {
          oldListener.removeListener(binding.eventType, this._boundCallbacks[index]);
        }

        if (newListener) {
          newListener.addListener(binding.eventType, this._boundCallbacks[index]);
        }
      }
    });
  }
}

export default SingleListenerPureComponent;
