'use strict';

const mongoose = require('mongoose');

const connectMongo = () => {
  return new Promise((resolve, reject) => {
    let local = 'mongodb://localhost:27017/ZEB';
    let prd = 'mongodb://sitanshu:siten707@ds215633.mlab.com:15633/zeb';
    mongoose.connect(prd, {useNewUrlParser: true})
      .then(() => {
        require('./startup').loadDataIfNotExist();
        resolve({
          code: 200,
          message: 'MongoDB Connected...'
        });
      });
  });
};
connectMongo().then((data) => {
  console.log(data);
});
const app = require('./express');

module.exports = {
  connectMongo: connectMongo,
  app: app
};

