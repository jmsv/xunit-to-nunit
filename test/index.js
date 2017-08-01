var should = require('chai').should(),
  x2n = require('../index'),
  convertCode = x2n.convertCode,
  convertLine = x2n.convertLine,
  convertFile = x2n.convertFile,
  convertFiles = x2n.convertFiles;


var testCases = [{
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


describe('#convertCode', function () {
  it('example test is converted correctly', function () {
    convertCode(testCases[0].xunit).should.equal(testCases[0].nunit);
  });
});

describe('#convertLine', function () {
  it('using <framework> statement converted', function () {
    convertLine('using Xunit;').should.equal('using NUnit.Framework;');
  });
});

describe('#convertFile', function () {
  it('can convert test file', function () {
    convertFile('test/test1-xunit.cs', 'test/test1-nunit-sync-actual.cs').should.equal(true);
    // Should check actual = expected
  });
});

describe('#convertFiles', function () {
  it('can convert test files (rel paths)', function () {
    var opt = {
      recursive: true
    }
    convertFiles('test/test2/xunit', 'test/test2/nunit-actual', opt);
  });

  it('can convert test files (abs paths)', function () {
    var opt = {
      recursive: true
    }
    convertFiles(__dirname + '/test3/xunit', __dirname + '/test3/nunit-actual', opt);
  });
});
