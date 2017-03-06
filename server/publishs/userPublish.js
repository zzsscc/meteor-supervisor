Meteor.publish('userInfo', function(uid) {
 	return Users.find({"_id":uid});
});