'use strict';

const csvFilePath = __dirname + '/resources/battles.csv';
const Battle = require('./battles/model/battle');
const csv = require('csvtojson');

const StartUp = {
  loadDataIfNotExist: loadDataIfNotExist
};
module.exports = StartUp;

async function loadDataIfNotExist () {
  return new Promise((resolve, reject) => {
    loadCsvAndInsert().then((data) => {
      console.log(`Inserted ${data} into Battle collection`);
      resolve(data);
    });
  });
};

// Async / await usage
const loadCsvAndInsert = async () => {
  let count = await Battle.find({}).countDocuments();
  if (count < 1) {
    const jsonArray = await csv().fromFile(csvFilePath);
    const dbResp = await Battle.insertMany(jsonArray);
    count = dbResp.length;
  }
  return count;
};
