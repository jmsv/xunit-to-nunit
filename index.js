var log = require('color-log');
var fs = require('fs');
var path = require('path');
var glob = require('glob');


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
    XUnitSyntax: 'using Xunit;',
    NUnitSyntax: 'using NUnit.Framework;'
  },
  {
    XUnitSyntax: '[Fact]',
    NUnitSyntax: '[Test]'
  },
  {
    XUnitSyntax: '[Theory]',
    NUnitSyntax: '[Test]'
  },
  {
    XUnitSyntax: 'InlineData(',
    NUnitSyntax: 'TestCase('
  },
  {
    XUnitSyntax: 'ClassData(',
    NUnitSyntax: 'TestCaseSource('
  },
  {
    XUnitSyntax: 'Assert.Contains("',
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
function addTestFixtureLine(line) {
  if (/^( *public *class \w+(Facts|Tests) *)/.test(line)) {
    var spaces = '';
    for (var i = 0; i < line.search(/\S/); i++) spaces += ' ';
    line = spaces + '[TestFixture]\n' + line;
  }
  return line;
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
  line = addTestFixtureLine(line);

  for (var i = 0; i < otherSyntaxDifferenceList.length; i++) {
    var x = otherSyntaxDifferenceList[i].XUnitSyntax;
    var n = otherSyntaxDifferenceList[i].NUnitSyntax;
    line = line.replace(x, n);
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

  codeLines = removeLineFromList(codeLines, 'using Xunit.Abstractions;');

  // Join list of lines to form newline seperated string
  var codeOut = codeLines.join('\n');
  return codeOut;
};


// Method to convert test in file
module.exports.convertFile = function (source, destination, verbose) {
  verbose = verbose | true;
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


module.exports.convertFiles = function (sourceDir, destinationDir, options) {
  optionsTemplate = {
    recursive: false,
    verbose: true
  };
  options = options || optionsTemplate;

  for (var key in optionsTemplate) {
    if (!optionsTemplate.hasOwnProperty(key)) continue;

    if (!options.hasOwnProperty(key)) {
      options[key] = optionsTemplate[key];
    }
  }

  if (!fs.existsSync(destinationDir)){
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
  for (var i = 0; i < sourcePaths.length; i++) {
    var relativePath = sourcePaths[i].replace(path.resolve(sourceDir), '');

    files.push({
      sourcePath: sourcePaths[i],
      relativePath: relativePath,
      destinationPath: destinationDir + relativePath,
    });

    var dir = path.dirname(files[i].destinationPath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    module.exports.convertFile(files[i].sourcePath, files[i].destinationPath, options.verbose);
  }

  return true;
}