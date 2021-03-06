// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('myApp', ['ionic', 'myApp.controllers','myApp.services', 'myApp.filters',
    'firebase','ionic-datepicker','LocalStorageModule','ngCordova','angular-svg-round-progress','restangular'])

    .run(function ($ionicPlatform, $rootScope,$ionicPopup,$state,Auth,getData,sqlService) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            $rootScope.format = 'yyyy-MM-dd h:mm:ss a';
            // window.plugins.jPushPlugin.init();

        });
        $ionicPlatform.registerBackButtonAction(function (event) {
            if($state.current.name === 'tabs.home'){
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Exit TestProject',
                    template: 'Are you sure you want to exit testproject'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        navigator.app.exitApp();
                    } else {
                        console.log('You are not sure');
                    }
                });
            }
            else
            {
                navigator.app.backHistory();
            }
        }, 100);



        var onDeviceReady   = function(){
            //alert(device.uuid);

          cordova.getAppVersion.getVersionNumber().then(function (version) {
              $rootScope.currentVersion = version;
          });
            window.plugins.jPushPlugin.init();
            window.plugins.jPushPlugin.setDebugMode(true);
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 1000);
        };
        window.document.addEventListener("deviceready", onDeviceReady, false);

        var onOpenNotification = function(event){
            try{
                var alertContent ;
                if(device.platform == "Android"){
                    alertContent=window.plugins.jPushPlugin.openNotification.alert;
                }else{
                    alertContent   = event.aps.alert;
                }
                alert("open Notificaiton:"+alertContent);
            }
            catch(exception){
                console.log("JPushPlugin:onOpenNotification"+exception);
            }
        };
        document.addEventListener("jpush.openNotification", onOpenNotification, false);


          var onReceiveMessage = function(event){
              try{
                  var message;
                  if(device.platform == "Android"){
                      message = window.plugins.jPushPlugin.receiveMessage.message;

                      getData.getData().then(function(data){
                          alert("data"+data);

                          alert(JSON.stringify(data));
                          sqlService.insert(data);
                      },function(error){
                          alert("error " +err);
                      });
                  }else{
                      message   = event.content;
                  }
                  alert("message:   "+message);

              }
              catch(exception){
                  console.log("JPushPlugin:onReceiveMessage-->"+exception);
              }
          };
        document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);



        Auth.signedIn();

    })
    .constant('FIREBASE_URL', 'https://tionic.firebaseio.com/')
    .config(function(localStorageServiceProvider){
        localStorageServiceProvider
            .setPrefix('myApp')
            .setNotify(true, true);
    })
    .config(function ($urlRouterProvider, $stateProvider,RestangularProvider) {
        $stateProvider
        .state('login',{
            url:"/login",
            templateUrl: "templates/login.html",
            controller : 'loginCtrl'
        })
        .state('register',{
            url:"/register",
            templateUrl: "templates/register.html",
            controller : 'loginCtrl'
        })
        .state('tabs', {
            url: '/tabs',
            templateUrl: 'templates/tabs.html',
            abstract: true
        })
        .state('tabs.home', {
            url: '/home',
            views: {
                'user': {
                    templateUrl: 'templates/home.html',
                    controller: 'homeCtrl'
                }
            }
        })
        .state('tabs.detail', {
            cache:false,
            url: '/user/:key',
            views: {
                'user':{
                    templateUrl: 'templates/detail.html',
                    controller: 'detailCtrl'
                }
            },
            resolve: {
                searchKey: function ($stateParams) {
                    return {key: $stateParams.key};
                }
            }
        })
        .state('tabs.userEdit', {
            url: '/userEdit/:key?index',
            views: {
                'user': {
                    templateUrl: 'templates/edit.html',
                    controller: 'editCtrl'
                }
            },
            resolve: {
                searchKey: function ($stateParams) {
                    return {
                        key: $stateParams.key,
                        index: $stateParams.index
                    };
                }
            }
        })
        .state('tabs.about', {
            url: '/about',
            views: {
                'about': {
                    templateUrl: 'templates/about.html',
                    controller:'aboutCtrl'
                }
            }
        })
        .state('tabs.settings', {
            url: '/setting',
            views: {
                'setting': {
                    templateUrl: 'templates/setting.html',
                    controller:'setCtrl'
                }
            }
        })
        .state('tabs.addPerson', {
            url: '/user/addPerson',
            views:{
                'user':{
                    templateUrl: 'templates/addPerson.html',
                    controller: 'addPersonCtrl'
                }
            }
        });

      RestangularProvider.setBaseUrl('http://114.215.185.243:8080/data-app/rs/v1/');
      //RestangularProvider.setRestangularFields({
      //    id: '_id'
      //});

        $urlRouterProvider.otherwise('/login');
    });

