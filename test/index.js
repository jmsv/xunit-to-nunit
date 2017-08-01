var dirsum = require('dirsum');
var path = require('path');
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


function dirsAreEqual(paths, callback) {
  if (paths.filepath) { // Remove filename
    paths.destination = path.dirname(paths.destination);
    paths.expected = path.dirname(paths.expected);
  }

  dirsum.digest(paths.destination, 'sha1', function (err1, res1) {
    dirsum.digest(paths.expected, 'sha1', function (err2, res2) {
      result = {
        actual: {
          err: err1,
          res: res1
        },
        expected: {
          err: err2,
          res: res2
        }
      };
      // console.log(result.actual.res.hash + "  |  " + result.expected.res.hash);
      callback(result);
    });
  });
}


describe('#convertFile', function () {
  it('can convert test file', function (done) {
    var paths = {
      source: 'test/test1/xunit/test.cs',
      destination: 'test/test1/nunit-actual/test.cs',
      expected: 'test/test1/nunit-expected/test.cs',
      filepath: true
    };

    convertFile(paths.source, paths.destination).should.equal(true);

    dirsAreEqual(paths, function(result) {
      should.equal(result.actual.err, undefined);
      should.equal(result.expected.err, undefined);
      result.actual.res.should.not.equal(undefined);
      result.actual.res.hash.should.equal(result.expected.res.hash);
      done();
    });
  });
});


describe('#convertFiles', function () {
  it('can convert test files (rel paths)', function (done) {
    var opt = {
      recursive: true
    };
    var paths = {
      source: 'test/test2/xunit',
      destination: 'test/test2/nunit-actual',
      expected: 'test/test2/nunit-expected',
      filepath: false
    };

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths, function(result) {
      should.equal(result.actual.err, undefined);
      should.equal(result.expected.err, undefined);
      result.actual.res.should.not.equal(undefined);
      result.actual.res.hash.should.equal(result.expected.res.hash);
      done();
    });

  });


  it('can convert test files (abs paths)', function (done) {
    var opt = {
      recursive: true
    }
    var paths = {
      source: __dirname + '/test3/xunit',
      destination: __dirname + '/test3/nunit-actual',
      expected: __dirname + '/test3/nunit-expected',
      filepath: false
    };

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths, function(result) {
      should.equal(result.actual.err, undefined);
      should.equal(result.expected.err, undefined);
      result.actual.res.should.not.equal(undefined);
      result.actual.res.hash.should.equal(result.expected.res.hash);
      done();
    });

  });


  it('can convert test files (no options param)', function (done) {
    var paths = {
      source: 'test/test4/xunit',
      destination: 'test/test4/nunit-actual',
      expected: 'test/test4/nunit-expected',
      filepath: false
    };

    convertFiles(paths.source, paths.destination);

    dirsAreEqual(paths, function(result) {
      should.equal(result.actual.err, undefined);
      should.equal(result.expected.err, undefined);
      result.actual.res.should.not.equal(undefined);
      result.actual.res.hash.should.equal(result.expected.res.hash);
      done();
    });

  });

});
