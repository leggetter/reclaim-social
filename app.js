var path = require( 'path' );
var ReclaimTwitter = require( __dirname + '/lib/ReclaimTwitter' );

var FRIENDS_CACHE_DIR = __dirname + path.sep + 'cache' + path.sep;

var config = require( __dirname + '/config.json' );
console.log( config );

var reclaim = new ReclaimTwitter( {
	auth: config.twitter,
	cacheDir: FRIENDS_CACHE_DIR
} );

reclaim.getRateLimit( function( err, limits, res ) {
	console.log( '\n---------------------------' );
	console.log( 'error:' );
	console.log( err );

	console.log( 'rate limit:' );
	console.dir( limits );
	console.log( limits.resources.friendships );

	// console.log( 'response:' );
	// console.dir( res );
	
} );

reclaim.getFriends( 'leggetter', function( err, friends ) {
	console.log( '\n---------------------------' );
	console.log( 'error:' );
	console.log( err );

	console.log( 'friends:' );
	console.log( friends.ids.length );

	// console.log( '\n---------------------------' );

	// var friendCount = friends.ids.length;
	// reclaim.unfollowAll( friends.ids, function( err, progress, response ) {
	// 	console.log( 'err: ' + err );
	// 	console.log( 'status code: ' + response.statusCode );
	// 	console.log( 'progress: unfollowed ' + progress.unfollowed + ' of ' + friendCount );
	// } );
} );