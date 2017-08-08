var log = require('color-log');
var fs = require('fs');
var path = require('path');
var glob = require('glob');


String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
}
String.prototype.insertAt = function (index, string) {
  return this.substr(0, index) + string + this.substr(index);
}



module.exports.examples = [{
  xunit: `using Xunit;
using Xunit.Abstractions;

public class SomeTests
{
    [Fact]
    public void Test1()
    {
        string testString = "avocado";

        Assert.NotEmpty(testString);
        Assert.Equal("avocado", testString);
        Assert.NotEqual("potato", testString);
    }
 
    [Theory]
    [InlineData(5, 15)]
    [InlineData(6, 18)]
    [InlineData(7, 21)]
    public void Test2(int number1, int number2)
    {
        var result = number2 / number1;
        Assert.Equal(3, result);
    }
}`,
  nunit: `using NUnit.Framework;

[TestFixture]
public class SomeTests
{
    [Test]
    public void Test1()
    {
        string testString = "avocado";

        Assert.IsNotEmpty(testString);
        Assert.AreEqual("avocado", testString);
        Assert.AreNotEqual("potato", testString);
    }
 
    [Test]
    [TestCase(5, 15)]
    [TestCase(6, 18)]
    [TestCase(7, 21)]
    public void Test2(int number1, int number2)
    {
        var result = number2 / number1;
        Assert.AreEqual(3, result);
    }
}`
}];


// Assert calls to be converted are listed here
var assertsList = [{
    XUnitAssert: 'Equal',
    NUnitAssert: 'AreEqual'
  },
  {
    XUnitAssert: 'NotEqual',
    NUnitAssert: 'AreNotEqual'
  },
  {
    XUnitAssert: 'Same',
    NUnitAssert: 'AreSame'
  },
  {
    XUnitAssert: 'NotSame',
    NUnitAssert: 'AreNotSame'
  },
  {
    XUnitAssert: 'Empty',
    NUnitAssert: 'IsEmpty'
  },
  {
    XUnitAssert: 'NotEmpty',
    NUnitAssert: 'IsNotEmpty'
  },
  {
    XUnitAssert: 'IsType',
    NUnitAssert: 'IsInstanceOfType'
  },
  {
    XUnitAssert: 'IsNotType',
    NUnitAssert: 'IsNotInstanceOfType'
  },
  {
    XUnitAssert: 'Null',
    NUnitAssert: 'IsNull'
  },
  {
    XUnitAssert: 'NotNull',
    NUnitAssert: 'IsNotNull'
  },
  {
    XUnitAssert: 'True',
    NUnitAssert: 'IsTrue'
  },
  {
    XUnitAssert: 'False',
    NUnitAssert: 'IsFalse'
  },
];


// Other differences between XUnit and NUnit that should be converted
var otherSyntaxDifferenceList = [{
    XUnitSyntax: ['using Xunit;'],
    NUnitSyntax: 'using NUnit.Framework;'
  },
  {
    XUnitSyntax: ['[Fact]', '[Fact()]', '[Theory]', '[Theory()]'],
    NUnitSyntax: '[Test]'
  },
  {
    XUnitSyntax: ['InlineData('],
    NUnitSyntax: 'TestCase('
  },
  {
    XUnitSyntax: ['ClassData('],
    NUnitSyntax: 'TestCaseSource('
  },
  {
    XUnitSyntax: ['Assert.Contains("'],
    NUnitSyntax: 'StringAssert.Contains("'
  },
];


// Converts Assert statements for each Assert type in assertsList (line 1)
function convertLineAssert(line) {
  for (var i = 0; i < assertsList.length; i++) {
    var x = 'Assert.' + assertsList[i].XUnitAssert + '(';
    var n = 'Assert.' + assertsList[i].NUnitAssert + '(';
    line = line.replace(x, n);
  }
  return line;
}


// Adds [TestFixture] above classes named {name}Facts or {name}Tests
function addTestFixtureAttributes(lines) {
  for (var i = 0; i < lines.length; i++) {
    if (/^( *public *class \w+(Facts|Tests) *)/.test(lines[i])) {
      if (!(i > 0 && lines[i - 1].indexOf('[TestFixture]') > -1)) {
        var spaces = '';
        for (var j = 0; j < lines[i].search(/\S/); j++) spaces += ' ';

        lines[i] = spaces + '[TestFixture]\n' + lines[i];
      }
    }
  }
  return lines;
}


