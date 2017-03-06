import "./navigation.html"

Template.navigation.rendered = function(){

    // Initialize metisMenu
    $('#side-menu').metisMenu();

};

//if($('.cockpit-choose').hasClass ("active")){
//    $('.cockpit-choose').find('img').attr('src','img/project-choosed.png');
//}

Template.navigation.onCreated(function() {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */

    //cockpit页面已经订阅了User表和project表，这边订阅无效
    //var loguser=localStorage.getItem('loguser');
    //console.log(loguser);
    ////订阅数据
    //this.subscribe('loguser',loguser);
    //this.subscribe('project',loguser);
    //this.subscribe('allsuptitle');

    //var choosepro=sessionStorage.getItem('choosepro');
    //this.choosepro= new ReactiveVar(choosepro);
    //console.log(choosepro);

    //this.subscribe('allusers');
    this.subscribe('dictionaries');
    //if($('.cockpit-choose').hasClass ("active")){
    //    $('.cockpit-choose').find('img').attr('src','img/project-choosed.png');
    //}

});

Template.navigation.helpers({
    navigationUser: function () {
        var loguser=sessionStorage.getItem('loguser');

        var bendiUT=Users.find({'_id':loguser}).fetch();


        for(var i=0;i<bendiUT.length;i++){
            bendiUT[i].type=Dictionaries.find({"ecode":"userType",'value':bendiUT[i].type}).fetch()[0].name;
        }
        return bendiUT;
        //return Users.find({'_id':loguser});
    },
    //navigationPro: function () {
    //    //var choosepro=sessionStorage.getItem('choosepro');
    //    if (typeof( Session.get('choosepro')) == 'undefined') {
    //        Session.setDefault('choosepro', sessionStorage.getItem('choosepro'));
    //    }
    //    var choosepro=Session.get("choosepro");
    //    console.log(choosepro);
    //    return Project.find({'_id':choosepro});
    //},
    navigationSorH: function () {
        var loguser=sessionStorage.getItem('loguser');
        var user = Users.findOne({ '_id': loguser });
        if (user) {
            var loguserType = user.type;

            //if(loguserType==1 || loguserType==0){
            if (loguserType == 0) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
});


// Used only on OffCanvas layout
Template.navigation.events({

    'click .close-canvas-menu' : function(){
        $('body').toggleClass("mini-navbar");
    },

});