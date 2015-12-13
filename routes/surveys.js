var express = require('express'),
    User = require('../models/User'),
    Survey = require('../models/Survey'),
    Question = require('../models/Question'),
    Answer = require('../models/Answer');
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

/* NEW survey*/
router.get('/new', function(req, res, next) {
  res.render('surveys/new', {survey: {}});
});

router.post('/', function(req, res, next) {
  var survey = new Survey({
    user_id: req.user.id,
    title: req.body.title,
    content: req.body.content
  });
  survey.save(function(err, doc) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/' + doc.id);
  });
});

/* SHOW survey*/
router.get('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Question.find({survey_id: survey.id}, function(err, questions) {
      if (err) {
        return next(err);
      }
      res.render('surveys/show', {survey: survey, questions: questions});
    });
  });
});

/* EDIT survey*/
router.get('/:id/edit', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/new', {survey: survey});
  });
});

router.put('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    survey.title = req.body.title;
    survey.content = req.body.content;

    survey.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '설문이 수정되었습니다.');
      res.redirect('/surveys');
    });
  });
});

/* EDIT question*/
router.get('/question/:id/edit', function(req, res, next) {
  Question.findById(req.params.id, function(err, question) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {question: question});
  });
});

router.put('/question/:id', function(req, res, next) {
  Question.findById(req.params.id, function(err, question) {
    if (err) {
      return next(err);
    }
    question.content = req.body.content;
    question.selection[0].selection1 = req.body.selection1;
    question.selection[0].selection2 = req.body.selection2;
    question.selection[0].selection3 = req.body.selection3;
    question.selection[0].selection4 = req.body.selection4;

    question.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '질문이 수정되었습니다.');
      res.redirect('/surveys/' + question.survey_id);
    });
  });
});

/* DELETE survey*/
router.delete('/:id', function(req, res, next) {
  Survey.findOneAndRemove(req.params.id, function(err) {
    if (err) {
      return next(err);
    }
    Question.find({survey_id: req.params.id}).remove(function(err, questions) {
      if (err) {
        return next(err);
      }
    });
    req.flash('success', '설문이 삭제되었습니다.');
    res.redirect('/surveys');
  });
});

/* DELETE question*/
router.delete('/question/:id', function(req, res, next) {
  Question.findOneAndRemove({_id: req.params.id}, function(err, question) {
    if (err) {
      return next(err);
    }
    Question.find({seq: {$gt: question.seq}}, function(err, questions) {
      if (err) {
        return next(err);
      }
      for(var i=0; i<questions.length; i++) {
        questions[i].seq = questions[i].seq-1;
        questions[i].save();
      }
    });
    Survey.findByIdAndUpdate(question.survey_id, {$inc: {numQuestion: -1}}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '질문이 삭제되었습니다.');
      res.redirect('/surveys/' + question.survey_id);
    });
  });
});

/* NEW question*/
router.post('/:id/questions', function(req, res, next) {
  var question = new Question({
    survey_id: req.params.id,
    content: req.body.content,
    type: req.body.type
  });
  question.selection.push({
    selection1: req.body.selection1,
    selection2: req.body.selection2,
    selection3: req.body.selection3,
    selection4: req.body.selection4
  });

  question.save(function(err){
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numQuestion: 1}}, function(err, survey) {
      if (err) {
        return next(err);
      }
      question.seq = survey.numQuestion+1;
      question.save(function(err) {
        if (err) {
          return next(err);
        }
      });
      req.flash('success', '질문이 생성되었습니다.');
      res.redirect('/surveys/' + req.params.id);
    });
  });
});

/* SHOW survey sheet*/
router.get('/:id/sheet', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Question.find({survey_id: survey.id}, function(err, questions) {
      if (err) {
        return next(err);
      }
      res.render('surveys/sheet', {survey: survey, questions: questions});
    });
  });
});

/* NEW answer*/
router.post('/:id/sheet/thanks', function(req, res, next) {
  Answer.findOne({email: req.body.email}, function(err, temp) {
    if(temp!=null) {
      req.flash('danger', '이미 응답한 이메일 입니다.');
      res.redirect('/surveys/' + req.params.id + '/sheet');
    } else {
      Question.find({survey_id: req.params.id}, function(err, questions) {
        if (err) {
          return next(err);
        }
        var value = [];
        var key = [];
        var cnt = 0;
        for (var i in req.body)
        {
          key[cnt] = i;
          value[cnt] = req.body[i];
          cnt++;
        }
        var ans = '';
        var q_id = '';

        function myloop(k, callback) {
          if(k<questions.length) {
            for(var j in key) {
              if(key[j]===questions[k].id) {
                ans = value[j];
                q_id = questions[k].id;
                console.log(q_id);
              }
            }
            if(questions[k].type==='객관식') {
              console.log('1: ' + q_id);
              Answer.findOne({question_id: q_id}, function(err, temp) {
                console.log('2: ' + q_id);
                if (temp===null) {
                  temp = new Answer({
                    survey_id: req.params.id,
                    question_id: q_id,
                    email: req.body.email
                  });
                  temp.selection.push({
                    selection1: 0,
                    selection2: 0,
                    selection3: 0,
                    selection4: 0
                  });
                  temp.save();
                }
                if(ans==1) {
                  temp.selection[0].selection1 = temp.selection[0].selection1+1;
                } else if(ans==2) {
                  temp.selection[0].selection2 = temp.selection[0].selection2+1;
                } else if(ans==3) {
                  temp.selection[0].selection3 = temp.selection[0].selection3+1;
                } else if(ans==4) {
                  temp.selection[0].selection4 = temp.selection[0].selection4+1;
                }
                temp.save();
                myloop(k+1, callback);
              });
            } else {
              var answer = new Answer({
                survey_id: req.params.id,
                question_id: q_id,
                answer: ans,
                email: req.body.email
              });
              answer.save();
              myloop(k+1, callback);
            }
          } else {
            callback();
          }
        }
        myloop(0, function() {
          Survey.findByIdAndUpdate(req.params.id, {$inc: {numAnswer: 1}}, function(err, survey) {
            if (err) {
              return next(err);
            }
            res.render('surveys/thanks');
          });
        });
      });
    }
  });
});

/* SHOW answer*/
router.get('/:id/answer', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Question.find({survey_id: survey.id}, function(err, questions) {
      if (err) {
        return next(err);
      }
      Answer.find({survey_id: survey.id}, function(err, answers) {
        if (err) {
          return next(err);
        }
        res.render('surveys/answer', {survey: survey, questions: questions, answers: answers});
      });
    });
  });
});

module.exports = router;
