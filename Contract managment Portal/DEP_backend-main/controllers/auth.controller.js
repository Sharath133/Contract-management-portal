const config = require("../config/auth.config");
const refreshConfig = require("../config/refresh.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    // username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if(req.body.roles === 'user'){
      res.send({ message: "User was registered successfully!" });
    }
    else if(req.body.roles === 'moderator'){
      res.send({ message: "Moderator was registered successfully!" });
    }
    else if(req.body.roles==='admin'){
      res.send({ message: "Admin was registered successfully!" });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        console.log(err);
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        console.log("Invalid Password");
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var refreshToken = jwt.sign({ id: user.id }, refreshConfig.secret,{
        expiresIn: '7d'
      });
      res.status(200).send({
        id: user._id,
        fname: user.firstName,
        lname: user.lastName,
        email: user.email,
        roles: user.roles,
        accessToken: token,
        refreshToken: refreshToken
      });
    });
};

