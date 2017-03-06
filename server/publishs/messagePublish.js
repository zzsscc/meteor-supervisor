Meteor.publish('messageList', function(projectId,page) {
 	//return Messages.find({'chatId':projectId});
	if(projectId){
		return Messages.find({'chatId':projectId},{sort:{createAt:-1},skip:(page-1)*10,limit:10});
	}else{
		return Messages.find({_id:0});
	}
});