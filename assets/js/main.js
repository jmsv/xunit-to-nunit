// Assert calls to be converted are listed here
var assertsList = [
    {
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
var otherSyntaxDifferenceList = [
    {
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
]


// This test is loaded into the XUnit paste box on page load
var exampleTest = `using Xunit;
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
}
`;


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
    return linesList
}


// Convert line from XUnit syntax to NUnit syntax, including Assert statements
function convertLine(line) {
    line = convertLineAssert(line);
    line = addTestFixtureLine(line);
    
    for (var i = 0; i < otherSyntaxDifferenceList.length; i++) {
        var x = otherSyntaxDifferenceList[i].XUnitSyntax;
        var n = otherSyntaxDifferenceList[i].NUnitSyntax;
        line = line.replace(x, n);
    }
    
    return line;
}


// Main method to convert code
function convertCode(codeIn) {
    // Split code into list, breaking at newlines
    var codeLines = codeIn.split('\n');

    for (var i = 0; i < codeLines.length; i++) {
        codeLines[i] = convertLine(codeLines[i]);
    }

    codeLines = removeLineFromList(codeLines, 'using Xunit.Abstractions;');

    // Join list of lines to form newline seperated string
    var codeOut = codeLines.join('\n');
    return codeOut + '\n';
}


// Display message when converted test has been copied
function showCopiedSnackbar() {
    var x = document.getElementById("snackbar")
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}


// Function to run when page loads
function loadPage() {
    // Initialise clipboard
    new Clipboard('.clipboard');
}
window.onload = loadPage; // Runs above function


// Set up Angular module, with controller
angular.module('XUnitToNUnit', [])
    .controller('ConverterController', function ($scope) {
        var ConverterController = this;
        $scope.XUnitIn = exampleTest;
        $scope.NUnitOut = "";

        $scope.updateXUnitIn = function () {
            $scope.NUnitOut = convertCode($scope.XUnitIn);
        }

        $scope.updateXUnitIn();
    });
