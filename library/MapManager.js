/**
 * Created by MingZe on 2017/9/10.
 */
function MapManager() {

    var map, geolocation = null, zoom;
    var startMarker, endMarker, driving, myPositionMarker;
    var mapPluginList = [];
    this.mapInit = function (_mapInitPara) {
        zoom = _mapInitPara.mapCfg.zoom;
        map = new AMap.Map(_mapInitPara.container, _mapInitPara.mapCfg);
        if (typeof(_mapInitPara.plugin) != "undefined" && _mapInitPara.plugin.length != 0) {
            AMap.plugin(_mapInitPara.plugin,
                function () {
                    for (var x in _mapInitPara.plugin) {
                        if (_mapInitPara.plugin[x] == "AMap.Driving" || _mapInitPara.plugin[x] == "AMap.Geolocation") {
                            continue;
                        }
                        var mapPluginStr = ("new " + _mapInitPara.plugin[x] + "(" + _mapInitPara.pluginCfg[x] + ")");
                        mapPlugin = eval(mapPluginStr);
                        map.addControl(mapPlugin);
                        mapPluginList[x] = mapPlugin;
                    }
                }
            );
        }
        //起点（用户位置）的marker标记
        startMarker = new AMap.Marker({
            content: "<img style='width:19px;height:32px' src='./templates/images/starts.png'/>",
            offset: new AMap.Pixel(-10, -32)
        })

        //定位（用户位置）的marker标记
        myPositionMarker = new AMap.Marker({
            content: "<img style='width:19px;height:32px' src='./templates/images/mark_my_redflag.png'/>",
            offset: new AMap.Pixel(-10, -32)
        })

        //目的地的marker标记
        endMarker = new AMap.Marker({
            content: "<img style='width:19px;height:32px' src='./templates/images/ends.png'/>",
            offset: new AMap.Pixel(-10, -32)
        })
        this.clearMap();
    };

    this.getStartMarker = function () {
        return startMarker;
    }

    this.getEndMarker = function () {
        return endMarker;
    }

    this.getMyPositionMarker = function () {
        return myPositionMarker;
    }

    this.getMapObj = function () {
        return map;
    };

    this.getMapZoom = function () {
        return map.getZoom();
    }

    this.addMarkerToMap = function (_Marker) {
        _Marker.setMap(map);
    }

    this.removeMarkerToMap = function (_Marker) {
        map.remove(_Marker);
    }

    this.clearMap = function () {
        map.clearMap();
    };

    this.mapSetFitView = function () {
        map.setFitView();
    }

    var markersData;
    this.setMarkerData = function (_markerDataList) {
        var txt = [], url = [], lngLat = [], cname = [];
        for (var x in _markerDataList) {
            lngLat.push(new AMap.LngLat(parseFloat(_markerDataList[x].lng), parseFloat(_markerDataList[x].lat)));
            txt.push((_markerDataList[x].title));
            cname.push((_markerDataList[x].cname));
            url.push((_markerDataList[x].url));
        }
        markersData = {"lngLat": lngLat, "txt": txt, "url": url, "cname": cname};
    };

    var simpleInfoWindowTpl;
    this.setSimpleInfoWindowTpl = function (_simpleInfoWindowTpl) {
        simpleInfoWindowTpl = _simpleInfoWindowTpl;
    };

    var showMarkerCompleteHandler;

    this.setShowMarkerComplete = function (_setShowMarkerComplete) {
        showMarkerCompleteHandler = _setShowMarkerComplete;
    };

    var markerObjs = [];
    this.showMarker = function () {
        var lngLats = markersData.lngLat;
        var txt = markersData.txt;
        var url = markersData.url;
        var cname = markersData.cname;
        AMapUI.loadUI(['overlay/SimpleMarker', 'overlay/SimpleInfoWindow'],
            function (SimpleMarker, SimpleInfoWindow) {
                //内置的样式
                //var iconStyles = SimpleMarker.getBuiltInIconStyles();
                for (var i = 0, len = lngLats.length; i < len; i++) {
                    var tmpTit = txt[i], tmpUrl = url[i], tmplngLats = lngLats[i], tmpCname = cname[i];
					var tlLen,tlSize;
					if(tmpCname.indexOf("|")!=-1){
						tttTmpCname=tmpCname.split("|");
						tlSize=tttTmpCname.length;
						tHHH=20-(tlSize);
						for(var xxx=0;xxx<tlSize;xxx++){
							if(xxx==tttTmpCname.length-1){
								break;
							}
							tlLen=(tttTmpCname[xxx].length<tttTmpCname[xxx+1].length)?tttTmpCname[xxx].length:tttTmpCname[xxx+1].length;
						}
					}
					else{
						tlSize=1;
						tHHH=20;
						tlLen=tmpCname.length;
					}
                    var tl = tlLen, tp = Math.ceil((12 * tl - 29) / 2);
                    var tmpShowCname = tmpCname.replace(/\|/g, "<br>");
                    var marker = new SimpleMarker({
                        //使用内置的iconStyle
                        iconStyle: (i == 0) ? 'red' : 'blue',
                        //图标文字
                        iconLabel: {
                            innerHTML: (i + 1),
                            style: {color: '#fff', fontSize: '0.6rem'}
                        },
                        //显示定位点
                        showPositionPoint: true,
                        clickable: true,
                        map: map,
                        position: tmplngLats,
                        //Marker的label(见http://lbs.amap.com/api/javascript-api/reference/overlay/#Marker)
                        label: {
                            content: "<div align='center'>" + tmpShowCname + "</div>",
                            offset: new AMap.Pixel(-(tp), -(tHHH*tlSize))
                        }
                    });
                    var tmpShowTit = tmpTit.replace(/\|/g, "<br>");
                    var infoTitleTpl = simpleInfoWindowTpl.title.replace('%TITLE%', tmpShowTit);
                    var infoBodyTpl = "";
                    var tmpInfoBodyTpl = "";
                    if (tmpUrl.indexOf("|") != -1) {
                        tmpUrl = tmpUrl.split("|");
                        tmpCname = tmpCname.split("|");
                        for (var u in tmpUrl) {
                            tmpInfoBodyTpl += simpleInfoWindowTpl.body.replace('%URL%', tmpUrl[u]);
                            tmpInfoBodyTpl = tmpInfoBodyTpl.replace('%CNAME%', tmpCname[u]);
                        }
                        infoBodyTpl = tmpInfoBodyTpl;
                    }
                    else {
                        infoBodyTpl = simpleInfoWindowTpl.body.replace('%URL%', tmpUrl);
                        infoBodyTpl = infoBodyTpl.replace('%CNAME%', tmpCname);
                    }


                    if (tmpUrl == "#") {
                        infoBodyTpl = infoBodyTpl.replace('%VRDISPLAY%', "none");
                    }
                    else {
                        infoBodyTpl = infoBodyTpl.replace('%VRDISPLAY%', "block");
                    }
                    if (tmplngLats.lng == "" || tmplngLats.lat == "") {
                        infoBodyTpl = infoBodyTpl.replace('%NAVDISPLAY%', "none");
                    }
                    else {
                        infoBodyTpl = infoBodyTpl.replace('%NAVDISPLAY%', "block");
                    }
                    infoBodyTpl = infoBodyTpl.replace('%LNG%', tmplngLats.lng);
                    infoBodyTpl = infoBodyTpl.replace('%LAT%', tmplngLats.lat);
                    infoBodyTpl = infoBodyTpl.replace('%ENDNAME%', tmpShowTit);

                    var simpleInfoWindowObj = new SimpleInfoWindow({
                        infoTitle: infoTitleTpl,
                        infoBody: infoBodyTpl,
                        offset: new AMap.Pixel(0, -35)//基点指向marker的头部位置
                    });
                    marker.simpleInfoWindow = simpleInfoWindowObj;
                    marker.id = "marker" + i;
                    marker.on("click", function () {
                        this.simpleInfoWindow.open(map, this.getPosition());
                    });
                    markerObjs[i] = marker;
                }
            }
        );
        showMarkerCompleteHandler(markerObjs);
    };

    this.getMarkerObjs = function () {
        return markerObjs;
    }

    this.clearMarker = function () {
    };

    this.setCenter = function (_lng, _lat, _zoom) {
        var z = (typeof (_zoom) == "undefined") ? zoom : _zoom;
        map.setZoom(z);
        map.panTo([_lng, _lat]);
    };


    var gelocationCompleteHandler, gelocationErrorHandler;

    this.setGelocationCompleteHandler = function (_gelocationCompleteHandler) {
        gelocationCompleteHandler = _gelocationCompleteHandler;
    };
    this.setGelocationErrorHandler = function (_gelocationErrorHandler) {
        gelocationErrorHandler = _gelocationErrorHandler;
    };

    this.goToMyPosition = function () {
        if (geolocation == null) {
            alert("还没获取当前位置呢！！！")
        }
        else {
            map.addControl(geolocation);
        }
    }

    this.getMyPosition = function () {
        if (geolocation == null) {
            geolocation = new AMap.Geolocation({
                showButton: false,
                showCircle: true,
                showMarker: true,
                timeout: 5200,
                enableHighAccuracy: true,
                zoomToAccuracy: true
            });
        }
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', gelocationCompleteHandler);//返回定位信息
        AMap.event.addListener(geolocation, 'error', gelocationErrorHandler);      //返回定位出错信息
    };

    var drivingHandler
    this.setDrivingHandler = function (_drivingHandler) {
        drivingHandler = _drivingHandler;
    };

    this.getNavUrl = function (startPosition, endPosition, endName, policy, mode) {
        policy = (typeof (policy) == "undefined") ? 1 : policy;
        mode = (typeof (mode) == "undefined") ? 0 : mode;
        var modeArr = ["car", "bus", "walk", "ride"];
        //http://uri.amap.com/navigation?from=116.478346,39.997361,startpoint&to=116.3246,39.966577,endpoint&via=116.402796,39.936915,midwaypoint&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0
        var drivingUrl = "http://uri.amap.com/navigation?from=";
        drivingUrl += startPosition + ",你的位置&to=";
        drivingUrl += endPosition + "," + endName + "&";
        drivingUrl += "mode=" + modeArr[mode] + "&";
        drivingUrl += "policy=" + policy + "&";
        drivingUrl += "src=mypage&";
        drivingUrl += "coordinate=gaode&";
        drivingUrl += "callnative=0";
        return drivingUrl;
    };

    var driving = null;
    this.drivingToTarget = function (startPosition, endPosition, policy) {
        policy = (typeof (policy) == "undefined") ? 1 : policy;
        var policyArr = [
            AMap.DrivingPolicy.LEAST_TIME,
            AMap.DrivingPolicy.LEAST_FEE,
            AMap.DrivingPolicy.LEAST_DISTANCE,
            AMap.DrivingPolicy.REAL_TRAFFIC
        ];
        //LEAST_TIME，LEAST_FEE, LEAST_DISTANCE,REAL_TRAFFIC
        //最短时间、最少费用、最短路径、规避拥堵
        if (driving == null) {
            driving = new AMap.Driving({
                map: map,
                hideMarkers: true,
                //policy: AMap.DrivingPolicy.LEAST_FEE
                policy: policyArr[policy]
            });
        }
        driving.search(startPosition, endPosition, drivingHandler);
    }

    this.getDrivingObj = function () {
        return driving;
    }

    this.drivingToAMAP = function (drivingCallbackResult) {
        driving.searchOnAMAP({
            origin: drivingCallbackResult.origin,
            destination: drivingCallbackResult.destination
        });
    }

    // var pagePreLoad;
    // this.setPagePreLoadHandler = function (_pagePreLoad) {
    //     pagePreLoad = _pagePreLoad;
    // }
    //
    // var pageLoading;
    // this.setPageLoadingHandler = function (_pageLoading) {
    //     pageLoading = _pageLoading;
    // }
    //
    // var pageLoading;
    // this.setPageLoadingHandler = function (_pageLoading) {
    //     pageLoading = _pageLoading;
    // }

}