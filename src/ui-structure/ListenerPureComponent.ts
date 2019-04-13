import * as React from "react";

import { Listenable } from "../data/Listenable";

export interface ListenerBinding<Props> {
  propertyName: string & keyof Props; // keyof Props;
  eventType: any;
  callback: () => void;
}

export abstract class ListenerPureComponent<Props, State> extends React.PureComponent<Props, State> {
  protected abstract readonly bindings: Array<ListenerBinding<Props>>;
  private _boundCallbacks: Array<() => void> = [];

  public componentWillMount() {
    this._updateSubscriptions(null, this.props);
  }

  public componentWillUnmount() {
    this._updateSubscriptions(this.props, null);
  }

  public componentWillReceiveProps(newProps: Props) {
    this._updateSubscriptions(this.props, newProps);
  }

  private _getListener(props: Props | null, binding: ListenerBinding<Props>): Listenable<any> | undefined {
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
