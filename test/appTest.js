const _ = require('lodash');
const assert = require('chai').assert;
const should = require('chai').should();
const expect = require('chai').expect;
const app = require('./../app');

describe('App', function () {
  describe('MongoDB', function () {
    it('app should return obj', function () {
      app.connectMongo().then((obj)=> {
        assert.equal(obj.code, 200);
      });
    });
  });
});
