# Reclaim Social

There are so many social media services available and the more you sign up for and the more you use them the more data you have to try to consume. Ultimately you miss lots of stuff that you'd probably be very interested in.

So, this is an initial hack to help you clean things up.

## Twitter

The first version of this hack lets you **unfollow everybody**.

```javascript
var ReclaimTwitter = require( __dirname + '/lib/ReclaimTwitter' );

var config = {
	auth: {
		"consumer_key": "",
		"consumer_secret": "",
		"access_token": "",
		"access_token_secret": ""
	},
	cacheDir: "cache/"
};

var reclaim = new ReclaimTwitter( config );
reclaim.getFriends( 'YOUR_SCREEN_NAME', function( err, friends ) {
	var friendCount = friends.ids.length;
	reclaim.unfollowAll( friends.ids, function( err, progress, response ) {
		console.log( 'err: ' + err );
		console.log( 'status code: ' + response.statusCode );
		console.log( 'progress: unfollowed ' + progress.unfollowed + ' of ' + friendCount );
	} );
} );
```

In order to run the script you'll need to create an application **with read/write permissions** via https://dev.twitter.com/. This will give you a `consumer_key` and a `consumer_secret`. You can then also create a `access_token` and a `access_token_secret` for you as a Twitter user. With this information you can run the app.

## What next?

* Unfollowing everybody might be a bit extreme: So, it makes sense to only unfollow those that you haven't recently interacted with or that you haven't favorited a tweet from.
* Other social media services: as other social media services get similarly cluttered it might make sense to add scripts to help clear those down.

I'm not sure what else. This just served a purpose right now.
