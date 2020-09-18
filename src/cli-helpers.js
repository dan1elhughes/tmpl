module.exports.formatToNative = (format) =>
  ({
    string: String,
    boolean: Boolean,
  }[format]);
