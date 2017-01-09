// import { MochaWrapper } from './mocha-wrapper';
import glob from 'glob';
import path from 'path';

const testDir = './tests/';
const testDirFiles = ['fileA.js', 'fileB.js'];
const filesGlobValue = './lib/**/*.spec.js';
const filesGlobFiles = ['./lib/fileA.spec.js', './lib/someDir/fileB.spec.js'];
const emptyTestsDirPath = '';

describe.only('mocha-wrapper', function () {
  beforeEach(function () {
    td.replace('./mocha-fiberized-ui', {});
    td.replace('exit', td.function('exit'));
    td.replace('../babel-register', td.object({}));
    this.mocha = td.replace('mocha');
    this.path = td.replace('path', td.object(path));
    this.glob = td.replace('glob', td.object(glob));
    process.env.mochaConfig = JSON.stringify({ tags: ''});
    process.argv = [];
  });
  afterEach(function() {
    td.reset();
  });
  describe('add files', function () {
    it('adds files inside testDir', function () {
      process.env['chimp.path'] = testDir;
      // mock --path tests dir files
      td.when(this.path.join('mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.resolve(__dirname, 'mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.join(testDir, '**')).thenReturn(testDir);
      td.when(this.glob.sync(testDir)).thenReturn(testDirFiles);
      td.when(this.mocha.run(td.matchers.anything())).thenReturn(null);

      const MochaWrapper = require('./mocha-wrapper.js').MochaWrapper;
      const mochaWrapper = new MochaWrapper();

      td.verify(this.mocha.addFile('fileA.js'));
      td.verify(this.mocha.addFile('fileB.js'));
      td.verify(this.mocha.addFile('mocha-helper.js'));
      td.verify(this.mocha.addFile(), {times: 3, ignoreExtraArgs: true}); // verify only called three times
    });
    it('adds files specified by --files options when --path is empty dir', function() {
      process.env['chimp.path'] = emptyTestsDirPath;
      process.env['chimp.files'] = filesGlobValue;
      // mock empty --path tests dir files
      td.when(this.path.join('mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.resolve(__dirname, 'mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.join(emptyTestsDirPath, '**')).thenReturn(emptyTestsDirPath);
      td.when(this.glob.sync(emptyTestsDirPath)).thenReturn([]);
      // mock --files flag files
      td.when(this.glob.sync(filesGlobValue)).thenReturn(filesGlobFiles);

      const MochaWrapper = require('./mocha-wrapper.js').MochaWrapper;
      const mochaWrapper = new MochaWrapper();

      td.verify(this.mocha.addFile('./lib/fileA.spec.js'));
      td.verify(this.mocha.addFile('./lib/someDir/fileB.spec.js'));
      td.verify(this.mocha.addFile('mocha-helper.js'));
      td.verify(this.mocha.addFile(), {times: 3, ignoreExtraArgs: true});
    });
    it('adds files specified by --files option and files in --path when both contain files', function() {
      process.env['chimp.path'] = testDir;
      process.env['chimp.files'] = filesGlobValue;
      // mock mocha-helper
      td.when(this.path.join('mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.resolve(__dirname, 'mocha-helper.js')).thenReturn('mocha-helper.js');
      // mock --files flag files
      td.when(this.glob.sync(filesGlobValue)).thenReturn(filesGlobFiles);
      // mock --path test dir files
      td.when(this.path.join(testDir, '**')).thenReturn(testDir);
      td.when(this.glob.sync(testDir)).thenReturn(testDirFiles);
      td.when(this.mocha.run(td.matchers.anything())).thenReturn(null);

      const MochaWrapper = require('./mocha-wrapper.js').MochaWrapper;
      const mochaWrapper = new MochaWrapper();

      td.verify(this.mocha.addFile('fileA.js'));
      td.verify(this.mocha.addFile('fileB.js'));
      td.verify(this.mocha.addFile('./lib/fileA.spec.js'));
      td.verify(this.mocha.addFile('./lib/someDir/fileB.spec.js'));
      td.verify(this.mocha.addFile('mocha-helper.js'));
      td.verify(this.mocha.addFile(), {times: 5, ignoreExtraArgs: true});
    });
  });
});
