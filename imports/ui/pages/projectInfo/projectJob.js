import "./projectJob.html"

let loguser;
let _imgTempinfo;
let map;
let protypeId = "all";
let usernameId;
let mapPosition = [];

let pointId;
let userId;


let _projectss;
let _protype;
let _pointinfo;
let _register;
let _alluser;
//let _imgTempinfo;
let choosepro;

let timeout1;
let timeout2;
let timeout3;
let markers;
let pppoints;

//定义默认时间
let dayTime=formatDay(((Date.parse(new Date()))/ 1000).toString());
//搜索
let searchT;

//轨迹类型
let trailType='paishe';

//$.datepicker._gotoToday = function () {
//	$('#data_1').datepicker('setDate', new Date()).datepicker('hide').blur();
//};


//时间戳转换为时间格式，yyyy-mm-dd h:m:s
function formatDate_zsc(dateC) {
    var date=new Date(dateC);
    var y = date.getFullYear() + "-";
    var m = date.getMonth() + 1 + "-";
    var d = date.getDate();

    //当前小时大于12
    var h = date.getHours();
    //var am=h>12?" 下午 ":" 上午 ";
    //24小时制换为12小时制
    //h=h>12?h-12:h;
    //一位数小时数前加个0
    h = h < 10 ? "0" + h : "" + h;

    //一位数分钟数前加个0
    var mi = date.getMinutes();
    mi = mi < 10 ? "0" + mi : "" + mi;

    //一位数秒数前加个0
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : "" + s;


    //字符串拼接
    var dateTime = y + m + d + ' ' + h + ":" + mi + ":" + s;
    return dateTime;
}

function formatDay(dateC) {
    var date=new Date(dateC*1000);
    var y = date.getFullYear() + "-";
    var m = date.getMonth() + 1;
    var d = date.getDate();

	m = m < 10 ? "0" + m : "" + m;
	m = m + "-";
	d = d < 10 ? "0" + d : "" + d;
    //字符串拼接
    var dateday = y + m + d;
    return dateday;
}


