var fs = require("fs-extra");
var dircompare = require('dir-compare');
var path = require('path');
var should = require('chai').should(),
  x2n = require('../index'),
  convertCode = x2n.convertCode,
  convertLine = x2n.convertLine,
  convertFile = x2n.convertFile,
  convertFiles = x2n.convertFiles;


var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


var resetDir = function (path) {
  deleteFolderRecursive(path);

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};


describe('#convertCode', function () {
  it('example test is converted correctly', function () {
    convertCode(x2n.examples[0].xunit).should.equal(x2n.examples[0].nunit);
  });

  it('shouldn\'t add a TestFixture where there already is one', function () {
    var testcase = {
      xunit: 'using Xunit;\n[TestFixture]\npublic class SomeTests\n{\n}',
      nunit: 'using NUnit.Framework;\n[TestFixture]\npublic class SomeTests\n{\n}'
    };
    convertCode(testcase.xunit).should.equal(testcase.nunit);
  });
});


describe('#convertLine', function () {
  it('converts using <framework> statement', function () {
    convertLine('using Xunit;').should.equal('using NUnit.Framework;');
  });

  it('converts [Fact] and [Fact()] etc. to [Test]', function () {
    convertLine('[Fact]').should.equal('[Test]');
    convertLine('[Fact()]').should.equal('[Test]');
    convertLine('    [Theory]').should.equal('    [Test]');
  });
});


function dirsAreEqual(paths) {
  if (paths.filepath) { // Remove filename
    paths.destination = path.dirname(paths.destination);
    paths.expected = path.dirname(paths.expected);
  }

  var options = {
    compareSize: true,
    compareContent: true
  };

  var result = dircompare.compareSync(paths.destination, paths.expected);
  return result.same;
}


describe('#convertFile', function () {
  it('can convert test file', function () {
    var paths = {
      source: 'test/test1/xunit/test.cs',
      destination: 'test/test1/nunit-actual/test.cs',
      expected: 'test/test1/nunit-expected/test.cs',
      filepath: true
    };

    resetDir(path.dirname(paths.destination));

    convertFile(paths.source, paths.destination, verbose = false).should.equal(true);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive('test/test1/nunit-actual');
  });
});


describe('#convertFiles', function () {
  it('can convert test files (rel paths)', function () {
    var opt = {
      recursive: true,
      verbose: false
    };
    var paths = {
      source: 'test/test2/xunit',
      destination: 'test/test2/nunit-actual',
      expected: 'test/test2/nunit-expected',
      filepath: false
    };

    resetDir(paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });


  it('can convert test files (abs paths)', function () {
    var opt = {
      recursive: true,
      verbose: false
    };
    var paths = {
      source: __dirname + '/test3/xunit',
      destination: __dirname + '/test3/nunit-actual',
      expected: __dirname + '/test3/nunit-expected',
      filepath: false
    };

    resetDir(paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });

  it('can convert test files (rel paths) without recursion', function () {
    var opt = {
      recursive: false,
      verbose: false
    };
    var paths = {
      source: 'test/test4/xunit',
      destination: 'test/test4/nunit-actual',
      expected: 'test/test4/nunit-expected',
      filepath: false
    };

    resetDir(paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });


  it('can convert tests files where source=destination (defaults)', function () {
    var opt = {
      recursive: true,
      verbose: false
    };
    var paths = {
      source: 'test/test5/tests-actual',
      destination: 'test/test5/tests-actual',
      expected: 'test/test5/tests-expected',
      filepath: false,
      xunit: 'test/test5/xunit'
    };

    resetDir(paths.destination);

    fs.copySync(paths.xunit, paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });


  it('can convert tests files where source=destination (overwrite)', function () {
    var opt = {
      recursive: true,
      verbose: false,
      overwrite: true,
    };
    var paths = {
      source: 'test/test6/tests-actual',
      destination: 'test/test6/tests-actual',
      expected: 'test/test6/tests-expected',
      filepath: false,
      xunit: 'test/test6/xunit'
    };

    resetDir(paths.destination);

    fs.copySync(paths.xunit, paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });


  it('can convert tests files where source=destination (different append text)', function () {
    var opt = {
      recursive: true,
      verbose: false,
      append: '_Test'
    };
    var paths = {
      source: 'test/test7/tests-actual',
      destination: 'test/test7/tests-actual',
      expected: 'test/test7/tests-expected',
      filepath: false,
      xunit: 'test/test7/xunit'
    };

    resetDir(paths.destination);

    fs.copySync(paths.xunit, paths.destination);

    convertFiles(paths.source, paths.destination, opt);

    dirsAreEqual(paths).should.equal(true);

    deleteFolderRecursive(paths.destination);
  });
});
