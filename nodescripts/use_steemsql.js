var steem = require('steem');
steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });


const BASEURL = 'https://steemit.com/'
const ACCOUNT_NAME = 'steemladder'

    console.log('SteemLadder app has started');

const sql = require('mssql');
const config = {
    user: 'Steemit-gokulnk',
    password: 'you-will-get-this-once-you-subscribe',
    server: 'vip.steemsql.com',
    database: 'DBSteem',
}

    steem.api.streamOperations(function (err, operations) {
	    var txType = operations[0];
	    var txData = operations[1];
	    var steemDbquery = '';
	    if (txType == 'comment' && txData.json_metadata){
		var metadata = JSON.parse(txData.json_metadata);
		if (metadata) {
		    var tags = metadata.tags || [];
		    var parentAuthor = txData.author;
		    var parentPermlink = txData.permlink;
		    var commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);

		    if (txData.parent_author == '' && tags.indexOf("introduceyourself") > -1) {
			console.log(steemFullurl(parentAuthor, parentPermlink));
			steemDbquery = `SELECT * FROM [dbo].[Comments] where author = '${parentAuthor}' AND json_metadata like '%introduce%' AND DEPTH = 0`;
			sql.connect(config).then(pool => {
				console.log('Connected to SteemSQL');
				return pool.request()
				.query(steemDbquery)
			    }).then(result => {
				    console.log(result); // Print SQL results to console for debugging                                                                                           
				    if (result.rowsAffected[0] <=2) {
					doSomething();
				    }
				    sql.close();
				})

			    sql.on('error', err => {
				    console.log('Unable to connect to DB');
				})
			    }
		}
	    }
	});
