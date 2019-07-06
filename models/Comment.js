const mongoose = require("mongoose");

// Save reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new commentschema object
// This is similar to a Sequelize model
const CommentSchema = new Schema({

//article_id ties the comments to the article.
  article_id: {
    type: String,
    required: true
},

  title: String,

  body: String,
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;
