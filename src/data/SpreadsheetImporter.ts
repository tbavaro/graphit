import {
  SerializedGraphDocument,
  SerializedNode,
  SerializedLink
} from "./GraphDocument";

const NODE_ID_KEY = "id";
const NODE_LABEL_KEY = "label";
const LINK_SOURCE_ID_KEY = "source";
const LINK_TARGET_ID_KEY = "target";

// exported for testing
export const internals = {
  createSGDFromDataColumns(attrs: {
    nodeIds: string[],
    nodeLabels: string[],
    linkSourceIds: string[],
    linkTargetIds: string[]
  }) {
    if (attrs.nodeIds.length !== attrs.nodeLabels.length) {
      throw new Error("node columns are not the same length");
    }

    if (attrs.linkSourceIds.length !== attrs.linkTargetIds.length) {
      throw new Error("link columns are not the same length");
    }

    const nodes: SerializedNode[] = attrs.nodeIds.map((id, index) => {
      const label = attrs.nodeLabels[index];
      return {
        id: id,
        label: label
      };
    });

    const links: SerializedLink[] = attrs.linkSourceIds.map((sourceId, index) => {
      const targetId = attrs.linkTargetIds[index];
      return {
        source: sourceId,
        target: targetId
      };
    });

    const doc: SerializedGraphDocument = {
      nodes: nodes,
      links: links
    };

    return doc;
  },

  // data should be loaded with COLUMNS as the major dimension
  createSGDFromSheetData(attrs: {
    nodesData: any[][],
    linksData: any[][]
  }) {
    var [nodeIds, nodeLabels] = this.extractNamedColumnsToStringArrays(
      attrs.nodesData, [
        NODE_ID_KEY, NODE_LABEL_KEY
      ]
    );
    var [linkSourceIds, linkTargetIds] = this.extractNamedColumnsToStringArrays(
      attrs.linksData, [
        LINK_SOURCE_ID_KEY, LINK_TARGET_ID_KEY
      ]
    );
    return this.createSGDFromDataColumns({
      nodeIds: nodeIds,
      nodeLabels: nodeLabels,
      linkSourceIds: linkSourceIds,
      linkTargetIds: linkTargetIds
    });
  },

  // data should be loaded with COLUMNS as the major dimension
  extractNamedColumnsToStringArrays(data: any[][], columnNames: string[]): string[][] {
    var columnNamesToIndex = new Map<String, number>();
    columnNames.forEach((columnName, index) => {
      if (columnNamesToIndex.has(columnName)) {
        throw new Error("duplicate column name: " + columnName);
      }
      columnNamesToIndex.set(columnName, index);
    });
    var columnIndexes = columnNames.map(() => -1);
    data.forEach((columnData, sourceIndex) => {
      if (columnData.length > 0) {
        const columnName = extractValueAsString(columnData[0]);
        const index = columnNamesToIndex.get(columnName);
        if (index !== undefined) {
          columnIndexes[index] = sourceIndex;
        }
      }
    });
    return columnIndexes.map((index, nth) => {
      if (index === -1) {
        throw new Error("could not find column: " + columnNames[nth]);
      }
      return extractValuesAsStringSkipFirst(data[index]);
    });
  }
};

function extractValueAsString(value: any): string {
  if (value === undefined || value === null) {
    return "";
  } else {
    return "" + value;
  }
}

function extractValuesAsStringSkipFirst(values: any[]): string[] {
  if (values.length < 2) {
    return [];
  }
  var result = new Array(values.length - 1);
  for (var i = 1; i < values.length; ++i) {
    result[i - 1] = extractValueAsString(values[i]);
  }
  return result;
}

export function loadDataFromSheet(sheetId: string) {
  /* */
}
