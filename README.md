# xunit-to-nunit

Converts C# XUnit tests to NUnit tests.

https://jamesevickery.github.io/xunit-to-nunit

_Disclaimer: Far from perfect - used as a quick hack to convert loads of large tests_

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
