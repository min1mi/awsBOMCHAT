// connection 객체 준비
"use strict"

const mysql = require('mysql')
const connection = mysql.createConnection({
  database: 'bombeedb',
  user: 'bombee',
  password: '1111'
})
connection.connect()

/*
module.exports.getConnection = function() {
  return con
}
*/
module.exports = {
  getConnection() {
    return connection
  }
}













//
