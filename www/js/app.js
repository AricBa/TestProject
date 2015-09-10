// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('myApp', ['ionic', 'myApp.controllers','myApp.services', 'myApp.filters','firebase','ionic-datepicker','LocalStorageModule','ngCordova.plugins.camera','ngCordova'])

    .run(function ($ionicPlatform, $rootScope,$ionicPopup,$state,$cordovaCamera) {
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

            //$rootScope.options = {
            //    quality: 50,
            //    destinationType: Camera.DestinationType.DATA_URL,
            //    sourceType: Camera.PictureSourceType.CAMERA,
            //    allowEdit: true,
            //    encodingType: Camera.EncodingType.JPEG,
            //    targetWidth: 100,
            //    targetHeight: 100,
            //    popoverOptions: CameraPopoverOptions,
            //    saveToPhotoAlbum: false
            //};

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
    })
    .constant('FIREBASE_URL', 'https://tionic.firebaseio.com/')
    .config(function(localStorageServiceProvider){
        localStorageServiceProvider
            .setPrefix('myApp')
            .setNotify(true, true);
    })
    .config(function ($urlRouterProvider, $stateProvider) {
        $stateProvider
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
                url: '/settings',
                views: {
                    'settings': {
                        templateUrl: 'templates/settings.html',
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
        $urlRouterProvider.otherwise('/tabs/home');
    });

