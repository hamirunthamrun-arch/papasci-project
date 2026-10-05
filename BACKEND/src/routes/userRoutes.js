const express = require('express');
const router = express.Router();
const { getAllProfiles, createUser, updateProfile, deleteProfile } = require('../controllers/userController');

router.get('/', getAllProfiles);
router.post('/', createUser);       // <-- Endpoint untuk Tambah User
router.put('/:id', updateProfile);   // <-- Endpoint untuk Edit User
router.delete('/:id', deleteProfile); // <-- Endpoint untuk Hapus User

module.exports = router;