function filter(template,project_id,prototype_id,userId,day_time,trail_type,searchT){
	$('#mengban').show();
	//销毁的顺序出了问题
	//初始化页面（清拍摄轨迹数据）
	_imgTempinfo.stop();
	template.pointData.set(Pointinfo.find({_id:0}).fetch());
	template.imgData.set(Imageinfo.find({_id:0}).fetch());
	template.trajectory.set(Imageinfo.find({_id:0}).fetch());
	$('.markinfo').html(' 位置名称：请选择地图上的一个点位');
	map.clearOverlays();//清楚标记
	markers=[];
	pppoints=[];
	//初始化数据（清签到轨迹数据）
	_register.stop();

	//获取新的轨迹等
	if(trail_type=='paishe'){
		_imgTempinfo = Meteor.subscribe('imageinfonum',project_id,prototype_id,userId,function(){
			$('#mengban').hide();
			// _imgTempinfo = tem;
			//传入的day_time为yyyy-mm-dd格式
			//如果没有选择日期，也没有搜索内容
			if(!day_time && !searchT){
				//清空地图上面一行的信息
				$('.markinfo').html(' 位置名称：请选择地图上的一个点位');
				template.pointData.set(Pointinfo.find({_id:0}).fetch());
				//图
				var picInfo = Imageinfo.find({},{sort:{createtime:-1}}).fetch();
				//照片本地变量
				template.imgData.set(picInfo);
				//点
				var pointInfo = Pointinfo.find().fetch();
			}
			//如果选择了日期,没有搜索内容
			else if(day_time && !searchT){
				//清空地图上面一行的信息
				$('.markinfo').html(' 位置名称：请选择地图上的一个点位');
				template.pointData.set(Pointinfo.find({_id:0}).fetch());
				//图
				var picInfo=[];
				var picInfoTochuli = Imageinfo.find({},{sort:{createtime:-1}}).fetch();
				for(var i=0;i<picInfoTochuli.length;i++){
					//picInfoTochuli[i].createtime=formatDay(picInfoTochuli[i].createtime);
					console.log(formatDay(picInfoTochuli[i].createtime));
					if(formatDay(picInfoTochuli[i].createtime)==day_time){
						picInfo.push(picInfoTochuli[i]);
					}
				}
				//照片本地变量
				template.imgData.set(picInfo);
				//点
				var pointInfo = Pointinfo.find().fetch();
			}
			//没有选择日期，有搜索内容
			else if(!day_time && searchT){
				//清空地图上面一行的信息
				$('.markinfo').html(' 位置名称：请选择地图上的一个点位');
				template.pointData.set(Pointinfo.find({_id:0}).fetch());
				//图
				var picInfo = Imageinfo.find({},{sort:{createtime:-1}}).fetch();
				//照片本地变量
				template.imgData.set(picInfo);
				//点
				var pointInfo = Pointinfo.find({
					$or: [
						{'code': {$regex: searchT, $options:'i'}},
						{'name': {$regex: searchT, $options:'i'}}
					],
				}).fetch();
			}
			//选择了日期，也有搜索内容
			else if(day_time && searchT){
				//清空地图上面一行的信息
				$('.markinfo').html(' 位置名称：请选择地图上的一个点位');
				template.pointData.set(Pointinfo.find({_id:0}).fetch());
				//图
				var picInfo=[];
				var picInfoTochuli = Imageinfo.find({},{sort:{createtime:-1}}).fetch();
				for(var i=0;i<picInfoTochuli.length;i++){
					//picInfoTochuli[i].createtime=formatDay(picInfoTochuli[i].createtime);
					console.log(formatDay(picInfoTochuli[i].createtime));
					if(formatDay(picInfoTochuli[i].createtime)==day_time){
						picInfo.push(picInfoTochuli[i]);
					}
				}
				//照片本地变量
				template.imgData.set(picInfo);
				//点
				var pointInfo = Pointinfo.find({
					$or: [
						{'code': {$regex: searchT, $options:'i'}},
						{'name': {$regex: searchT, $options:'i'}}
					],
				}).fetch();
			}



			//没搜索
			//if(!searchT){
			//	var pointInfo = Pointinfo.find().fetch();
			//}
			////有搜索
			//else{
			//	var pointInfo = Pointinfo.find({
			//		$or: [
			//			{'code': {$regex: searchT, $options:'i'}},
			//			{'name': {$regex: searchT, $options:'i'}}
			//		],
			//	}).fetch();
			//}



			console.log(picInfo);
			map.clearOverlays();//清楚标记
			markers=[];
			pppoints=[];
			var trailObj=[];
			if(picInfo.length>0){
				for(var i = 0;i<picInfo.length;i++){
					for(var j=0;j<pointInfo.length;j++){
						//if(pointInfo.length>0){
						//	map.panTo(new BMap.Point(pointInfo[0].longitude,pointInfo[0].latitude));
						//}
						if(picInfo[i].belongPoint === pointInfo[j]._id){
							//					console.log(picInfo[i].belongPoint);
							var iconPic = new BMap.Icon("img/monitor-hui.png", new BMap.Size(37, 38),{
								anchor: new BMap.Size(20, 38)
							});

							//var marker=new BMap.Marker(e.point,{icon:myIcon});
							var pppoint=new BMap.Point(pointInfo[j].longitude,pointInfo[j].latitude);
							pppoints.push(pppoint);      //将点存起来,连线用

							var marker = new BMap.Marker(pppoint,{icon:iconPic});  // 创建标注
							markers.push(marker);      //将标注点存起来,轨迹用
							var pointid=pointInfo[j]._id;
							var content = pointInfo[j].name;
							//轨迹列表
							var time = formatDate_zsc(picInfo[i].createtime*1000);
							trailObj.push({
								'id':pointid,
								'content':content,
								'time':time,
								'longitude':pointInfo[j].longitude,   //经度
								'latitude':pointInfo[j].latitude   //纬度
							});

							console.log(content);
							map.addOverlay(marker);               // 将标注添加到地图中
							//添加文字标签
							if(Pointinfo.find({_id:pointid}).fetch()[0]){
								var label = new BMap.Label(Pointinfo.find({_id:pointid}).fetch()[0].nowpicsum,{offset:new BMap.Size(18,-6)});
								//根据数量是几位数来设置label样式
								if((Pointinfo.find({_id:pointid}).fetch()[0].nowpicsum).toString().length>1){
									label.setStyle({
										color : "#fff",
										fontSize : "16px",
										backgroundColor :'red',
										border :"1px",
										borderRadius :"10px",
										fontWeight :"bold",
										width:(Pointinfo.find({_id:pointid}).fetch()[0].nowpicsum).toString().length*15+'px',
										height:'20px',
										maxWidth:'1000px',
										textAlign:'center',
										lineHeight:'20px'
									});
								}
								else{
									label.setStyle({
										color : "#fff",
										fontSize : "16px",
										backgroundColor :'red',
										border :"1px",
										borderRadius :"10px",
										fontWeight :"bold",
										width:'20px',
										height:'20px',
										maxWidth:'1000px',
										textAlign:'center',
										lineHeight:'20px'
									});
								}
								marker.setLabel(label);
							}

							addClickHandler(content,marker,pointid);
							function addClickHandler(content,marker,pointid){
								marker.addEventListener("click",function(e){
									console.log(e);
									console.log(content);
									//地图上面一行的信息
									$('.markinfo').html(' 位置名称：'+content);
									template.pointData.set(Pointinfo.find({_id:pointid}).fetch());
									openInfo(content,e);
									var iconPicSelectd = new BMap.Icon("img/monitor.png", new BMap.Size(37, 38),{
										anchor: new BMap.Size(20, 38)
									});
									for(var i=0;i<markers.length;i++){
										markers[i].setIcon(iconPic);
									}
									e.target.setIcon(iconPicSelectd);
									map.panTo(new BMap.Point(e.target.getPosition().lng,e.target.getPosition().lat));

									//如果选择了日期
									if(day_time){
										//图
										var picInfo=[];
										var picInfoTochuli = Imageinfo.find({'belongPoint':pointid},{sort:{createtime:-1}}).fetch();
										for(var i=0;i<picInfoTochuli.length;i++){
											//picInfoTochuli[i].createtime=formatDay(picInfoTochuli[i].createtime);
											console.log(formatDay(picInfoTochuli[i].createtime));
											if(formatDay(picInfoTochuli[i].createtime)==day_time){
												picInfo.push(picInfoTochuli[i]);
											}
										}
										//照片本地变量
										template.imgData.set(picInfo);

									}
									//template.imgData.set(Imageinfo.find({'belongPoint':pointid}).fetch());
								});
							}

							function openInfo(content,e){
								var p = e.target;
								var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
								var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象
								map.openInfoWindow(infoWindow,point); //开启信息窗口
							}
							var opts = {
								width : 80,     // 信息窗口宽度
								height: 60,     // 信息窗口高度
								title : "点位描述" , // 信息窗口标题
								enableMessage:true//设置允许信息窗发送短息
							};
							break;
						}
					}
				}
			}
			//去除相邻的相同的点位的数据
			console.log(trailObj);
			var newtrailObj=[];
			for(var i=trailObj.length-1;i>0;i--){
				if(trailObj[i].id!=trailObj[i-1].id){
					newtrailObj.push(trailObj[i])
				}
			}
			console.log(newtrailObj);
			//把第一个加进来
			if(newtrailObj.length>0){
				if(newtrailObj[newtrailObj.length-1].id != trailObj[0].id){
					newtrailObj.push(trailObj[0]);
				}
			}else if(newtrailObj.length==0){
				if(trailObj.length!=0){
					newtrailObj.push(trailObj[0]);
				}
			}
			console.log(newtrailObj);
			//倒序
			//newtrailObj.reverse();
			//轨迹本地变量
			template.trajectory.set(newtrailObj);

			//画线
			//var trajectorys=template.trajectory.get();
			//console.log(trajectorys);
			console.log(pppoints);
			for(var i=0;i<pppoints.length-1;i++){
				var polyline = new BMap.Polyline([pppoints[i],pppoints[i+1]], {strokeColor:"#3cca86", strokeWeight:6, strokeOpacity:1});  //定义折线
				console.log(polyline);
				map.addOverlay(polyline);     //添加折线到地图上
			}
			//var polyline = new BMap.Polyline([pointA,pointB], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线
			//map.addOverlay(polyline);     //添加折线到地图上

			//$('.trail-li:first-child').click();
		})
	}
	else if(trail_type=='qiandao'){
		_register = Meteor.subscribe('registerList',userId,prototype_id,function(){
			$('#mengban').hide();
			//var registers=Register.find({}).fetch();
			//console.log(registers);
			//传入的day_time为yyyy-mm-dd格式
			//如果没有选择日期，也没有搜索内容
			if(!day_time && !searchT){
				//签到
				var registers=Register.find({}).fetch();
			}
			//如果选择了日期,没有搜索内容
			else if(day_time && !searchT){
				//签到
				var registers=[];
				var registersToChuLi = Register.find({}).fetch();
				for(var i=0;i<registersToChuLi.length;i++){
					console.log(formatDay(registersToChuLi[i].createAt));
					if(formatDay(registersToChuLi[i].createAt)==day_time){
						registers.push(registersToChuLi[i]);
					}
				}
			}
			//没有选择日期，有搜索内容
			else if(!day_time && searchT){
				//签到
				var registers = Register.find({
					$or: [
						{'pointCode': {$regex: searchT, $options:'i'}},
						{'pointName': {$regex: searchT, $options:'i'}}
					],
				}).fetch();
			}
			//选择了日期，也有搜索内容
			else if(day_time && searchT){
				//签到
				var registers=[];
				var registersToChuLi = Register.find({
					$or: [
						{'pointCode': {$regex: searchT, $options:'i'}},
						{'pointName': {$regex: searchT, $options:'i'}}
					],
				}).fetch();
				for(var i=0;i<registersToChuLi.length;i++){
					console.log(formatDay(registersToChuLi[i].createAt));
					if(formatDay(registersToChuLi[i].createAt)==day_time){
						registers.push(registersToChuLi[i]);
					}
				}
			}

			console.log(registers);
			var trailObj=[];
			for(var i = 0;i<registers.length;i++){
				console.log('进来了');
				var iconPic = new BMap.Icon("img/monitor-hui.png", new BMap.Size(37, 38),{
					anchor: new BMap.Size(20, 38)
				});

				//var marker=new BMap.Marker(e.point,{icon:myIcon});
				var pppoint=new BMap.Point(registers[i].lng,registers[i].lat);
				pppoints.push(pppoint);      //将点存起来,连线用

				var marker = new BMap.Marker(pppoint,{icon:iconPic});  // 创建标注
				markers.push(marker);      //将标注点存起来,轨迹用
				var registerid=registers[i]._id;
				var content = registers[i].pointName;
				//轨迹列表
				var time = formatDate_zsc(registers[i].createAt*1000);
				trailObj.push({
					'id':registerid,
					'content':content,
					'time':time,
					'longitude':registers[i].lng,   //经度
					'latitude':registers[i].lat   //纬度
				});

				console.log(content);
				map.addOverlay(marker);               // 将标注添加到地图中

				addClickHandler(content,marker,registerid);
				function addClickHandler(content,marker,registerid){
					marker.addEventListener("click",function(e){
						console.log(e);
						console.log(content);
						//地图上面一行的信息
						$('.markinfo').html(' 位置名称：'+content);
						openInfo(content,e);
						var iconPicSelectd = new BMap.Icon("img/monitor.png", new BMap.Size(37, 38),{
							anchor: new BMap.Size(20, 38)
						});
						for(var i=0;i<markers.length;i++){
							markers[i].setIcon(iconPic);
						}
						e.target.setIcon(iconPicSelectd);
						map.panTo(new BMap.Point(e.target.getPosition().lng,e.target.getPosition().lat));
					});
				}

				function openInfo(content,e){
					var p = e.target;
					var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
					var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象
					map.openInfoWindow(infoWindow,point); //开启信息窗口
				}
				var opts = {
					width : 80,     // 信息窗口宽度
					height: 60,     // 信息窗口高度
					title : "签到位置" , // 信息窗口标题
					enableMessage:true//设置允许信息窗发送短息
				};
			}
			//去除相邻的相同的点位的数据
			console.log(trailObj);
			var newtrailObj=[];
			for(var i=trailObj.length-1;i>0;i--){
				if(trailObj[i].id!=trailObj[i-1].id){
					newtrailObj.push(trailObj[i])
				}
			}
			console.log(newtrailObj);
			//把第一个加进来
			if(newtrailObj.length>0){
				if(newtrailObj[newtrailObj.length-1].id != trailObj[0].id){
					newtrailObj.push(trailObj[0]);
				}
			}else if(newtrailObj.length==0){
				if(trailObj.length!=0){
					newtrailObj.push(trailObj[0]);
				}
			}
			console.log(newtrailObj);
			//倒序
			//newtrailObj.reverse();
			//轨迹本地变量
			template.trajectory.set(trailObj);
			//template.trajectory.set(newtrailObj);

			//画线
			//var trajectorys=template.trajectory.get();
			//console.log(trajectorys);
			console.log(pppoints);
			for(var i=0;i<pppoints.length-1;i++){
				var polyline = new BMap.Polyline([pppoints[i],pppoints[i+1]], {strokeColor:"#3cca86", strokeWeight:6, strokeOpacity:1});  //定义折线
				console.log(polyline);
				map.addOverlay(polyline);     //添加折线到地图上
			}
			//var polyline = new BMap.Polyline([pointA,pointB], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线
			//map.addOverlay(polyline);     //添加折线到地图上
		})
	}
}


