# xunit-to-nunit

[![npm version](https://badge.fury.io/js/xunit-to-nunit.svg)](https://badge.fury.io/js/xunit-to-nunit)
[![Build Status](https://travis-ci.org/jmsv/xunit-to-nunit.svg?branch=master)](https://travis-ci.org/jmsv/xunit-to-nunit)
[![Dependencies](https://www.versioneye.com/user/projects/59819587368b080078e5cabc/badge.svg)](https://www.versioneye.com/user/projects/59819587368b080078e5cabc?child=summary)

[![NPM](https://nodei.co/npm/xunit-to-nunit.png)](https://nodei.co/npm/xunit-to-nunit/)

Converts C# XUnit tests to NUnit tests.

_Disclaimer: Far from perfect - something I used as a quick hack to convert loads of large tests_

## Links

- Converter app: [jmsv.github.io/xunit-to-nunit](https://jmsv.github.io/xunit-to-nunit)
- Node module: [npmjs.com/package/xunit-to-nunit](https://www.npmjs.com/package/xunit-to-nunit)

## :package: Installation

```bash
npm install xunit-to-nunit
```

## Usage

### Require

```javascript
var x2n = require('xunit-to-nunit')
```

### Convert test from string

```javascript
var nunitTest = x2n.convertCode(xunitTest)
```

### Convert test from file

```javascript
x2n.convertFile('xunit-source-path.cs', 'nunit-destination-path.cs')
```

### Convert tests from directory

```javascript
x2n.convertFiles('xunit/source/directory', 'nunit/destination/directory')
```

This function calls `convertFile` for all files in the source directory.

#### Options

`convertFiles` has a third (optional) parameter: `options`. This should be a dictionary value, containing all or any of the following  parameters:

##### :wrench: recursive (default: `false`)

Set to `true`, this parameter will convert tests in all subdirectories including those at the source root. Directory structure is maintained at the conversion destination.

##### :wrench: verbose (default: `true`)

When `true`, the module logs an info message to the terminal when a file is converted. When a file conversion fails, a error log message is displayed regardless of the value of `verbose`.

For example,

```javascript
var options = {
  recursive: true,
  verbose: false
}

x2n.convertFiles('xunit/source/directory', 'nunit/destination/directory', options)
```

#### Writing converted tests to source directory

When _source = destination_, '`_NUnit`' is appended to the filename. For example, where _destination = `dir`_, `dir/SomeTests.cs` is converted and the result is written to `dir/SomeTests_NUnit.cs`.

This behaviour can be changed with the following parameters:

##### :wrench: append (default: `'_NUnit'`)

String to be appended to filenames when writing destination files to the source directory.

##### :wrench: overwrite (default: `false`)

If _`overwrite` = true_, `append` is ignored, and source files are overwritten at destination.

For example,

```javascript
// Append destination filenames with `append` text
var options = {
  append: '_Test',
  overwrite: false // `overwrite` is false by default
}

// or, overwrite source files
var options = {
  overwrite: true
}

x2n.convertFiles('xunit/source/directory', 'nunit/destination/directory', options)

```

## Contributing

Feel free to add things / suggest things to be added by either [opening an issue](https://github.com/jmsv/xunit-to-nunit/issues) or by submitting a pull request.

## References

- https://xunit.github.io/docs/comparisons.html
