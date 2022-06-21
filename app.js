const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';
function fetchUsers() {
    return fetchData(`${ BASE_URL }/users`)
  }
  function renderUser(user) {
   const userCard = $(`
   <div class="user-card">
  <header>
    <h2>${user.name}</h2>
  </header>
  <section class="company-info">
    <p><b>Contact:</b> ${user.email}</p>
    <p><b>Works for:</b> ${user.company.name}</p>
    <p><b>Company creed:</b> ${user.company.catchPhrase}</p>
  </section>
  <footer>
    <button class="load-posts">POSTS BY ${user.username}</button>
    <button class="load-albums">ALBUMS BY ${user.username}</button>
  </footer>
</div>
   `)
   userCard.find('.load-albums, .load-posts').data('user', user)
   return userCard;
}
function renderUserList(userList) {
    $('#user-list').empty()
    userList.forEach(el => {

        $('#user-list').append(renderUser(el))
    });
}
/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
   return fetchData(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`)
}
/* render a single album */
function renderAlbum(album) {
    const albumElement = $(`
    <div class="album-card">
  <header>
    <h3>${album.title} by ${album.user.username}</h3>
  </header>
  <section class="photo-list">
  </section>
  </div>
    `);

    let photoListEl = albumElement.find('.photo-list');
    album.photos.forEach((el) => {
        photoListEl.append(renderPhoto(el));
    });

    return albumElement;
}
/* render a single photo */
function renderPhoto(photo) {
    return (`
    <div class="photo-card">
  <a href="${photo.url}" target="_blank">
    <img src="${photo.thumbnailUrl}">
    <figure>${photo.title}</figure>
  </a>
</div>
    `)
}
/* render an array of albums */
function renderAlbumList(albumList) {
    $('#app section.active').removeClass('active')
    $('#album-list').empty()
    $('#album-list').addClass('active')
    albumList.forEach(el => {
        $('#album-list').append(renderAlbum(el))
    });
}
function fetchData(url) {
    return fetch(url)
    .then(function (response) {
     return response.json();
    }).catch(function (error) {
      console.error('bad');
    });
}

function renderPost(post) {
 let postElement = $(`
  <div class="post-card">
  <header>
     <h3>${post.title}</h3>
    <h3>${post.user.username}</h3>
  </header>
  <p>${post.body}
  </p>
 <footer>
   <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
 </footer>
 </div>
 `);
 
 postElement.data('post', post)

return postElement;
}

function renderPostList(postList) {
  $('#app section.active').removeClass('active');
  $('#post-list').empty();
  $('#post-list').addClass('active');
  postList.forEach(el => {
    $('#post-list').append(renderPost(el))
});
}

function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
  fetchUserPosts(1).then(console.log);
}

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
  fetchPostComments(1).then(console.log);
}

  $('#user-list').on('click', '.user-card .load-posts', function () {  
      let x = $(this).data('user').id
      fetchUserPosts(x).then(setCommentsOnPost);
      fetchUserPosts(x).then(renderPostList);
  });


  $('#user-list').on('click', '.user-card .load-albums', function () {
    let x = $(this).data('user').id
    fetchUserAlbumList(x).then(renderAlbumList);
  });

  function setCommentsOnPost(post) {
    if (!post.comments) {
      post.forEach((element) => {
        fetchPostComments(element.id).then((data) => (element.comments = data));
      });
      console.log(post);
    return post;
    } else {
      return Promise.reject();
    }
  }

//   const successfulPromise = Promise.resolve(3);

// successfulPromise.then(function (value) {
//   return 5; // oh no, we lose 3 at this step
// }).then(function (value) {
//   return value * value;
// }).then(console.log);

  fetchUsers().then(function (data) {
    renderUserList(data) ;
  });

  function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
  }

  $('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
    const commentListElement = postCardElement.find('.comment-list');

    setCommentsOnPost(post)
    .then(function (post) {
      commentListElement.empty();

      for (let i =0; i < post.comments.length; i++){
        let value =post.comments[i];

        let newH3 = $(`<h3>${value.body} ${value.email}</h3>`);
        commentListElement.prepend(newH3);
      }
      
      toggleComments(postCardElement);
    })
    .catch(function (){
      toggleComments(postCardElement);
    });
  });

function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}