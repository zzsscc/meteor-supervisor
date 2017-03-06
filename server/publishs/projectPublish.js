//发布项目id
Meteor.publish('projectModules', function(project_id) {
 	return Projecttype.find({'belongPro':project_id});
});

Meteor.publish('pointList', function(type) {
 	return Pointinfo.find({'belongProType':type});
});


Meteor.publish('pointListByTypes', function(types) {
	var param = [];
	for(var i = 0;i<types.length;i++)
	{
		param.push({'belongProType':types[i]});
	}
 	return Pointinfo.find({$or:param});
});