// Assert calls to be converted should be listed here:
var assertsList = [
    {
        AssertType: 'Equal',
        Criteria: 'Is.EqualTo(',
        Comparison: true,
    },
    {
        AssertType: 'NotEmpty',
        Criteria: 'Is.Not.Empty',
        Comparison: false,
    },
    {
        AssertType: 'NotEqual',
        Criteria: 'Is.Not.EqualTo(',
        Comparison: true,
    },
    {
        AssertType: 'Contains',
        Criteria: 'Does.Contain(',
        Comparison: true,
    },
];


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
        Assert.Contains("avo", testString);
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


String.prototype.insertAt = function (index, string) {
    return this.substr(0, index) + string + this.substr(index);
}


function getEndOfParamIndex(line, startOfParamIndex) {
    if (line == '/\S/') return '';
    var countParenthesis = 0;
    var countBracket = 0;
    var inQuote = false;
    var inDoubleQuote = false;
    for (var i = startOfParamIndex; i <= line.length; i++) {
        if (line[i] == '(') countParenthesis += 1;
        if (line[i] == ')') countParenthesis -= 1;
        if (line[i] == '[') countBracket += 1;
        if (line[i] == ']') countBracket -= 1;
        if (line[i] == '\'') inQuote = !inQuote;
        if (line[i] == '"') inDoubleQuote = !inDoubleQuote;
        if (line[i] == ';') {
            return i - 1;
        }
        if (line[i] == ',') {
            if (countParenthesis == 0 &
                countBracket == 0 &
                !inQuote &
                !inDoubleQuote) {
                return i;
            }
        }
    }
    return line.length;
}


function getCriteriaIndex(line, startIndex) {
    getEndOfParamIndex(line, startIndex);
}


function getNextParamStartIndex(line, endOfFirstParamIndex) {
    for (var i = endOfFirstParamIndex; i < line.length; i++) {
        if (!(line[i] == ',' | line[i] == '/\S/')) {
            return i;
        }
    }
}


function swapTwoAssertParams(line, openBracketIndex) {
    if (line[openBracketIndex] != '(') {
        return 'invalid openBracketIndex supplied';
    }
    var firstParamEndIndex = getEndOfParamIndex(line, openBracketIndex + 1);
    var paramFirst = line.substring(openBracketIndex + 1, firstParamEndIndex);
    var secondParamStartIndex = getNextParamStartIndex(line, firstParamEndIndex + 1);
    var secondParamEndIndex = getEndOfParamIndex(line, getEndOfParamIndex(line, secondParamStartIndex));
    var paramSecond = line.substring(secondParamStartIndex + 1, secondParamEndIndex);
    return line.substring(0, openBracketIndex) + '(' + paramSecond + ', ' + paramFirst + ');';
}


function getStandaloneCriteriaIndex(line) {
    for (var i = line.length - 1; i > 0; i--) {
        if (!(line[i] == ')' | line[i] == ';')) {
            return i + 1;
        }
    }
}


function convertSingleAssert(line, assert) {
    var assertCallName = 'Assert.' + assert.AssertType;
    var index = line.indexOf(assertCallName);
    if (index < 0) {
        return line;
    }
    var bracketIndex = index + assertCallName.length;

    if (assert.Comparison) {
        line = swapTwoAssertParams(line, bracketIndex);
        var criteriaIndex = getEndOfParamIndex(line, bracketIndex + 1) + 1;
        line = line.insertAt(criteriaIndex + 1, assert.Criteria);
    } else {
        var insertIndex = getStandaloneCriteriaIndex(line)
        line = line.insertAt(insertIndex, ', ' + assert.Criteria);
    }

    if (assert.Criteria[assert.Criteria.length - 1] == '(') {
        if (line[line.length - 1] == ';') {
            line = line.insertAt(line.length - 1, ')');
        } else {
            line += ')';
        }
    }
    line = line.replace(assert.AssertType, 'That');
    return line;
}


function convertLineAssert(line) {
    for (var i = 0; i < assertsList.length; i++) {
        line = convertSingleAssert(line, assertsList[i])
    }
    return line;
}


function addTestFixtureLine(line) {
    if (/^( *public *class \w+Facts *)/.test(line)) {
        var spaces = '';
        for (var i = 0; i < line.search(/\S/); i++) spaces += ' ';
        line = spaces + '[TestFixture]\n' + line;
    }
    return line;
}


function convertLine(line) {
    line = line.replace("using Xunit;", "using NUnit.Framework;");
    line = convertLineAssert(line);
    line = line.replace("using Xunit;", "using NUnit.Framework;");
    line = line.replace('[Fact]', '[Test]');
    line = line.replace('[InlineData', '[TestCase');
    line = line.replace('[ClassData', '[TestCaseSource');
    line = addTestFixtureLine(line);
    return line;
}


function convertCode(codeIn) {
    var codeLines = codeIn.split('\n');

    for (var i = 0; i < codeLines.length; i++) {
        codeLines[i] = convertLine(codeLines[i]);
    }

    for (var i = codeLines.length - 1; i--;) {
        if (codeLines[i] === 'using Xunit.Abstractions;') {
            codeLines.splice(i, 1);
        }
    }

    var codeOut = codeLines.join('\n');
    return codeOut + '\n';
}


function showCopiedSnackbar() {
    var x = document.getElementById("snackbar")
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}


function loadPage() {
    new Clipboard('.clipboard');
}
window.onload = loadPage;


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
