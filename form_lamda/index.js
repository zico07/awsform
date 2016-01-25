console.log("Loading event")
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var ses = new aws.SES({apiVersion: '2010-12-01',
						accessKeyId: 'xxxxx',
						secretAccesskey: 'xxxxxxx',
						region: 'us-east-1' });
exports.handler = function(event, context) {
	console.log('Received event:', JSON.stringify(event, null, 2));
	var bucket = event.Records[0].s3.bucket.name;
	var key = event.Records[0].s3.object.key;
	s3.getObject({Bucket: bucket, Key: key},
		function(err, data) {
			if (err){
				context.done('error', 'error getting file' + err);
			} else {
				console.log('data:' + data);
				var message = JSON.parse(data.Body);
				console.log('message:' + message);
				var eParams = {
						Destination: {
							ToAddresses: ["mailaddress1","mailaddress2","mailaddress3"]
						},
						Message: {
							Body: {
								Text: {
									Data: message.info + "\n" +"会社名：" + message.company + "\n" + "部署："+message.division + "\n" + "氏名："+message.name + "\n" + "Email："+message.email + "\n" + "電話番号："+message.tel + "\n" + "住所："+message.address + "\n" + "問い合わせ内容："+message.confirmTitle + "\n" + "問い合わせ詳細："+message.comment + "\n" + "問い合わせ日：" + message.date
								}
							},
							Subject: {
								Data: "ホームページから問い合わせがありました。"
							}
						},
						Source: "frommailaddress"
						};

						console.log('===SENDING EMAIL===');
						var email = ses.sendEmail(eParams, function(err, data){
							if(err){
								console.log("===EMAIL ERR===");
							 	console.log(err);
							 	context.done(null, 'ERR'); 
							}else {
								console.log("===EMAIL SENT===");
								console.log(data);
								context.done(null, 'SUCCESS');
							}
				});
				console.log("EMAIL CODE END");
			}
		}
	);
	
};
