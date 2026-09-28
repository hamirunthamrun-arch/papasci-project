const express = require('express');
const router = express.Router();
const { 
  getAllProfiles, 
  getProfileById, 
  updateProfile, 
  deleteProfile 
} = require('../controllers/userController');

router.get('/', getAllProfiles);          // GET semua user (Admin Panel)
router.get('/:id', getProfileById);      // GET detail user
router.put('/:id', updateProfile);       // PUT/Edit user (nama atau role)
router.delete('/:id', deleteProfile);    // DELETE user

module.exports = router;