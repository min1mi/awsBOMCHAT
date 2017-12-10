"use strict"


module.exports = {
  setChatDao(dao) {
    this.chatDao = dao
  },

  listUser(memberNo, trainerNo, success, error) {
    var obj = this
    this.chatDao.selectUser(memberNo, trainerNo, function(results) {
      success(results)
    }, error)
  }, // list

  listTrainer(memberNo, trainerNo, success, error) {
    var obj = this
    this.chatDao.selectTrainer(memberNo, trainerNo, function(results) {
      success(results)
    }, error)
  }, //listMusi()

  insert(chat, success, error) {
    this.chatDao.insert(chat, success, error)
  }, // insert

  update(memberNo, trainerNo, success, error) {
    this.chatDao.update(memberNo, trainerNo, success, error)
  } // update
} // module
