var fs = require('fs');
var dirsum = require('dirsum');
var path = require('path');
var should = require('chai').should(),
  x2n = require('../index'),
  convertCode = x2n.convertCode,
  convertLine = x2n.convertLine,
  convertFile = x2n.convertFile,
  convertFiles = x2n.convertFiles;


var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


var resetDir = function(path) {
  deleteFolderRecursive(path);

  if (!fs.existsSync(path)){
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

    resetDir(path.dirname(paths.destination));

    convertFile(paths.source, paths.destination, verbose=false).should.equal(true);

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

    dirsAreEqual(paths, function(result) {
      should.equal(result.actual.err, undefined);
      should.equal(result.expected.err, undefined);
      result.actual.res.should.not.equal(undefined);
      result.actual.res.hash.should.equal(result.expected.res.hash);
      done();
    });

  });

});
