'use strict';

const express = require('express');
const router = express.Router();
const battle = require('./../controller/battle');

router.get('/list/:id', battle.get);
router.get('/list', battle.getAll);
router.get('/count', battle.count);
router.get('/stats', battle.stats);
router.get('/search', battle.search);
router.delete('/:id', battle.remove);
router.put('/', battle.update);
router.post('/', battle.post);

module.exports = router;