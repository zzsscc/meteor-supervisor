// var schedule = require('node-schedule');
// 每周五下午五点统计发送
var everyWeekReport = new Cron(function() {
    console.log("everyWeekReport");
    var tempDate = new Date(); //获取今天日期
        // console.log(tempDate.getDay());
    if(tempDate.getDay() != 5)
    {
        return;
    }
    Meteor.call('weekReport');    
},{
    minute:0,
    hour:17
});
//每月1日9点统计发送
var everyMonthReport = new Cron(function() {
console.log("everyMonthReport");
    Meteor.call('monthReport');
},{
    minute: 0,
    hour: 9,
    day: 1
});