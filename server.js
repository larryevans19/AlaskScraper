var express = require("express");
var expressHandlebars = require("express-handlebars")
var logger = require("morgan");
var mongoose = require("mongoose");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Express middleware configuration

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://192.168.99.100/alaskcraping", { useNewUrlParser: true });

// Routes

// GET route for scraping the Alaska News page of the Fairbanks Daily News Miner website
app.get('/scrape', function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.newsminer.com/news/alaska_news/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);
    // Now, we grab every h3 within an article tag, and do the following:
    $("article").each(function (i, element) {
      // Store the news item result as a blank object
      console.log(i)
      const newsItem = {};
      
      // Add the text and href of every link, and save them as properties of the result object
      newsItem.title = $(this)
        .find("h3 a")
        .text();

      newsItem.byline = $(this)
        .find(".tnt-byline")
        .text();

      newsItem.summary = $(this)
        .find(".tnt-summary")
        .text();
      newsItem.link = $(this)
        .find("h3 a")
        .attr("href")
        
      // Create a new Article using the `newsItem` object built from scraping
      db.Article.create(newsItem)
        .then(function (dbArticle) {
          // View the added newsItem in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("The News has been AlaskScraped!");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with its comments
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for retrieving all Comments from the db
app.get("/comments", function(req, res) {
  // Find all Comments
  db.Note.find({})
    .then(function(dbComment) {
      // If all Comments are successfully found, send them back to the client
      res.json(dbComment);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comments
app.post("/articles/:id", function (req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function (dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new comment
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({}, { $push: { comment: dbComment._id } }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route to get all Articles and populate them with their Comments
app.get("/populatedArticle", function(req, res) {
  // Find all users
  db.Article.find({})
    // Specify that we want to populate the retrieved Articles with any associated Comments
    .populate("comments")
    .then(function(dbArticle) {
      // If able to successfully find and associate all Articles and Comments, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});
// Start the server
app.listen(PORT, function () {
  console.log("AlaskScraper is running on port " + PORT + "!");
});
