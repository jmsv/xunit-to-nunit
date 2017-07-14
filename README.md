# xunit-to-nunit

Converts C# XUnit tests to NUnit tests.

https://jamesevickery.github.io/xunit-to-nunit

_Disclaimer: Far from perfect - used as a quick hack to convert loads of large tests_

## Installation

    npm install xunit-to-nunit --save

## Usage

    var converter = require('xunit-to-nunit')

    nunitTest = converter.convertCode(xunitTest);

## References

- https://xunit.github.io/docs/comparisons.html
