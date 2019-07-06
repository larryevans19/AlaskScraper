const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
const ArticleSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true,
    unique: true,
  },

  byline: {
    type: String,
  },

  // `summary` is required and of type String
  summary: {
    type: String,
  },

  // `link` is required and of type String
  link: {
    type: String,
    required: true,
  },

  // // `comment` is an object that stores a comment id
  // // The ref property links the ObjectId to the comment model
  // // This allows us to populate the Article with an associated comment
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});
// Added the uniqueValidator plugin to ensure only articles with unique titles get added to the database to prevent duplicate posts.
ArticleSchema.plugin(uniqueValidator)

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
