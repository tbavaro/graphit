import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import CloseIcon from "@material-ui/icons/Close";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import Slider from "@material-ui/lab/Slider";

import * as React from "react";

import { Datastore, DatastoreStatus } from "../data/Datastore";
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
      <ListItem
        className="PropertiesDrawerContents-sliderItem" button={false}>
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
  connectSpreadsheet: () => void;
  disconnectSpreadsheet: () => void;
  mergeConnectedSpreadsheetData: () => void;
}

interface Props {
  actions: Actions;
  datastore: Datastore;
  datastoreStatus: DatastoreStatus;
  document: GraphDocument | null;
}

interface State {
  loadedSheetId: string | null;
  loadedSheetDetails: {
    success: true;
    name: string;
    url?: string;
  } | {
    success: false;
    message: string;
  }
}

const FORMATTER_PRECISION_5 = ValueFormatters.fixedPrecision(5);

class PropertiesDrawerContents extends React.Component<Props, State> {
  public state: State = {
    loadedSheetId: null,
    loadedSheetDetails: {
      success: false,
      message: "not loaded"
    }
  }

  // if datastore, or more likely datastorestatus, changes, discard any loaded
  // information about the sheet
  // TODO find a way to do this without calling setState from within sCU
  public shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<State>,
    nextContext: any
  ): boolean {
    if (this.props.datastore !== nextProps.datastore ||
        this.props.datastoreStatus !== nextProps.datastoreStatus) {
      this.loadingSheetId = null;
      this.loadingSheetPromise = null;
      if (nextState.loadedSheetId !== null) {
        this.setState({ loadedSheetId: null });
      }
    }

    if (super.shouldComponentUpdate) {
      return super.shouldComponentUpdate(nextProps, nextState, nextContext);
    } else {
      return true;
    }
  }

  public render() {
    return (
      <div className="PropertiesDrawerContents">
        {
          this.props.document === null
            ? null
            : (
              <React.Fragment>
                {this.renderSimulationProperties(this.props.document)}
                {this.renderDataSourceProperties(this.props.document)}
              </React.Fragment>
            )
        }
      </div>
    );
  }

  private renderSimulationProperties(document: GraphDocument) {
    const values = document.layoutState.forceSimulationConfig;
    return (
      <List
        dense={true}
        subheader={(
          <ListSubheader>Simulation properties</ListSubheader>
        )}
      >
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
    );
  }

  private renderDataSourceProperties(document: GraphDocument) {
    const dataSource = document.dataSource;
    return (
      <List
        dense={true}
        subheader={<ListSubheader>Data source</ListSubheader>}
      >
        {
          dataSource.connectedSpreadsheetId === null
            ? this.renderConnectSpreadsheetButtonListItem()
            : this.renderConnectedSpreadsheetListItems(dataSource.connectedSpreadsheetId)
        }
      </List>
    );
  }

  private renderConnectSpreadsheetButtonListItem() {
    return (
      <ListItem button={true} onClick={this.props.actions.connectSpreadsheet}>
        <ListItemText
          primary="Connect spreadsheet..."
          primaryTypographyProps={{
            color: "secondary"
          }}
        />
      </ListItem>
    );
  }

  private renderConnectedSpreadsheetListItems(spreadsheetId: string) {
    let isLoaded = false;
    let label = "(loading...)";
    let url: string | undefined;

    if (this.state.loadedSheetId === spreadsheetId) {
      if (this.state.loadedSheetDetails.success) {
        isLoaded = true;
        label = this.state.loadedSheetDetails.name;
        url = this.state.loadedSheetDetails.url;
      } else {
        isLoaded = false;
        label = this.state.loadedSheetDetails.message;
      }
    } else {
      this.fetchSheetDetailsIfNeeded(spreadsheetId);
    }

    // set tabindex to -1 when things are clickable, to get around weird tab
    // navigation issues (focusing on the link is ugly, and keyboard interaction
    // on the list item doesn't cause the proper link behavior). but DON'T set it
    // if these aren't active anyway, since having a tabindex causes the link to
    // become focusable
    // #checkCrossBrowser
    const tabIndexOverrides = (url === undefined ? undefined : -1);

    return [
      (<Link href={url} target="#" underline="none" tabIndex={tabIndexOverrides}>
        <ListItem button={url !== undefined} key="resource" tabIndex={tabIndexOverrides}>
          <ListItemIcon className="PropertiesDrawerContents-spreadsheetIcon">
            <InsertDriveFileIcon />
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{ noWrap: true, color: isLoaded ? "default" : "error" }}
            // secondary="Last updated xxx notahueontaeou nthaoeunthaoeunth"
            // secondaryTypographyProps={{ noWrap: true }}
          />
          <ListItemSecondaryAction>
            <IconButton aria-label="disconnect" onClick={this.handleDisconnectSpreadsheet}>
              <CloseIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Link>),
      (<ListItem button={false} key="updateButton" className="PropertiesDrawerContents-updateButtonListItem">
        <ListItemText
          primary={
            <Button variant="outlined" fullWidth={true} onClick={this.props.actions.mergeConnectedSpreadsheetData}>
              Update data
            </Button>
          }
          className="PropertiesDrawerContents-updateButtonListItemText"
        />
      </ListItem>)
    ];
  }

  private loadingSheetId: string | null = null;
  private loadingSheetPromise: Promise<void> | null = null;
  private fetchSheetDetailsIfNeeded(sheetId: string) {
    if (this.state.loadedSheetId === sheetId || this.loadingSheetId === sheetId) {
      // already loaded or in the process of loading, so do nothing...
      return;
    }

    // if the datastore is still initializing, we can't do anything yet. But we should
    // get another shot at it when the status changes
    if (this.props.datastoreStatus === DatastoreStatus.Initializing) {
      return;
    }

    if (this.loadingSheetPromise !== null) {
      // NB: would be nice if we could actually cancel it
      this.loadingSheetPromise = null;
    }

    this.loadingSheetId = sheetId;
    let myPromise: Promise<void> | null = null;
    const promise = (async (): Promise<void> => {
      let details: State["loadedSheetDetails"];

      try {
        const result = await this.props.datastore.getFileNameAndUrl(sheetId);
        details = {
          success: true,
          name: result.name,
          url: result.url
        };
      } catch (e) {
        console.log("file error", e);
        details = {
          success: false,
          message: "(unable to access)"
        };
      }

      // make sure we're still the active promise
      if (this.loadingSheetPromise === myPromise) {
        this.setState({
          loadedSheetId: sheetId,
          loadedSheetDetails: details
        });
      }
    })();
    myPromise = promise;
    this.loadingSheetPromise = promise;
  }

  private handleDisconnectSpreadsheet = (event: any) => {
    this.props.actions.disconnectSpreadsheet();
    event.stopPropagation();
    event.preventDefault();
  };
}

export default PropertiesDrawerContents;
