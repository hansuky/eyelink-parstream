// routes/users.js

var express = require("express");
var router = express.Router();
var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;

var queryProvider = new QueryProvider();

// Index // 1
router.route("/").get(function(req, res){
 User.find({})
 .sort({username:1})
 .exec(function(err, users){
  if(err) return res.json(err);
  res.render("users/index", {users:users});
 });
});

// New
router.get("/new", function(req, res){
 res.render("users/new", {user:{}});
});

// create
router.post("/", function(req, res){
    var in_data = {};
    queryProvider.selectSingleQueryByID("user", "selecUSERtUserNumMax", in_data, function(err, out_data, params) {
      console.log(out_data[0]);
      var rtnCode = CONSTS.getErrData('0000');
      if (out_data[0] === null) {
        rtnCode = CONSTS.getErrData('0001');
      }
     });
   var in_data = {
        USERNUM:out_data[0],
        USERNAME: req.query.username,
        USERID: req.query.userid,
        PASSWORD: req.query.password,
        USERROLE: req.query.userrole
      };
      console.log(in_data);
  queryProvider.selectSingleQueryByID("user", "insertUser", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
 User.create(req.body, function(err, user){
  if(err) return res.json(err);
  res.redirect("/users");

});

// show
router.get("/:username", function(req, res){
 User.findOne({username:req.params.username}, function(err, user){
  if(err) return res.json(err);
  res.render("users/show", {user:user});
 });
});

// edit
router.get("/:username/edit", function(req, res){
 User.findOne({username:req.params.username}, function(err, user){
  if(err) return res.json(err);
  res.render("users/edit", {user:user});
 });
});

// update // 2
router.put("/:username",function(req, res, next){
 User.findOne({username:req.params.username}) // 2-1
 .select("password") // 2-2
 .exec(function(err, user){
  if(err) return res.json(err);

  // update user object
  user.originalPassword = user.password;
  user.password = req.body.newPassword? req.body.newPassword : user.password; // 2-3
  for(var p in req.body){ // 2-4
   user[p] = req.body[p];
  }

  // save updated user
  user.save(function(err, user){
   if(err) return res.json(err);
   res.redirect("/users/"+req.params.username);
  });
 });
});

module.exports = router;