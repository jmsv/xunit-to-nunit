function convertCode(codeIn){
    return codeIn;
}

angular.module('XUnitToNUnit', [])
  .controller('ConverterController', function($scope) {
    var ConverterController = this;
    $scope.XUnitIn = "using Xunit;";
    $scope.NUnitOut = "using NUnit.Framework;";
    
    $scope.updateXUnitIn = function(){
        $scope.NUnitOut = convertCode($scope.XUnitIn);
    }
});
