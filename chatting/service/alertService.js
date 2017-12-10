"use strict"

module.exports = {
  setAlertDao(dao) {
    this.alertDao = dao
  },

  get(no, success, error) {
    var obj = this
      this.alertDao.get(no, function(results) {
       success(results)
     }, error)
  }, // get
  add(type, othername, mymno, kinds, othermno, success, error) {
    var obj = this
      this.alertDao.add(type, othername, mymno, kinds, othermno, function(results) {
        success(results)
      })
  }, //add
  delete(no, success, error){
    var obj = this
    this.alertDao.delete(no, function(results) {
      success(results)
    })
  } //delete
} // module