Template.projectJob.rendered = function(){
//  //选择时间的控件

	 //$( "#slider-range" ).slider({
    //  range: true,
    //  min: oldTime,
    //  max: curTime,
    //  values: [ oldTime, curTime ],
    //  slide: function( event, ui ) {
    //    $( "#amount" ).val( ui.values[ 0 ] + " -" + ui.values[ 1 ] );
    //  }
    //});
    //$( "#amount" ).val(formatDay($( "#slider-range" ).slider( "values", 0 )) +
    //  " ----- " + formatDay($( "#slider-range" ).slider( "values", 1 ) ));

	$('#data_1').datepicker({
		todayBtn: "linked",
		keyboardNavigation: false,
		forceParse: false,
		calendarWeeks: true,
		autoclose: true
	});
};

//将上次的订阅销毁
Template.projectJob.onDestroyed (function(){
   //_projectss.stop();
	_protype.stop();
	_pointinfo.stop();
	_register.stop();
	//_alluser.stop();
	_imgTempinfo.stop();
	dayTime = null;
	if(timeout1){
		clearTimeout(timeout1);
	}
	if(timeout2){
		clearTimeout(timeout2);
	}
	if(timeout3){
		clearTimeout(timeout3);
	}
});

Template.projectJob.onCreated(function(){

	loguser=sessionStorage.getItem('loguser');
    //Session.get('loguser2');
//  console.log(loguser);
    if(!loguser){
        FlowRouter.go('/login');
    }

    //当前项目的_id
    //choosepro=sessionStorage.getItem('choosepro');
    if (typeof( Session.get('choosepro')) == 'undefined') {
        Session.setDefault('choosepro', sessionStorage.getItem('choosepro'));
    }
    choosepro=Session.get("choosepro");

	$('#mengban').show();
	this.subscribe('project',loguser);

    //_projectss = this.subscribe('projectss',choosepro);
    
    _protype = this.subscribe('protype',choosepro);
    
    _pointinfo = this.subscribe('pointinfos');

	_register = this.subscribe('registerList');
    
    this.subscribe('allusers');
    
    _imgTempinfo = this.subscribe('imageinfonum',function(){
		$('#mengban').hide();
	});
  
    var _data = Pointinfo.find({}).fetch();

    this.pointData = new ReactiveVar( _data);
    this.imgNub=new ReactiveVar();
    this.trajectory=new ReactiveVar();

	//照片本地变量
	var img_data = Imageinfo.find({}).fetch();
	this.imgData = new ReactiveVar( img_data);

	//拍摄或签到本地变量
	this.trail_type=new ReactiveVar();

	//定义默认时间
	//dayTime = '2017-8-9';

})



