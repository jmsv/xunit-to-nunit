var x2n = require('xunit-to-nunit');

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


// Set up Angular module, with controller
angular.module('XUnitToNUnit', [])
    .controller('ConverterController', function ($scope) {
        var ConverterController = this;
        $scope.XUnitIn = exampleTest;
        $scope.NUnitOut = "";

        $scope.updateXUnitIn = function () {
            $scope.NUnitOut = x2n.convertCode($scope.XUnitIn);
        }

        $scope.updateXUnitIn();
    });
