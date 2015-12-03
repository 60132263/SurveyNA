var express = require('express'),
    User = require('../models/User'),
    Survey = require('../models/Survey');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/signin');
  }
}

/* GET surveys listing. */
router.get('/', needAuth, function(req, res, next) {
  Survey.find({user_id: req.user.id}, function(err, docs) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {surveys: docs});
  });
});

router.get('/new', function(req, res, next) {
  res.render('surveys/new');
});

router.post('/', function(req, res, next) {
  var survey = new Survey({
    user_id: req.user.id,
    title: req.body.title,
    content: req.body.content
  });

  survey.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys');
  });
});

router.get('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/show', {survey: survey});
  });
});

module.exports = router;