Template.projectJob.onRendered(function() {

	//	地图
    map = new BMap.Map("allmap");
	var point = new BMap.Point(120.193393,30.273018);
	map.centerAndZoom(point,11);

	var geolocation = new BMap.Geolocation();
	map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

	//function addClickHandler(content,marker){
	//	marker.addEventListener("click",function(e){
	//		openInfo(content,e);
	//	});
	//}
	//function openInfo(content,e){
	//	var p = e.target;
	//	var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
	//	var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象
	//	map.openInfoWindow(infoWindow,point); //开启信息窗口
	//}

	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			var mk = new BMap.Marker(r.point);
//			map.addOverlay(mk);
			map.panTo(r.point);
		}
		else {
			alert('failed'+this.getStatus());
		}
	},{enableHighAccuracy: true})

//	添加点击事件显示当前定位
	map.addEventListener("click",function(e){
		$('.maplocation').html('选择点经度：'+e.point.lng + ";选择点纬度：" + e.point.lat);
	});



////	设置marker图标为水滴
//	var vectorMarker = new BMap.Marker(new BMap.Point(point.lng,point.lat-0.03), {
//	  // 指定Marker的icon属性为Symbol
//	  icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
//	    scale: 2,//图标缩放大小
//	    fillColor: "orange",//填充颜色
//	    fillOpacity: 0.8//填充透明度
//	  })
//	});
//	map.addOverlay(vectorMarker);
//	map.setViewport({center:new BMap.Point(116.501035,39.897538),zoom:14});

