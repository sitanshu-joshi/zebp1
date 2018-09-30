'use strict';

const Battle = require('./../model/battle');

const BattleController = {
  get: get,
  count: count,
  stats: stats,
  search: search,
  getAll: getAll,
  post: post,
  update: update,
  remove: remove
};
module.exports = BattleController;

function get (req, res) {
  const id = req.params.id;
  getData(id).then((data) => {
    res.status(200).send(data);
  });
}

function getAll (req, res) {
  getData().then((data) => {
    // res.status(200).send(data);
    res.render('list', {title: 'BattleList', data: data});
  });
}

function count (req, res) {
  getCount().then((count) => {
    res.render('count', {title: 'count', count: count});
  });
}

function stats (req, res) {
  getStats().then((data) => {
    res.status(200).json(data);
  });
}

function search (req, res) {
  getSearchResult(req.query).then((data) => {
    res.render('list', {title: 'Search Result', data: data});
  });
}

function post (req, res) {}

function update (req, res) {}

function remove (req, res) {}

//=========================================
//============ GENERAL METHODS ===========
//=========================================

const getCount = async () => {
  let count = await Battle.find({}).countDocuments();
  return count;
};

const getStats = async () => {
  let dict = {};
  const active = await getMostActive();
  const winLoss = await aggregateWinLoss();
  const battleType = await getDistinctBattleType();
  const defenderSize = await getMMA();
  dict.most_active = active;
  dict.attacker_outcome = winLoss;
  dict.battle_type = battleType;
  dict.defender_size = defenderSize;
  return dict;
};

const getSearchResult = async (option) => {
  let q = queryBuilderForSearch(option);
  const result = await Battle.find(q);
  return result;
};

//=========================================
//=========== DB RELATED METHODS ==========
//=========================================

const getMostActive = async () => {
  const attacker_king = await aggregate('attacker_king');
  const defender_king = await aggregate('defender_king');
  const region = await aggregate('region');
  const name = await aggregate('name');
  return {
    attacker_king: attacker_king.name,
    defender_king: defender_king.name,
    region: region.name,
    name: name.name
  };
};

const getMMA = async () => {
  let q = [{
    "$group": {
      "_id": null,
      "max": { "$max": "$defender_size" },
      "min": { "$min": "$defender_size" },
      "avg": { "$avg": "$defender_size"}
    }
  }];
  const result = await Battle.aggregate(q);
  return {
    max: result[0].max,
    min: result[0].min,
    avg: result[0].avg
  }
};

const getData = async (id) => {
  let q = {};
  if (id) {
    q = {
      _id: id
    };
  }
  try {
    let data = await Battle.find(q);
    if (!Array.isArray(data)) {
      data = [data];
    }
    return data;
  } catch (ex) {
    return ex;
  }
};

const queryBuilderForSearch = (option) => {
  let q = {};
  if ('attacker_king' in option) {
    q['attacker_king'] = {'$regex': option.attacker_king, '$options': 'i'};
  }
  if ('defender_king' in option) {
    q['defender_king'] = {'$regex': option.defender_king, '$options': 'i'};
  }
  if ('battle_type' in option) {
    q['battle_type'] = {'$regex': option.battle_type, '$options': 'i'};
  }
  if ('attacker_size' in option) {
    q['attacker_size'] = {$gte: option.attacker_size};
  }
  if ('defender_size' in option) {
    q['defender_size'] = {$gte: option.defender_size};
  }
  if ('major_death' in option) {
    q['major_death'] = {$gte: option.major_death};
  }
  if ('location' in option) {
    q['location'] = {'$regex': option.location, '$options': 'i'};
  }
  if ('year' in option) {
    q['year'] = option.year;
  }
  return q;
};

const aggregate = async (type) => {
  let q1 = {};
  q1[type] = '$' + type;
  let q = [{$group: {_id: q1, count: {$sum: 1}}}, {$sort: {count: -1}}, {$limit: 1}];
  try {
    const result = await Battle.aggregate(q);
    return {
      name: result[0]._id[type],
      count: result[0].count
    };
  } catch (ex) {
    return ex;
  }
};

const getDistinctBattleType = async ()=> {
  return await Battle.distinct("battle_type", { "battle_type" : { $nin : ["", null] } });
};

const aggregateWinLoss = async () => {
  let q = [{$group: {_id: {'attacker_outcome': '$attacker_outcome'}, count: {$sum: 1}}}, {$sort: {count: -1}}];
  try {
    const result = await Battle.aggregate(q);
    let dict = {
      win: 0,
      loss: 0
    };
    result.forEach(function (element) {
      const wl = element._id.attacker_outcome;
      switch (wl) {
        case 'win':
          dict.win = element.count;
          break;
        case 'loss':
          dict.loss = element.count;
          break;
      }
    });
    return dict;
  } catch (ex) {
    return ex;
  }
};