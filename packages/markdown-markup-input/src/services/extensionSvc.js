const initConverterListeners = [];

export default {
  onInitConverter(priority, listener) {
    initConverterListeners[priority] = listener;
  },

  initConverter(markdown, options) {
    // Use forEach as it's a sparsed array
    initConverterListeners.forEach(listener => {
      listener(markdown, options);
    });
  },
};
