import initProps from './initialproperties';
import props from './properties';
import paint from './paint';

export default {
  definition: props,
  initialProperties: initProps,
  snapshot: {
    canTakeSnapshot: true
  },
  paint: function ( $element, layout ) {
    let self = this;
    try {
      paint($element, layout, self);
    } catch (exception) {
      console.error(exception); // eslint-disable-line no-console
      throw(exception);
    }
  }
};
