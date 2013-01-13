var Twit = require( 'twit' );
var fs = require( 'fs' );

var FRIENDS_RECHECK_MILLISECONDS = ( 30 * 60 * 1000 ); // 3 minutes

function ReclaimTwitter( config ) {
	this._twit = new Twit( config.auth );
	this._cacheDir = config.cacheDir;
}

ReclaimTwitter.prototype.getFriends = function( screenName, callback ) {

	var self = this;
	var existingCache = this._getFriendsCacheFilename( screenName );

	fs.exists( existingCache, function ( exists ) {
	  if( exists === false ) {
	  	self._getFriends( screenName, callback );
	  }
	  else {
	  	self._checkLastFriendsRequest( screenName, callback );
	  }
	} );
};

ReclaimTwitter.prototype.unfollow = function( userId, callback ) {
	
	this._twit.post('friendships/destroy', { user_id: userId }, function( err, reply, res ) {
		if( err ) {
			callback( err, null, res );
		}
		else {
			callback( null, reply, res );
		}
	});
};

ReclaimTwitter.prototype.unfollowAll = function( userIds, callback ) {
	var unfollowPos = 0;
	var usersToUnfollow = userIds.length;

	function _doUnfollow() {
		var unfollowUserId = userIds[ unfollowPos ];

		console.log( 'next user to unfollow: ' + unfollowUserId + ' (' + unfollowPos + '/' + usersToUnfollow + ')' );
		
		unfollow( unfollowUserId, function( err, reply, response ) {
			if( err ) {
				callback( err, null, response );
			}
			else {
				++unfollowPos;
				callback( null, { reply: reply, unfollowed: unfollowPos }, response );

				var rateLimit = parseInt( response.headers[ 'x-rate-limit-limit' ], 10 );
				var rateLimitRemaining = parseInt( response.headers[ 'x-rate-limit-remaining' ], 10 );
				var rateLimitReset = parseInt( response.headers[ 'x-rate-limit-reset' ], 10 );

				console.log( 'rate limit: ' + rateLimit + ' remaining: ' + rateLimitRemaining );

				if( rateLimitRemaining == 0 ) {					

					var resetDate = new Date( rateLimitReset * 1000 );
					var millisToReset = ( resetDate.getTime() - ( new Date().getTime() ) );

					console.log( 'rate limit reached. waiting for ' + millisToReset + ' ms until next call' );
					setTimeout( _doUnfollow, millisToReset );
				}
				else {
					_doUnfollow();
				}
			}
		} );

	}

	_doUnfollow( unfollowPos )
};

ReclaimTwitter.prototype.getRateLimit = function( callback ) {
	this._twit.get('application/rate_limit_status', function( err, reply, res ) {
		if( err ) {
			callback( err, null, res );
		}
		else {
			callback( null, reply, res );
		}
	});
};

/** @private **/
ReclaimTwitter.prototype._getFriends = function( screenName, callback ) {
	var self = this;

	this._twit.get('friends/ids', { cursor: -1, screen_name: screenName }, function(err, reply, res) {
		if( err ) {
			callback( err, null, res );
		}
		else {
			fs.writeFile( self._getFriendsCacheFilename( screenName ), JSON.stringify( reply ), function (err) {
			  if (err) throw err;
			  callback( null, reply, res );
			});
		}
	});
};

/** @private */
ReclaimTwitter.prototype._getFriendsCacheFilename = function( screenName ) {
	return this._cacheDir + screenName + "-friends.json";
};

/** @private */
ReclaimTwitter.prototype._checkLastFriendsRequest = function( screenName, callback ) {

	var existingCache = this._getFriendsCacheFilename( screenName );

	console.log( 'fetching cache for: ' + existingCache );

	fs.stat( existingCache, function( err, stats ) {
		if( err ) {
			callback( err );
		}
		console.log( stats );

		var checkDate = new Date();
		var modifiedDate = stats.mtime;
		var diffMillis = ( checkDate.getTime() - modifiedDate.getTime() );
		console.log( 'cache date: ' + modifiedDate );
		console.log( 'now: ' + checkDate );
		console.log( 'check millis: ' + diffMillis )
		if( diffMillis > FRIENDS_RECHECK_MILLISECONDS ) {
			console.log( 're-fetching friends list' );
			_getFriends( screenName, callback );
		}
		else {
			console.log( 'already have cache of friends for ' + screenName );

			fs.readFile( existingCache, function( err, data ) {
				callback( null, JSON.parse( data ), null );
			} );
		}
	} );
}

module.exports = ReclaimTwitter;