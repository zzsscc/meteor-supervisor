
//每天早上1点备份 
var everydayBackup = new Cron(function() {
  var projectList = Project.find({'backup':1}).fetch();
  for(var i = 0;i<projectList.length;i++)
  {
      Meteor.call('backup',projectList[i]._id);
  }
},{
   minute:0,
   hour:1
});

//每周1早上备份
var everyWeekBackup = new Cron(function() {
   var tempDate = new Date(); //获取今天日期
  if(tempDate.getDay() != 1)
  {
      return;
  }
  var projectList = Project.find({'backup':3}).fetch();
  for(var i = 0;i<projectList.length;i++)
  {
      Meteor.call('backup',projectList[i]._id);
  }
},{
   minute:0,
   hour:1
});

//每月1日早上备份
var everyMonthBackup = new Cron(function() {
  var projectList = Project.find({'backup':4}).fetch();
  for(var i = 0;i<projectList.length;i++)
  {
      Meteor.call('backup',projectList[i]._id);
  }
},{
   minute:0,
   hour:1,
   day:1
});