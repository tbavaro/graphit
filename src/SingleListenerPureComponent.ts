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

export default SingleListenerPureComponent;
