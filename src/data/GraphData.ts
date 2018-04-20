import * as DeepReadonly from "./DeepReadonly";
import * as Defaults from "./Defaults";
import * as GraphDataValidators from "../generated/GraphDataValidators";
import { createValidationFunction } from "tsvalidators";

export type Id = string;

export const DEFAULT_LAYOUT_TYPE = "force_simulation";
export const DEFAULT_ORIGIN_PULL_STRENGTH = 0.001;
export const DEFAULT_PARTICLE_CHARGE = 500;
export const DEFAULT_CHARGE_DISTANCE_MAX = 300;
export const DEFAULT_LINK_DISTANCE = 100;

/**
 * V1
 */

/**
 * @autogents validator
 */
export type NodeV1 = {
  id: Id;
  label: string;
  color?: string | null;
  isLocked?: boolean;
  x?: number | null;
  y?: number | null;
};

/**
 * @autogents validator
 */
export type LinkV1 = {
  source: Id;
  target: Id;
};

/**
 * @autogents validator
 */
export type ZoomStateV1 = {
  centerX: number;
  centerY: number;
  scale: number;
};

/**
 * @autogents validator
 */
export type LayoutStateV1 = {
  layoutType: "force_simulation";
  forceSimulationConfig: {
    originPullStrength: number;
    particleCharge: number;
    chargeDistanceMax: number;
    linkDistance: number;
  };
};

/**
 * @autogents validator
 */
export type NodeRenderModeV1 = (
  "basic" |
  "raw_html"
);

/**
 * @autogents validator
 */
export type DisplayConfigV1 = {
  nodeRenderMode: NodeRenderModeV1;
};

/**
 * @autogents validator
 */
export type SerializedDocumentV1 = {
  version?: 1;
  nodes?: NodeV1[];
  links?: LinkV1[];
  zoomState?: ZoomStateV1;
  layoutState?: LayoutStateV1;
  displayConfig?: DisplayConfigV1;
};

const validateDocumentV1 =
  createValidationFunction<SerializedDocumentV1>(
    GraphDataValidators.validatorForSerializedDocumentV1
  );

/**
 * Latest version
 */

export type SerializedDocument = SerializedDocumentV1;

const REQUIRED_VALUE = Object.freeze(["<required value>"]) as any;

export type Document = Defaults.DeepRequired<SerializedDocument>;
export const documentDefaults = DeepReadonly.deepFreeze<Defaults.Defaults<SerializedDocument>>({
  version: 1,
  nodes: [
    {
      id: REQUIRED_VALUE,
      label: REQUIRED_VALUE,
      color: null,
      isLocked: false,
      x: null,
      y: null
    }
  ],
  links: [
    {
      source: REQUIRED_VALUE,
      target: REQUIRED_VALUE
    }
  ],
  zoomState: {
    centerX: 0,
    centerY: 0,
    scale: 1
  },
  layoutState: {
    layoutType: DEFAULT_LAYOUT_TYPE,
    forceSimulationConfig: {
      originPullStrength: DEFAULT_ORIGIN_PULL_STRENGTH,
      particleCharge: DEFAULT_PARTICLE_CHARGE,
      chargeDistanceMax: DEFAULT_CHARGE_DISTANCE_MAX,
      linkDistance: DEFAULT_LINK_DISTANCE
    }
  },
  displayConfig: {
    nodeRenderMode: "basic"
  }
});

export const LATEST_VERSION: number = documentDefaults.version;

export function createDefaultDocument(): Document {
  return Defaults.createFromDefaults(documentDefaults);
}

export function load<T extends { version?: number, [key: string]: any }>(
  input: T
): Document {
  let inputDocument: SerializedDocument;

  switch (input.version) {
    case undefined:
    case 1: {
      const inputDocumentV1 = validateDocumentV1(input);
      inputDocument = upgradeV1(inputDocumentV1);
      break;
    }

    default:
      throw new Error(`unsupported document version: ${input.version}`);
  }

  // NB: could try re-validating here if upgrade logic gets janky

  return Defaults.applyDefaults<SerializedDocument>(inputDocument, documentDefaults);
}

function upgradeV1(input: SerializedDocumentV1): SerializedDocument {
  return input;
}
