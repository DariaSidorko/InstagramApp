const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');
const isEmpty = require('../../validation/is-empty');

// @route   GET api/posts
// @desc    Get ALL posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: "No posts found"}));
})


// @route   GET api/posts
// @desc    Get ALL posts
// @access  Public
router.get("/handle/:handle", (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: "No posts found"}));
})




// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post)
    })
    .catch(err =>
      res.status(404).json({ nopostfound: 'No post found with that ID' })
    );
});


// @route   GET api/posts/bookmark
// @desc    Get bookmarks
// @access  Private
 router.get(
  '/bookmark',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.find()
    .then(post => {
      let result = [];
      if (post){
        for (let i=0; i< post.length; i++){
        post[i].bookmarks.filter(bookmark =>
          { 
            if(bookmark.user.toString() === req.user.id){
              result.push(post[i]);
            }
          })
      }
      return res.json(result);
      }
    
  })
    .catch(err => res.status(404).json({ postnotfound: 'No bookmarked posts found' }));
  }
); 


// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      image: req.body.image,
      handle: req.body.handle,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);


// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {

          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);


/* ///////////////////////////////////////// TAGS in POSTS -- STILL IN PROGRESS ////////////////////////////////////// */
    //@route Post api/posts/tag/:handle
    // Tag user in Post
    // @access  Public

    router.post(
      '/tag/:handle',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);
    
        // Check Validation
        if (!isValid) {
          // If any errors, send 400 with errors object
          return res.status(400).json(errors);
        }
    
        Post.findOne(req.body.handle)
          .then(post => {
            const newTag = {
              text: req.body.text,
              handle:req.body.handle
            };
    
            // Add to comments array
            post.tags.unshift(newTag);
    
            // Save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      }
    );
    
    // @route   DELETE api/posts/untag/:post_id
    // @desc    Remove Tag from post
    // @access  Private
    router. delete(
      '/tag/:id/:tag_handle',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        Post.findOne({ user: req.user.id })
          .then(post => {
            // Check to see if Tags exists
            if (
              post.tag.filter(
                tag => tag.user.toString() === req.params.user_id
              ).length === 0
            ) {
              return res
                .status(404)
                .json({ tagnotexists: 'Tag does not exist' });
            }
    
            // Get remove index
            const removeIndex = post.tags
              .map(item => item._id.toString())
              .indexOf(req.params.tag_id);
    
            // Splice comment out of array
            posts.tags.splice(removeIndex, 1);
    
            posts.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ tagsnotfound: 'No tags found' }));
    
    }
    )
/* ////////////////////////////////////////// END ////////////////////////////////////////////////////// */


// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post' });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);


// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }
          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);
          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);


// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //const { errors, isValid } = validatePostInput(req.body);
    console.log("Got here!", req.body.text)
    // Check Validation
    if (isEmpty(req.body.text)) {
      let errors = {
        text: "This field is required"
      }
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    } 

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          handle: req.body.handle,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);
        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);


// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);





/*  ******* NEW BOOKMARKS PART *******  */

// @route   POST api/posts/bookmark/:id
// @desc    Add post to bookmarks
// @access  Private
 router.post(
  '/bookmark/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
      if (
        post.bookmarks.filter(bookmark => bookmark.user.toString() === req.user.id)
          .length > 0
      ) {
        return res
          .status(400)
          .json({ alreadybookmarked: 'User already bookmarked this post' });
      }

      // Add user id to likes array
      post.bookmarks.unshift({ user: req.user.id });
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
); 


// @route   POST api/posts/unbookmark/:id
// @desc    Remove post from bookmarks
// @access  Private
 router.post(
  '/unbookmark/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.bookmarks.filter(bookmark => bookmark.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notbookmarked: 'You have not yet bookmarked this post' });
          }

          // Get remove index
          const removeIndex = post.bookmarks
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.bookmarks.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
); 

/*  ******* NEW BOOKMARKS PART  - END *******  */


/*  ******* NEW FOLLOWING PART *******  */

// @route   GET api/post/all
// @desc    Get all posts (users + all the profiles user is following)
// @access  Private
router.get (
  '/all',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        let users = [];
        for (let i=0; i < profile.following.length; i++){
          users[i] = profile.following[i].user;
        }
        users.push(req.user.id);
        Post.find({ user: { $in: users } })
        .then(post => res.json(post))
        .catch(err =>
          res.status(404).json({ nopostfound: 'No post found with that ID' })
        );
      })
      .catch()
  });
  

/*  ******* NEW FOLLOWING PART  - END *******  */



module.exports = router;