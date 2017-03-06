import '../../ui/pages/a/a-loading.js';
import '../../ui/pages/a/a-jquery.pagination.min.js';

 //登录
import '../../ui/pages/login/login.js';

//驾驶舱
import '../../ui/pages/cockpit/cockpit.js';
import '../../ui/pages/cockpit/cockpit_table.js';


//项目管理
import '../../ui/pages/project/project.js';
import '../../ui/pages/project/project_table.js';

//用户管理
import '../../ui/pages/users/userManagement.js';
import '../../ui/pages/users/user_table.js';

//业主管理
import '../../ui/pages/owners/ownerManagement.js';

//具体项目信息
import '../../ui/pages/projectInfo/projectOverview.js';
import '../../ui/pages/projectInfo/projectPicture.js';
import '../../ui/pages/projectInfo/projectJob.js';
import '../../ui/pages/projectInfo/projectBasic.js';
import '../../ui/pages/projectInfo/pic_main.js';
import '../../ui/pages/projectInfo/toggle.js';
import '../../ui/pages/projectInfo/icheck.min.js';
import '../../ui/pages/projectInfo/bootstrap-datepicker.js';
import '../../ui/pages/projectInfo/bootstrap-datepicker.zh-CN.min.js';


 import '../../ui/pages/projectInfo/blueimp-helper.js';
 import '../../ui/pages/projectInfo/blueimp-gallery.min.js';
 import '../../ui/pages/projectInfo/blueimp-gallery-fullscreen.js';
 import '../../ui/pages/projectInfo/blueimp-gallery-indicator.js';
 import '../../ui/pages/projectInfo/jquery.blueimp-gallery.min.js';



//layouts
import '../../ui/pages/layouts/main.js';
import '../../ui/pages/layouts/blank.js';
import '../../ui/pages/layouts/mainLayout2.js';

//landing
import '../../ui/pages/landing/landing.js';

//common
import '../../ui/pages/common/footer.js'; 
import '../../ui/pages/common/navigation.js';
import '../../ui/pages/common/page-heading.js';
import '../../ui/pages/common/right-sidebar.js';
import '../../ui/pages/common/subNavigation.js';
import '../../ui/pages/common/top-navbar.js';
import '../../ui/pages/common/top-navbar2.js';
 import '../../ui/pages/common/loading.js';





//默认首页
FlowRouter.route('/', {
    action: function() {
        FlowRouter.go('/login');
    }
});
//驾驶舱路由
//FlowRouter.route('/cockpit/:_id', {
FlowRouter.route('/cockpit', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "cockpit"});
    },
    //waitOn: function(){
    //    return Meteor.subscribe('cockpitTable'),Meteor.subscribe('userTable');
    //    return Meteor.subscribe([Meteor.subscribe('cockpitTable'), Meteor.subscribe('userTable') ]);
    //},
});
//项目管理路由
FlowRouter.route('/project', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "project"});
    }
});
//用户管理路由
FlowRouter.route('/userManagement', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "userManagement"});
    }
});
//业主管理路由
FlowRouter.route('/ownerManagement', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "ownerManagement"});
    }
});
//项目概况
FlowRouter.route('/projectOverview', {
    action: function() {
        BlazeLayout.render("mainLayout2", {content: "projectOverview"});
    }
});
//工作概况
FlowRouter.route('/projectJob', {
    action: function() {
        BlazeLayout.render("mainLayout2", {content: "projectJob"});
    }
});
//图片总览
FlowRouter.route('/projectPicture', {
    action: function() {
        BlazeLayout.render("mainLayout2", {content: "projectPicture"});
    }
});
//基础设置
FlowRouter.route('/projectBasic', {
    action: function() {
        BlazeLayout.render("mainLayout2", {content: "projectBasic"});
    }
});

//
// Layouts route
//

FlowRouter.route('/layouts', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "layouts"});
    }
});

//
// login
//
FlowRouter.route('/login', {
    action: function() {
        BlazeLayout.render("blankLayout", {content: "login"});
    }
});
