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
  version?: number ;
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

export type Document = Defaults.DeepRequired<SerializedDocument>;
export const documentDefaults = DeepReadonly.deepFreeze<Document>({
  version: 1,
  nodes: [
    {
      id: "<id>",
      label: "<label>",
      color: null,
      isLocked: false,
      x: null,
      y: null
    }
  ],
  links: [
    {
      source: "<source>",
      target: "<target>"
    }
  ],
  zoomState: {
    centerX: 0,
    centerY: 0,
    scale: 1
  }
});

export function createDefaultDocument(): Document {
  return Defaults.createFromDefaults(documentDefaults);
}
