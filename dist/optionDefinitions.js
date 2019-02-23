const optionDefinitions = [
  {
    name: 'verbose',
    alias: 'v',
    type: Boolean
  },
  {
    name: 'src',
    type: String,
  },
  {
    name: 'timeout',
    alias: 't',
    type: Number,
    defaultValue: 3
  }
];
exports.optionDefinitions = optionDefinitions;
