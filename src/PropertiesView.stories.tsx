import { storiesOf } from "@storybook/react";

import * as helpers from "./helpers.stories";
import * as PropertiesView from "./PropertiesView";
import { GraphDocument } from "./data/GraphDocument";
import { SimpleListenable } from "./data/Listenable";
// import { action } from "@storybook/addon-actions";
// import { linkTo } from "@storybook/addon-links";

const DEFAULT_PROPS = (): PropertiesView.Props => {
  return {
    actionManager: helpers.stubActionManager,
    isOpen: true,
    document: GraphDocument.empty(),
    simulationConfigListener: new SimpleListenable()
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
