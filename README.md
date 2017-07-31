# xunit-to-nunit

[![npm version](https://badge.fury.io/js/xunit-to-nunit.svg)](https://badge.fury.io/js/xunit-to-nunit)
[![circleci status](https://circleci.com/gh/jamesevickery/xunit-to-nunit.svg?style=shield)](https://circleci.com/gh/jamesevickery/xunit-to-nunit)
[![Build Status](https://travis-ci.org/jamesevickery/xunit-to-nunit.svg?branch=master)](https://travis-ci.org/jamesevickery/xunit-to-nunit)

[![NPM](https://nodei.co/npm/xunit-to-nunit.png)](https://nodei.co/npm/xunit-to-nunit/)

Converts C# XUnit tests to NUnit tests.

_Disclaimer: Far from perfect - something I used as a quick hack to convert loads of large tests_

## Links

- Interactive converter app ([gh-pages](https://github.com/jamesevickery/xunit-to-nunit/tree/gh-pages)): [jamesevickery.github.io/xunit-to-nunit](https://jamesevickery.github.io/xunit-to-nunit)
- Node module: [npmjs.com/package/xunit-to-nunit](https://www.npmjs.com/package/xunit-to-nunit)

## Installation

```bash
npm install xunit-to-nunit --save
```

## Usage

### Require

```javascript
var x2n = require('xunit-to-nunit');
```

### Convert test (string)

```javascript
var nunitTest = x2n.convertCode(xunitTest);
```

### Convert test (file)

```javascript
x2n.convertFile('xunit-source-path.cs', 'nunit-destination-path.cs');
```

## Contributing

Feel free to add things / suggest things to be added by either [opening an issue](https://github.com/jamesevickery/xunit-to-nunit/issues) or by submitting a pull request.

## References

- https://xunit.github.io/docs/comparisons.html
