"use strict";

const express = require("express"),
 app = express(), 
 errorController = require("./controllers/errorController"),
 homeController = require("./controllers/homeController"),
 mongoose = require("mongoose");
 users = require("./models/users");
 
var router = express.Router();

var expressErrorHandler = requier('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = requres('express-session');


var database;

databaseUrl = 'mongodb://localhost:27017'
