$(document).ready(function () {

  //Once the page loads, we want to render the existing articles in the database that have previously been scraped. 
  //We have a function called renderArticles() to do this
  renderArticles()

  function renderArticles() {
    // Empty the articles div of any existing scraped articles that were previously rendered to prevent duplicate renderings
    $('#articles').empty();
    // Grab the articles from the database as JSON object
    $.getJSON("/articles", function (data) {
      // Loop through each article
      for (var i = 0; i < data.length; i++) {
        // Construct the card which will display the article using the data object
        $('#articles').append(`
    <div class='card arty' data-id='${data[i]._id}'> 
    <div class='card-body'>
      <h4 class='card-title'>${data[i].title}</h4>
      <p class='card-text' id='byline'>${data[i].byline}</p>
      <p class='card-text' id='summary'>${data[i].summary}</p>
    <p class='card-text' id='link'><a href='https://www.newsminer.com${data[i].link}'>https://www.newsminer.com${data[i].link}</a></p>
    
    <a href='#comments'><button type='button' class='btn btn-warning comment-button' data-id='${data[i]._id}'>Comments</button></a></div></div>`)
      }

    });
  };

  // Click listener for the link id on the flag image, which the user is prompted to click to triggers to scrape for new articles
  $(document).on('click', '#scrape', function () {
    $('#articles').empty();
    //Hit the /scrape route to perform a fresh scrape for new articles
    $.ajax({
      method: 'GET',
      url: '/scrape',
    })
      // Once complete, console log the playload, then call the renderArticles function to reconstruct the cards including any new articles scraped
      .then(function (data) {
        console.log(data);
        renderArticles();
      })
  })

  // Whenever someone clicks the Manage comments button
  $(document).on('click', '.comment-button', function () {
    console.log("Clicked")
    // Empty the comments from the comment section
    $('#comments').empty();
    $('#comments').show();
    // Save the id from the p tag
    const thisId = $(this).attr('data-id');
    console.log("thisId:", thisId);
    // Now make an ajax call for the Article
    $.ajax({
      method: 'GET',
      url: '/comments'
    })
      // With that done, add the comment information to the page
      .then(function (data) {
        console.log(data);
        // The title of the article
        $("#comments").append(`<h4> Comments for: <br> <i>${data.title}</i> </h4>`);
        // List of All Comments for the Article
        $
        // An input to enter a new title
        $("#comments").append("<input id='titleinput' name='title' >");
        // A textarea to add a new comment body
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new comment, with the id of the article saved to it
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save comment</button>");

        // If there's a comment in the article
        if (data.comment) {
          // Place the title of the comment in the title input
          $("#titleinput").val(data.comment.title);
          // Place the body of the comment in the body textarea
          $("#bodyinput").val(data.comment.body);
        }
      });
  });


  // When you click the savecomment button
  $(document).on('click', "#savecomment", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from comment textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the comments section
        $("#comments").empty();
      });

    // Also, remove the values entered in the input and textarea for comment entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

})