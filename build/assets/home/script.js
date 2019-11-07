// Content Scroll

$(window).scroll(function() {
	var scrollTop = $(window).scrollTop();
	var imgPos = scrollTop / 3.6 + 'px';
	$('.content-float').css('transform', 'translateY(' + imgPos + ')');
});

// Blog Posts

$(document).ready(function() {

	var $result = $('#feed .post-feed');

    const api = new GhostContentAPI({
	  url: 'https://holochain.ghost.io',
	  key: '711bd2cfaf42635eb249d95cd6',
	  version: "v3"
	});

	api.posts
    .browse({limit: 3, include: 'tags,authors', filter: 'tags:tech'})
    .then((posts) => {
        posts.forEach((post) => {
            $result.append(
            	'<article class="post-card">' +
	            	'<a class="post-card-image-link" href="' + post.url + '" target="_blank">' +
				        '<img class="post-card-image" src="' + post.feature_image + '" alt="' + post.title + '" />' +
				        '<section class="post-card-excerpt">' + post.excerpt + '</section>' +
				    '</a>' +
				    '<div class="post-card-content">' +
				        '<a class="post-card-content-link" href="' + post.url + '" target="_blank">' +
				            '<header class="post-card-header">' +
				                '<h3 class="post-card-title">' + post.title + '</h3>' +
				            '</header>' +
				        '</a>' +
				    '</div>' +
            	'</article>'
	        );
        });
    })
    .catch((err) => {
        console.error(err);
    });
});