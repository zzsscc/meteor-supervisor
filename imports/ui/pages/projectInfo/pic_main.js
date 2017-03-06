import "./pic_main.html"

Template.picMain.onCreated(function() {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */
    //订阅数据
    this.subscribe('pointinfo');


    var _data= Pointinfo.find().fetch();
    console.log(_data);
    //ReactiveDict本地变量
    this.editorData = new ReactiveVar( _data);
});

Template.picMain.helpers({
//  pointInfo: function(){
//      return PointInfo.find();
//  },
	pointTableFull: function() {
        return Pointinfo.find();
    },
});