// 编写自定义函数,创建标注
//	function addMarker(point){
//	  var vectorMarker = new BMap.Marker(point); // 创建标注
//	  map.addOverlay(vectorMarker); // 将标注添加到地图中
//	}
//
//	var data_info = [];
//	var opts = {
//				width : 100,     // 信息窗口宽度
//				height: 80,     // 信息窗口高度
//				title : "点位描述" , // 信息窗口标题
//				enableMessage:true//设置允许信息窗发送短息
//			   };
//	for(var i=0;i<data_info.length;i++){
//		var marker = new BMap.Marker(new BMap.Point(data_info[i][0],data_info[i][1]));  // 创建标注
//		var content = data_info[i][2];
//
//		//marker.setTitle(data_info[i][2]);
//
//		//marker.addEventListener("click", function (e) {
//		//	console.log(1111);
//		//	$('.markinfo').html(marker.getTitle());
//		//});
//
//		map.addOverlay(marker);               // 将标注添加到地图中
//		addClickHandler(content,marker);
//	}

	//filter(this,choosepro,protypeId,usernameId,dayTime);
	_protype = this.subscribe('protype',choosepro,function(){
		dayTime=formatDay(((Date.parse(new Date()))/ 1000).toString());
		$('.supervision:first-child').click();
	});

});


