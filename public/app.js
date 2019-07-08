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
        console.log('Data Title:', data[i].title);
        // Construct the card which will display the article using the data object
        $('#articles').append(`
    <div class='card arty' data-id='${data[i]._id}' id='${data[i]._id}'> 
    <div class='card-body'>
    <a href='https://www.newsminer.com${data[i].link}'><h4 class='card-title'>${data[i].title}</h4></a>
      <p class='card-text' id='byline'>${data[i].byline}</p>
      <p class='card-text' id='summary'>${data[i].summary}</p>
    <p class='card-text' id='link'><a href='https://www.newsminer.com${data[i].link}'>https://www.newsminer.com${data[i].link}</a></p>
    
    <a href='#comments'><button type='button' class='btn btn-warning comment-button' data-id='${data[i]._id}' data-name='${data[i].title}'>View Comments</button></a>
    <a href='#comments'><button type='button' class='btn btn-warning add-button' data-id='${data[i]._id}' data-name='${data[i].title}'>Add a Comment</button></a>
    </div></div>`)
      }

    });
  };

  function renderComments(articleId,articleTitle) {
    // Empty the comments from the comment section
    $('#comments').empty();
    $('#comments').show();

    // Now make an ajax call for the Article
    $.ajax({
      method: 'GET',
      url: '/comments/' + articleId,
    })
      // With that done, add the comment information to the page
      .then(function (data) {


        console.log(data);
        // Comment list construction
        $('#comments').append(`
        <h4 class='topcom'>Comments for Article:</h4>
        <a href='#${articleId}'><h5 class='card-title'><i>${articleTitle}</i></h5></a><hr>`);

        if(data.length===0) {
          $('#comments').append(`
          <h5 id='no-comment'>There are currently no comments for this article.  Get the conversation started by adding a comment!</h5>
          <a href='#comments'><button type='button' class='btn btn-warning add-button no-comment-add' data-id='${articleId}' data-name='${articleTitle}'>Add a Comment</button></a>`)
        }
        for (var l = 0; l < data.length; l++) {

          $('#comments').append(`
       <h5>${data[l].title}</h5>
       <p>${data[l].body}</p>
       <button class='btn btn-warning' data-id='${data[l]._id}' data-name='${articleTitle}' data-art='${articleId}' id='delete-comment'>Delete Comment</button><hr>`)
        }

        // If there's a note in the article
        // if (data.note) {
        //   // Place the title of the note in the title input
        //   $("#titleinput").val(data.note.title);
        //   // Place the body of the note in the body textarea
        //   $("#bodyinput").val(data.note.body);
        // }
      });

  }

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


  // Whenever someone clicks the the View Comments button
  $(document).on('click', '.comment-button', function () {
    console.log("VIEW Clicked")

    // Save the id from the button
    let thisId = $(this).attr("data-id");
    let thisTitle= $(this).attr("data-name");
    console.log('ThisId', thisId);
    console.log('ThisTitle',thisTitle);

    renderComments(thisId,thisTitle)

  });

  // Whenever someone clicks to Add a Comment button
  $(document).on('click', '.add-button', function () {
    console.log("ADD Clicked")
    // Empty the comments from the comment section
    $('#comments').empty();
    $('#comments').show();
    // Save the id from the p tag
    let thisId = $(this).attr('data-id');
    let thisTitle= $(this).attr("data-name");
    console.log("thisId:", thisId);
    console.log('ThisTitle',thisTitle);
    // Now make an ajax call for the Article
    $.ajax({
      method: 'GET',
      url: '/articles/' + thisId
    })
      // With that done, add the comment information to the page
      .then(function (data) {
        console.log(data);
        // The title of the article
        $("#comments").append(`<h4 class='topcom'> Add a Comment for Article:</h4><a href='#${thisId}'><h5 class='card-title'><i>${data.title}</i></h5></a>`);
        // An input to enter a Comment Title
        $("#comments").append('<input id="titleinput" placeholder="Comment Title" name="title">');
        // A textarea to add a Comment Body
        $("#comments").append('<textarea id="bodyinput" placeholder="Comment Content" name="body"></textarea>');
        // A button to submit the new comment, with the id of the article associated with it
        $("#comments").append(`<button class='btn btn-warning' data-id='${data._id}' data-name='${data.title}' id='save-comment'>Save Comment</button>`);
      });
  });

  // When user clicks the save-comment button
  $(document).on('click', '#save-comment', function () {
    // Grab the id associated with the article from the submit button
    let thisId = $(this).attr('data-id');
    let thisTitle= $(this).attr("data-name");
    console.log('Save Comment ArticleID', thisId);
    console.log('ThisTitle',thisTitle);
    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
      method: 'POST',
      url: '/comments/' + thisId,
      data: {
        article_id: thisId,
        // Value taken from title input
        title: $('#titleinput').val(),
        // Value taken from comment textarea
        body: $('#bodyinput').val()
      }
    })
      // Once complete
      .then(function (data) {
        // Log the response
        console.log(data);
        console.log('Comment posted')
        // Post confirmation

        renderComments(thisId,thisTitle);

        // Empty the comments section
      });

    // Also, remove the values entered in the input and textarea for comment entry
    $('#titleinput').val('');
    $('#bodyinput').val('');
  });

  // When user clicks the delete button
  $(document).on('click', '#delete-comment', function () {
    console.log('DELETE Clicked')
    // Grab the id associated with the article from the submit button
    let thisId = $(this).attr('data-id');
    let thisTitle= $(this).attr('data-name');
    let thisArticle= $(this).attr('data-art')
    console.log('Save Comment CommentID', thisId);
    console.log('ThisTitle',thisTitle);
    console.log('ThisArticleId',thisArticle)
    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
      method: 'GET',
      url: '/delete/' + thisId,
    })
      // Once complete
      .then(function (data) {
        // Log the response
        console.log(data);
        console.log('Comment deleted')
        renderComments(thisArticle,thisTitle);
      });
  });
})
