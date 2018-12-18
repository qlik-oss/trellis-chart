import initProps from './initialProperties';
import props from './properties';
import paint from './paint';

export default {
  definition: props,
  initialProperties: initProps,
  snapshot: {
    canTakeSnapshot: true
  },
  paint: function ( $element, layout ) {
    try {
      paint($element, layout);
    } catch (exception) {
      console.error(exception); // eslint-disable-line no-console
    }
  }
};
