var fs = require('fs');
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
    if (linesList[i] === searchString) linesList.splice(i, 1);
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
module.exports.convertFile = function (source, destination) {
  var data = fs.readFileSync(source, 'utf-8');

  var converted = module.exports.convertCode(data);

  fs.writeFileSync(destination, converted, 'utf-8');

  return true;
};


module.exports.convertFiles = function (sourceDir, destinationDir, options={}) {
  optionsTemplate = {
    recursive: false
  };

  for (var key in optionsTemplate) {
    if (!optionsTemplate.hasOwnProperty(key)) continue;

    if (!options.hasOwnProperty(key)) {
      options[key] = optionsTemplate[key];
    }
  }

  var recurPath = "";
  if (options.recursive) recurPath = "/**";
  var sourcePaths = glob.sync(sourceDir + recurPath + "/*.cs");

  files = [];
  for (var i = 0; i < sourcePaths.length; i++) {
    var relativePath = sourcePaths[i].replace(sourceDir, '');

    files.push({
      sourcePath: sourcePaths[i],
      relativePath: relativePath,
      destinationPath: destinationDir + relativePath
    });

    module.exports.convertFile(files[i].sourcePath, files[i].destinationPath);
  }

  return true;
}