// Remove line from list of lines if matches search string
function removeLineFromList(linesList, searchString) {
  for (var i = linesList.length - 1; i--;) {
    if (linesList[i].indexOf(searchString) > -1) linesList.splice(i, 1);
  }
  return linesList;
}


// Convert line from XUnit syntax to NUnit syntax, including Assert statements
module.exports.convertLine = function (line) {
  line = convertLineAssert(line);

  for (var i = 0; i < otherSyntaxDifferenceList.length; i++) {
    for (var j = 0; j < otherSyntaxDifferenceList[i].XUnitSyntax.length; j++) {
      var x = otherSyntaxDifferenceList[i].XUnitSyntax[j];
      var n = otherSyntaxDifferenceList[i].NUnitSyntax;
      line = line.replace(x, n);
    }
  }

  return line;
};


// Main method to convert code
module.exports.convertCode = function (codeIn) {
  // Split code into list, breaking at newlines
  var codeLines = codeIn.split('\n');

  for (var i = 0; i < codeLines.length; i++) {
    codeLines[i] = module.exports.convertLine(codeLines[i]);
  }

  codeLines = addTestFixtureAttributes(codeLines);
  codeLines = removeLineFromList(codeLines, 'using Xunit.Abstractions;');

  // Join list of lines to form newline seperated string
  var codeOut = codeLines.join('\n');
  return codeOut;
};


function appendFilepath(filepath, append) {
  if (!filepath || !append) return;
  var index = filepath.indexOf('.cs');
  var result = filepath.insertAt(index, append);
  return result;
}


// Method to convert test in file
module.exports.convertFile = function (source, destination, verbose, overwrite, append) {
  if (verbose == null) verbose = true;

  if (source == destination) {
    if (overwrite) append = null;
    // If something should be appended to filename
    if (append != null) {
      destination = appendFilepath(destination, append);
    } else {
      if (!overwrite) {
        throw new Error("overwrite is false, and no `append` parameter specified.");
      }
    }
  }

  var data = '';
  try {
    data = fs.readFileSync(source, 'utf-8');
  } catch (e) {
    log.error('Error loading file:  ' + source);
    throw e;
  }

  var converted = '';
  try {
    converted = module.exports.convertCode(data);
  } catch (e) {
    log.error('Error converting test');
    throw e;
  }

  try {
    fs.writeFileSync(destination, converted, 'utf-8');
  } catch (e) {
    log.error('Error writing file:  ' + destination);
    throw e;
  }

  if (verbose) log.info('Test saved to ' + destination + ' successfully');

  return true;
};


function uniformPath(path) {
  var result = path.replaceAll('\\\\', '/');
  return result;
}


module.exports.convertFiles = function (sourceDir, destinationDir, options) {
  optionsTemplate = {
    recursive: false,
    verbose: true,
    append: '_NUnit',
    overwrite: false
  };
  options = options || optionsTemplate;

  for (var key in optionsTemplate) {
    if (!optionsTemplate.hasOwnProperty(key)) continue;

    if (!options.hasOwnProperty(key)) {
      options[key] = optionsTemplate[key];
    }
  }

  if (!fs.existsSync(destinationDir)) {
    throw new Error("NUnit destination doesn't exist. Please create the directory: " + destinationDir);
  }

  var recurPath = "";
  if (options.recursive) recurPath = "/**";

  // Get source file paths, taking into account whether or not to recur into subdirs
  var sourcePaths = glob.sync(sourceDir + recurPath + "/*.cs");

  for (var i = 0; i < sourcePaths.length; i++) {
    // Resolve to absolute paths
    sourcePaths[i] = path.resolve(sourcePaths[i]);
  }

  files = [];
  for (var j = 0; j < sourcePaths.length; j++) {
    var relativePath = sourcePaths[j].replace(path.resolve(sourceDir), '');

    files.push({
      sourcePath: uniformPath(sourcePaths[j]),
      relativePath: uniformPath(relativePath),
      destinationPath: uniformPath(path.resolve(destinationDir + relativePath)),
    });

    var dir = path.dirname(files[j].destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    module.exports.convertFile(files[j].sourcePath, files[j].destinationPath,
      options.verbose, options.overwrite, options.append);
  }

  return true;
};