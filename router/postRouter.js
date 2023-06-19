// routes/index.js
const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');

// Rute untuk membuat konten baru
router.post('/post', postController.createpost);

// Rute untuk mengedit caption konten
router.put('/post/:postId', postController.editpost);

// Rute untuk menghapus konten
router.delete('/post/:postId', postController.deletepost);

module.exports = router;