Template.projectJob.helpers({
    proType:function(){
		var projecttype = Projecttype.find().fetch();
		var imageinfo = Imageinfo.find().fetch();
		var imgArr = [];
		var arr =[];
		for(var i=0;i<projecttype.length;i++){
			arr.push(projecttype[i]._id)
		}
		var pointinfo1 = Pointinfo.find().fetch();
		for(var i=0;i<arr.length;i++){
			var count = 0;
			for(var j = 0;j<pointinfo1.length;j++){
				if(pointinfo1[j].belongProType == arr[i]){
					count++;
				}
			}
			projecttype[i].proTypNumber = count;
		}
		for(var m =0;m< arr.length;m++){
			var sum = 0;
			for(var n = 0; n < imageinfo.length;n++){
				if(imageinfo[n].belongProType ==arr[m]){
					sum++;
				}
			}
			projecttype[m].picNumber = sum;
		}
		return projecttype;
	},
	superVision:function(){
		var project1 = Project.find({'_id':choosepro}).fetch();
		var projecttype1 = Projecttype.find().fetch();
		var user2 = Users.find().fetch();
		var visionArr = [];
		var data=[];
//		console.log(projecttype1[0].belongPro)

//		console.log(project1)
		for(var i=0;i<projecttype1.length;i++){
			if(project1[0]._id == projecttype1[i].belongPro){
				visionArr.push(projecttype1[i].supervision);
			}			
		}
		if(visionArr.length>0){
//			把二元数组转化成一元
			var visionArr2 = visionArr.join(",").split(",");
//			console.log(visionArr2)
			var visionArr3 =[];
			for(var i = 0; i< visionArr2.length;i++){
				if(visionArr3.indexOf(visionArr2[i]) == -1&&visionArr2[i].length != 0){
					//对监理员进行去重保存监理的id
					visionArr3.push(visionArr2[i]);
				}
				
			}
//			console.log(visionArr3)
			var visionNameArr = []
			for(var j=0; j<visionArr3.length;j++){
				for(var k = 0;k<user2.length;k++){
					if(visionArr3[j] == user2[k]._id){
						visionNameArr.push(user2[k].username)
					}
				}	
			}
//			console.log(visionNameArr)
			projecttype1.visionName = visionNameArr;
			
			for(var i=0;i<visionNameArr.length;i++){
				var obj={};
				obj.visionName = visionNameArr[i];
//				console.log(visionArr3);		
				obj.superVision_id = visionArr3[i];
				data.push(obj);
			}

		}
		
		return data;
	},
	imageinfo:function(){
        //var bendiImageinfo=Imageinfo.find({},{sort:{createtime:-1}}).fetch();
        var bendiImageinfo=Template.instance().imgData.get();
		if(bendiImageinfo && bendiImageinfo.length>0){
			Template.instance().imgNub.set(bendiImageinfo.length);
			for(var i=0;i<bendiImageinfo.length;i++){
				bendiImageinfo[i].createtime=formatDate_zsc(bendiImageinfo[i].createtime*1000);
			}
			return bendiImageinfo;
		}
    },
	point_nowpicsum:function(){
		var point=Template.instance().pointData.get();
		if(point[0]){
			return point[0].nowpicsum;
		}
		return false;
	},
    piccount:function(){
    	return Template.instance().imgNub.get();
    },
	'trajectory':function(){
		var trajectorys=Template.instance().trajectory.get();
		if(trajectorys && trajectorys.length>0){
			for(var i=0;i<trajectorys.length;i++){
				trajectorys[i].ordinal = i + 1;
			}
			return trajectorys;
		}
		return false;
	},
	'today':function(){
		return formatDay(((Date.parse(new Date()))/ 1000).toString());
	},
	//选择为签到轨迹时隐藏页面上不需要的东西
	'trail_type':function(){
		var trail_type=Template.instance().trail_type.get();
		if(trail_type=='qiandao'){
			return false;
		}
		else{
			return true;
		}
	},
});

