import * as DeepReadonly from "./DeepReadonly";
import * as Defaults from "./Defaults";

export type Id = string;

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
export type SerializedDocumentV1 = {
  version?: 1;
  nodes?: NodeV1[];
  links?: LinkV1[];
  zoomState?: ZoomStateV1;
};

/**
 * Latest version
 */

/**
 * @autogents validator
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
  }
});

export const LATEST_VERSION: number = documentDefaults.version;

export function createDefaultDocument(): Document {
  return Defaults.createFromDefaults(documentDefaults);
}

export function load<T extends { version?: number, [key: string]: any }>(
  input: T
): Document {
  if (input.version === undefined) {
    input.version = 1;
  }

  let inputDocument: SerializedDocument;

  switch (input.version) {
    case 1: {
      // TODO actually do validation
      const inputDocumentV1 = input as SerializedDocumentV1;
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
