const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const { TEST_DATABASE_URL } = require('../config/config');
const faker = require('faker');

const { Entry } = require('../entries');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');

chai.use(chaiHttp);

function generateBookReview() {
  return {};
}
