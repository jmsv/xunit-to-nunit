var assertsList = [
    {
        AssertType: 'Equal',
        Criteria: 'Is.EqualTo(',
    },
];

String.prototype.insertAt = function (index, string) {
    return this.substr(0, index) + string + this.substr(index);
}

function getCriteriaIndex(line, startIndex) {
    var countParenthesis = 0;
    var countBracket = 0;
    var inQuote = false;
    var inDoubleQuote = false;
    for (var i = startIndex + 1; i <= line.length; i++) {
        if (line[i] == '(') countParenthesis += 1;
        if (line[i] == ')') countParenthesis -= 1;
        if (line[i] == '[') countBracket += 1;
        if (line[i] == ']') countBracket += 1;
        if (line[i] == '\'') inQuote = !inQuote;
        if (line[i] == '"') inDoubleQuote = !inDoubleQuote;
        if (countParenthesis == 0 &
            countBracket == 0 &
            !inQuote &
            !inDoubleQuote &
            line[i] == ',') {
            return i + 1;
        }
    }
}

function convertSingleAssert(line, assert) {
    var index = line.indexOf(assert.AssertType);
    if (index < 0) {
        return line;
    }
    var bracketIndex = index + assert.AssertType.length;
    var criteriaIndex = getCriteriaIndex(line, bracketIndex);
    line = line.insertAt(criteriaIndex + 1, assert.Criteria);
    if (assert.Criteria[assert.Criteria.length - 1] == '(') {
        if (line[line.length - 1] == ';') {
            line = line.insertAt(line.length - 1, ')');
        } else {
            line = line + ')';
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

function addTestFixtureLine(line){
    if (/^( *public *class \w+Facts *)/.test(line)){
        var spaces = '';
        for (var i = 0; i < line.search(/\S/); i++) spaces += ' ';
        line = spaces + '[TestFixture]\n' + line;
    }
    return line;
}

function convertLine(line) {
    line = line.replace("using Xunit", "using NUnit.Framework");
    line = convertLineAssert(line);
    line = line.replace('[Fact]', '[Test]');
    line = line.replace('InlineData', 'TestCase');
    line = addTestFixtureLine(line);
    return line;
}

function convertCode(codeIn) {
    var codeLines = codeIn.split('\n');
    console.log(codeLines);

    for (var i = 0; i < codeLines.length; i++) {
        codeLines[i] = convertLine(codeLines[i]);
    }

    var codeOut = codeLines.join('\n');
    return codeOut;
}

angular.module('XUnitToNUnit', [])
    .controller('ConverterController', function ($scope) {
        var ConverterController = this;
        $scope.XUnitIn = "Assert.Equal(32, emp.Id.Length);\nAssert.Equal(\"simple\", emp.Name);";
        $scope.NUnitOut = "using NUnit.Framework;";

        $scope.updateXUnitIn = function () {
            $scope.NUnitOut = convertCode($scope.XUnitIn);
        }
    });
