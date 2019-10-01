'use strict';

var _             = require('lodash');
var helper        = require('../test-helper');
var chai          = require('chai');
var should        = chai.should();
var IndexService  = require('../../app/lib/services/index');
var fs            = require('fs-extra');
var path          = require('path');

describe('mavensmate org-index', function(){

  var project;

  before(function(done) {
    this.timeout(120000);
    helper.putTestProjectInTestWorkspace('org-index');
    helper.addProject('org-index')
      .then(function(proj) {
        project = proj;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  after(function(done) {
    helper.cleanUpProject('org-index')
    done();
  });

  it('should select metadata based on package.xml', function(done) {
    this.timeout(120000);

    fs.copySync(
      path.join(helper.baseTestDirectory(), 'fixtures', 'org-index.json'),
      path.join(helper.baseTestDirectory(), 'workspace', 'org-index', 'config', '.org_metadata')
    );

    project.packageXml.subscription = {
      ApexClass : '*',
      ApexPage : '*'
    };

    project.getOrgMetadataIndexWithSelections()
      .then(function(m) {
        var apexClass = _.find(m, {id:'ApexClass'});
        apexClass.select.should.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });

  });

  it('should index different types of metadata', function(done) {

    this.timeout(120000);

    var indexService = new IndexService({project:project});
    indexService.indexServerProperties(['ApexClass', 'CustomObject', 'Report'])
      .then(function(res) {
        var apexClassResult = res[0];
        var customObjectResult = res[1];
        var reportResult = res[2];

        apexClassResult.title.should.equal('ApexClass');
        apexClassResult.isFolder.should.equal(true);
        apexClassResult.cls.should.equal('folder');
        apexClassResult.children.length.should.be.at.least(1);

        customObjectResult.title.should.equal('CustomObject');
        customObjectResult.isFolder.should.equal(true);
        customObjectResult.inFolder.should.equal(false);
        customObjectResult.hasChildTypes.should.equal(true);
        customObjectResult.cls.should.equal('folder');
        customObjectResult.children.length.should.be.at.least(1);

        reportResult.title.should.equal('Report');
        reportResult.isFolder.should.equal(true);
        reportResult.inFolder.should.equal(true);
        reportResult.hasChildTypes.should.equal(false);
        reportResult.cls.should.equal('folder');
        reportResult.children.length.should.be.at.least(1);

        done();
      })
      .catch(function(err) {
        done(err);
      });

  });

});

