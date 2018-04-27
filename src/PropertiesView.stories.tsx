import { storiesOf } from "@storybook/react";

import * as helpers from "./helpers.stories";
import * as PropertiesView from "./PropertiesView";
import { GraphDocument } from "./data/GraphDocument";
// import { action } from "@storybook/addon-actions";
// import { linkTo } from "@storybook/addon-links";

const DEFAULT_PROPS = (): PropertiesView.Props => {
  const document = GraphDocument.empty();
  return {
    actionManager: helpers.stubActionManager,
    isOpen: true,
    document: document,
    simulationConfigListener: helpers.createSimpleActionListener(
      "simulation config changed",
      () => {
        return [document.layoutState.forceSimulationConfig];
      }
    )
  };
};

const addVariation = helpers.createVariations({
  storyGroup: storiesOf("PropertiesView", module),
  componentClass: PropertiesView.Component,
  defaultProps: DEFAULT_PROPS,
  showCorners: true
});

// basic states
addVariation("normal", {});
