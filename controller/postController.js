const db = require('../models');
const Posts = db.posts;

const createpost = async (req, res) => {
  try {
    const { media, caption } = req.body;

    // Buat konten baru
    const newPosts = await Posts.create({ media, caption });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPosts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating post'
    });
  }
};

const editpost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;

    // Cari konten berdasarkan ID
    const selectedPost = await Posts.findByPk(postId);

    if (!selectedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Perbarui caption konten
    selectedPost.caption = caption;
    await selectedPost.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: selectedPost
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating post'
    });
  }
};

const deletepost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Cari konten berdasarkan ID
    const selectedPost = await Posts.findByPk(postId);

    if (!selectedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Hapus konten
    await selectedPost.destroy();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting post'
    });
  }
};

module.exports = {
  createpost,
  editpost,
  deletepost
};