Template.projectJob.events({
	'click .potype':function(e,template){
		e.preventDefault();
		var  _this= e.currentTarget;
		$(_this).siblings().removeClass('active');
		$(_this).addClass('active');
		
		var _id = $(_this).attr('data');
		
		localStorage.setItem("id1",_id);
		
		protypeId = localStorage.getItem("id1");

		filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);

	},
	'click .supervision':function(e,template){
		e.preventDefault();
		var  _this= e.currentTarget;
		$(_this).siblings().removeClass('active');
		$(_this).addClass('active');
		var _id= $(_this).attr('data');
		localStorage.setItem("id2",_id);
		
		usernameId  = localStorage.getItem("id2");
		console.log(usernameId);
		
		filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);


	},
	//选择轨迹类型
	'click .trail':function(e,template){
		e.preventDefault();
		var  _this= e.currentTarget;
		$(_this).siblings().removeClass('active');
		$(_this).addClass('active');
		trailType=$(_this).attr('data');
		Template.instance().trail_type.set(trailType);
		console.log(trailType);
		//Meteor.call('register',"ZgWB8hD5vpQgrEydF",'监理员1','120.148409','30.271985','电子警察点位1','P-3452','bLsNxjHpRypArpMef','电子警察','500');
		filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);
	},
	 //鼠标移到照片缩略图上时显示删除按钮
    'mouseenter .pics':function(e){
        e.preventDefault();
        $(e.target).find('.toremovePic').show();
    },
    //鼠标移到照片缩略图上时隐藏删除按钮
    'mouseleave .pics':function(e){
        e.preventDefault();
        $(e.target).find('.toremovePic').hide();
    },
    //点击照片上的删除按钮
    'click .toremovePic':function(e){
        e.preventDefault();
        image_id=this._id;
//      console.log(image_id);
    },
    //确认删除照片
    'click .removePic':function(e){
        e.preventDefault();
        //Meteor.call('removeImage',image_id);
    },

    //双击照片打开大图
    'dblclick .jl-img':function(e){
        e.preventDefault();
        image_id=this._id;
    },


	//点击轨迹列表中的一条，移动地图到那个点位
	'click .trail-li':function(e,template){
		console.log(e.currentTarget);
		$(e.currentTarget).siblings().removeClass('active');
		$(e.currentTarget).addClass('active');
		var this_point_id = e.currentTarget.getAttribute('data-pointid');
		var this_content = e.currentTarget.getAttribute('data-content');
		//改变地图上面一行的信息
		$('.markinfo').html(' 位置名称：'+this_content);
		template.pointData.set(Pointinfo.find({_id:this_point_id}).fetch());
		//移动地图
		map.setZoom(11);
		map.panTo(new BMap.Point(this.longitude,this.latitude));

		//地图图标
		var iconPic = new BMap.Icon("img/monitor-hui.png", new BMap.Size(37, 38),{
			anchor: new BMap.Size(20, 38)
		});
		var iconPicSelectd = new BMap.Icon("img/monitor.png", new BMap.Size(37, 38),{
			anchor: new BMap.Size(20, 38)
		});

		for(var i=0;i<markers.length;i++){
			if(markers[i].getPosition().lng==this.longitude && markers[i].getPosition().lat==this.latitude){
				console.log(markers[i]);
				markers[i].setIcon(iconPicSelectd);
				//为了模拟点击地图marker的效果
				if(dayTime){
					//图
					var picInfo=[];
					var picInfoTochuli = Imageinfo.find({'belongPoint':this_point_id},{sort:{createtime:-1}}).fetch();
					for(var j=0;j<picInfoTochuli.length;j++){
						//picInfoTochuli[i].createtime=formatDay(picInfoTochuli[i].createtime);
						console.log(formatDay(picInfoTochuli[j].createtime));
						if(formatDay(picInfoTochuli[j].createtime)==dayTime){
							picInfo.push(picInfoTochuli[j]);
						}
					}
					//照片本地变量
					template.imgData.set(picInfo);

				}
				//照片本地变量
				template.imgData.set(picInfo);
			}else{
				markers[i].setIcon(iconPic);
			}
		}
	},
	//点击时间插件
	'click #data_1':function(e){
		e.preventDefault();
		$('#data_1').datepicker({
			todayBtn: "linked",
			keyboardNavigation: false,
			forceParse: false,
			calendarWeeks: true,
			autoclose: true
		});
	},
	//选择时间改变后
	'change .chooseDay':function(e,template){
		e.preventDefault();
		console.log($('.chooseDay').val());
		if(!$('.chooseDay').val()){
			$('.chooseDay').val(formatDay(((Date.parse(new Date()))/ 1000).toString()));
			dayTime=formatDay(((Date.parse(new Date()))/ 1000).toString());
		}else{
			dayTime=$('.chooseDay').val();
		}
		filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);
	},


	//搜索
	'click .toSearchPoint': function(e,template) {
		e.preventDefault();
		var searchHTML=$('.searchPoint').val();
		console.log(searchHTML);
		searchT=searchHTML;
		filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);

	},
	'keydown .searchPoint':function(e,template){
		if(e && e.keyCode==13){ // enter 键
			var searchHTML=$('.searchPoint').val();
			console.log(searchHTML);
			searchT=searchHTML;
			filter(template,choosepro,protypeId,usernameId,dayTime,trailType,searchT);
		}
	},
});
