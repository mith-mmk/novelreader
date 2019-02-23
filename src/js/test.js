const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    description: 'Display this usage',
    type: Boolean
  },
  {
    name: 'debug',
    alias: 'd',
    description: 'Debug mode',
    type: Boolean
  },
  {
    name: 'file',
    description: 'open file',
    type: String,
    defaultOption: true
  },

/*
  {
    name: 'port',
    alias: 'p',
    description: 'localserver pots',
    type: Number
  },
*/
];
const options = commandLineArgs(optionDefinitions);
console.log(options);