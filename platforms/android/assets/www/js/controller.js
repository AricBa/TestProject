/**
 * Created by C5226508 on 7/31/2015.
 */
angular.module('myApp.controllers',['firebase','ionic-datepicker','internationalPhoneNumber'])
.controller('homeCtrl',function($scope, peopleService,FIREBASE_URL,$ionicSideMenuDelegate,
                                $cordovaCamera,$ionicLoading,$cordovaNetwork,$rootScope,$timeout,
                                searchHistory,$ionicActionSheet,customFunction,$state,$ionicPopup,$cordovaContacts,
                                $cordovaClipboard,$cordovaSQLite){
        db = $cordovaSQLite.openDB({ name: 'app.db' });
        $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)");

        $scope.s ='';
        $scope.d ='';
        $scope.insert = function(first, last) {
            alert(first + last);
            var query = "INSERT INTO people (firstname, lastname) VALUES (?,?)";
            $cordovaSQLite.execute(db,query,[first,last]).then(function(result) {
                alert("INSERT ID -> " + result.insertId);
            }, function(error) {
                alert(error);
            });
        };

        $scope.select = function(last) {
            alert(last);
            var query = "SELECT firstname, lastname FROM people WHERE id = ?";
            $cordovaSQLite.execute(db,query,[last]).then(function(result) {
                if(result.rows.length > 0) {
                    alert("SELECTED -> " + result.rows.item(0).firstname + " " + result.rows.item(0).lastname);
                    alert("SELECTED -> " + result.rows.item(0).id);
                } else {
                    alert("NO ROWS EXIST");
                }
            }, function(error) {
                console.error(error);
            });
        };

        $scope.delete = function(last) {
            var query = "DELETE FROM people WHERE id = ?";
            $cordovaSQLite.execute(db,query,[last]).then(function(result) {
                if(result.rows.length > 0) {
                    alert("SELECTED -> " + result.rows.item(0).firstname + " " + result.rows.item(0).lastname);
                } else {
                    alert("NO ROWS EXIST");
                }
            }, function(error) {
                alert(error);
            });
        };

        $scope.call = function(num){
            var myPopup = $ionicPopup.show({
                scope: $scope,
                buttons:[
                    {
                        text: 'Call',
                        type: 'button-positive',
                        onTap: function(e){
                            document.location.href = "tel:" + num;
                        }
                    },
                    {
                        text: 'Add to address book',
                        type: 'button-positive',
                        onTap: function(e){
                            var phoneNumbers = [];
                            phoneNumbers[0] = new ContactField('', num, true);
                            $cordovaContacts.save({"phoneNumbers": phoneNumbers}).then(function(result) {
                                alert(JSON.stringify(result));
                            }, function(error) {
                                alert("Error:" + error);
                            });
                        }
                    },
                    {
                        text: 'Copy',
                        type: 'button-positive',
                        onTap: function(e){
                            $cordovaClipboard.copy(num).then(function(){},function(){});
                        }
                    },
                    {
                        text:'Cancel'
                    }
                ]
            });
            myPopup.then(function(res) {
                console.log('Tapped!', res);
            });
            $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 5000);
        };

        $scope.refresh = function(){
            $state.reload();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $rootScope.$on('$cordovaNetwork:offline', function(){customFunction.myNotice('no network connect');});

        $rootScope.$on('$cordovaNetwork:online', function(event,networkState){
            customFunction.myNotice('network connectted');
            //alert(networkState);
        });

        $scope.submit = function(){
            window.plugins.jPushPlugin.setAlias(document.getElementById("id").value);
            document.getElementById("id").value = '';
        };

        //document.location.href = 'tel:18516278041';
        //var options = {
        //    quality: 100,
        //    destinationType: navigator.camera.DestinationType.FILE_URI,
        //    //sourceType: Camera.PictureSourceType.CAMERA,
        //    allowEdit: true,
        //    targetWidth: 320,
        //    targetHeight: 320,
        //    //popoverOptions: CameraPopoverOptions,
        //    sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
        //    saveToPhotoAlbum: false
        //};
        function takePhoto(){
            $cordovaCamera.getPicture({ quality: 100, targetWidth: 300, targetHeight: 300,allowEdit: true, destinationType: Camera.DestinationType.FILE_URI,sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM }).then(function (imageData) {
                var image = document.getElementById('myImage');

                image.src =  imageData;
            }, function (err) {
                 //error
            });
        }
        function makePhoto(){
            $cordovaCamera.getPicture({ quality: 100, targetWidth: 300, targetHeight: 300,allowEdit: true, destinationType: Camera.DestinationType.FILE_URI
            }).then(function (imageData) {
                var image = document.getElementById('myImage');

                image.src =  imageData;
            }, function (err) {
                //error
            });
        }
        $scope.showActionsheet = function(){
            $ionicActionSheet.show({
                titleText : 'change picture',
                cancelText: 'cancel',
                buttons   : [{text:'takephoto'},{text:'select from album'}],
                //cancel    : function(){},
                buttonClicked : function(index){
                    switch(index){
                        case  1: takePhoto();break;
                        case  0: makePhoto();break;
                        //default: makePhoto();break;
                    }
                    return true;
                }
            });
        };
        //$scope.getPhoto = function()
        //{
        //    Camera.getPicture().then(function(imageURL)
        //    {
        //        console.log(imageURL);
        //    },function(err){
        //        console.log(err);
        //    });
        //};
        //

        $scope.users = searchHistory.getHistory('personInfo');
        console.log($scope.users);
        //var ref = new Firebase(FIREBASE_URL);
        //$scope.users = peopleService.all;

        $scope.openMenu = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        //$scope.data = {
        //    showReorder: false
        //};
        //$scope.moveItem = function(item, fromIndex, toIndex) {
        //    $scope.users.splice(fromIndex, 1);
        //    $scope.users.splice(toIndex, 0, item);
        //
        //    if(  toIndex !== ($scope.users.length - 1) && toIndex !== 0 ){
        //        i = (($scope.users)[toIndex -1].$priority + ($scope.users)[toIndex + 1 ].$priority) / 2 ;
        //
        //        (ref.child('user').child(item.$id)).setPriority(i);
        //        console.log(i);
        //    }
        //    else if (toIndex ===  ($scope.users.length - 1 ))
        //    {
        //        i = ($scope.users)[toIndex -1].$priority + 1;
        //        (ref.child('user').child(item.$id)).setPriority(i);
        //        console.log(i);
        //    }
        //    else
        //    {
        //        i =  ($scope.users)[toIndex + 1].$priority / 2;
        //        (ref.child('user').child(item.$id)).setPriority(i);
        //        console.log(i);
        //    }
        //};
        //$scope.delete = function(user){
        //    peopleService.delete(user);
        //};
        //$scope.date = new Date();
        //$scope.datepickerObject = {
        //    titleLabel: 'Date',  //Optional
        //    todayLabel: 'Today',  //Optional
        //    closeLabel: 'Close',  //Optional
        //    setLabel: 'Set',  //Optional
        //    errorMsgLabel : 'Please select time.',    //Optional
        //    setButtonType : 'button-positive',  //Optional
        //    //inputDate: new Date(),    //Optional
        //    mondayFirst: false,    //Optional
        //   // disabledDates:disabledDates,  //Optional
        //    //monthList:monthList,  //Optional
        //    //from: new Date(),   //Optional
        //    //to: new Date(2015, 7, 29),    //Optional
        //    callback: function (val) {    //Mandatory
        //        datePickerCallback(val);
        //    },
        //    templateType: 'popup',
        //    from: $scope.date
        //};
        //var datePickerCallback = function (val) {
        //    if (typeof(val) === 'undefined') {
        //        console.log('No date selected');
        //    } else {
        //        console.log('Selected date is : ', val);
        //        $scope.date = val ;
        //    }
        //};
    })
.controller('popoverCtrl',function($scope,$ionicPopover,$state,peopleService){
        $scope.person = $scope.$parent.user;
        $scope.users = peopleService.all;

        $ionicPopover.fromTemplateUrl('templates/popover.html',{
            scope:$scope
        }).then(function(popover){
            $scope.popover = popover;
        });

        $scope.openPopover = function($event){
            $scope.popover.show($event);
        };
        $scope.closePopover = function(){
            $scope.popover.hide();
        };
        $scope.$on('$destroy',function(){
            if(typeof $scope.popover !== "undefined"){
                $scope.popover.remove();
            }
        });
        $scope.$on('popover.hide',function(){

        });
        $scope.$on('popover.removed',function(){

        });
        $scope.goOtherUser = function(id){
            $state.go('tabs.detail',{"key":id});
        };
    })
.controller('detailCtrl',function($scope,peopleService,$ionicActionSheet,searchKey,
                                  $state,jsonFactory,searchHistory,$rootScope,customFunction){

        //var onGetRegistradionID = function(data) {
        //    try{
        //        alert("JPushPlugin:registrationID is"+data);
        //        $scope.message = data ;
        //        model.console.push("JPushPlugin:registrationID is " + data);
        //    }
        //    catch(exception){
        //        model.console.push(exception);
        //    }
        //};
        //window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);



        $scope.data = {
            showEdit: false
        };
        //$scope.unbind = localStorageService.bind($scope, 'personInfo');
        ////var users = $scope.personInfo;
        //$scope.user = ($scope.personInfo)[searchKey.key] ;
        var users = searchHistory.getHistory('personInfo');
        $scope.user = users[searchKey.key] ;
        //$scope.user = peopleService.get(searchKey.key) ;

        $scope.save = function(){
            if(!(navigator && navigator.connection && navigator.connection.type!=Connection.NONE)){
                customFunction.myNotice('no network connect');
                //$ionicLoading.show({template: 'no network connect'});
                //$timeout(function(){
                //    $ionicLoading.hide();
                //},500);
                //return false;
            }
            peopleService.update($scope.user).then(function(){
                customFunction.myNotice('save sucess');
                //$ionicLoading.show({template: 'save success'});
                //$timeout(function(){
                //    $ionicLoading.hide();
                //},500);
                //return false;
            });
        };

        //jsonFactory.hospitals('personDetail').then(function(data){
        //    console.log(data);
        //});
    //    $scope.deletePerson = function(){
    //    $ionicActionSheet.show({
    //        destructiveText: 'Delete ' + ($scope.user).name.first,
    //        cancelText: 'Cancel',
    //        destructiveButtonClicked: function(){
    //            peopleService.delete($scope.user);
    //            $state.go('tabs.home');
    //        }
    //    });
    //};
    })
.controller('addPersonCtrl',function($scope,peopleService,FIREBASE_URL,$state){
        var ref = new Firebase(FIREBASE_URL);
        $scope.users = peopleService.all;
        $scope.user = {};

        $scope.getPhoneNumber = function(){
            if( $scope.user.phone === ''){
                navigator.contacts.pickContact(function(contact){
                    $scope.user.phone = ((contact.phoneNumbers)[0]).value ;
                },function(err){
                    alert('Error: ' + err);
                });
            }
        };

        $scope.submitUser = function(){
            (peopleService.create($scope.user)).then(function(key){
                (ref.child('user').child(key)).setPriority(($scope.users)[$scope.users.length - 1].$priority + 1);
            });
            $scope.user = {};
            $state.go('tabs.home');
        };
    })
.controller('editCtrl',function($scope,peopleService,searchKey,$state,searchHistory,localStorageService){
        $scope.index = searchKey.index;
        $scope.unbind = localStorageService.bind($scope, 'personInfo');
        //var users = $scope.personInfo;
        //console.log($scope.personInfo);
        $scope.user = ($scope.personInfo)[searchKey.key] ;
        //$scope.user = peopleService.get(searchKey.key) ;
        //(peopleService.get(searchKey.key)).$bindTo($scope,"user");
        //$scope.save = function(){
        //    $scope.user.gender = document.getElementById("gender").value;
        //    $scope.user.location.city = document.getElementById("city").value;
        //    $scope.user.location.state = document.getElementById("state").value;
        //    $scope.user.location.street = document.getElementById("street").value;
        //    $scope.user.location.zip = document.getElementById("zip").value;
        //    $scope.user.phone = document.getElementById("phone").value;
        //    peopleService.update($scope.user).then(function(key){
        //        $state.go('tabs.detail',{
        //            key: key
        //        });
        //    });
        //};
    })
.controller('aboutCtrl',function($cordovaInAppBrowser,$scope){
        $scope.docs = 'http://www.baidu.com';
        $scope.click = function(){
                $cordovaInAppBrowser.open(encodeURI($scope.docs),'_blank')
                    .then(function(event){

                    })
                    .cache(function(event){

                    });

                //$cordovaInAppBrowser.close();
        };
        //document.addEventListener(function(){
        //    $cordovaInAppBrowser.open(encodeURI($scope.docs),'_blank')
        //        .then(function(event){
        //
        //        })
        //        .cache(function(event){
        //
        //        });
        //
        //    $cordovaInAppBrowser.close();
        //},false);
        //$rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){
        //
        //});
        //
        //$rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
        //    // insert CSS via code / file
        //    $cordovaInAppBrowser.insertCSS({
        //        code: 'body {background-color:blue;}'
        //    });
        //
        //    // insert Javascript via code / file
        //    $cordovaInAppBrowser.executeScript({
        //        //file: 'script.js'
        //    });
        //});
        //
        //$rootScope.$on('$cordovaInAppBrowser:loaderror', function(e, event){
        //
        //});
        //
        //$rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
        //
        //});
    })
.controller('setCtrl',function($scope,customFunction,$cordovaFile,$cordovaFileTransfer,$timeout){
        $scope.send = function(){
            customFunction.sendGossip();
        };

        $scope.data = cordova.file.dataDirectory;
        $scope.storage = cordova.file.applicationStorageDirectory;
        $cordovaFile.getFreeDiskSpace().then(function(success){
            $scope.space = success;
        },function(error){
            alert(error);
        });

        $scope.createNewFile = function(){
            $cordovaFile.createFile(cordova.file.dataDirectory, "new_file.txt", true)
                .then(function (success) {
                    alert("success");
                }, function (error) {
                    // error
                });
        };
        $scope.downloadProgress = 0;
        $scope.down = false ;
        $scope.download = function(){
            if(!(navigator && navigator.connection && navigator.connection.type!=Connection.NONE)){
                customFunction.myNotice('no network connect');
                //$ionicLoading.show({template: 'no network connect'});
                //$timeout(function(){
                //    $ionicLoading.hide();
                //},500);
                //return false;
            }else{
                $scope.down = true;
                var url = encodeURI("http://cdn.wall-pix.net/albums/art-space/00030109.jpg");
                var targetPath = cordova.file.externalApplicationStorageDirectory + "testImages.png";
                //var targetPath = cordova.file.externalApplicationStorageDirectory + "testImag.png";

                var trustHosts = true;
                var options = {};

                $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                    .then(function(result) {
                        alert(result.toURL());
                        $scope.down = false;
                    }, function(err) {
                        alert("Error");
                    }, function (progress) {
                        //$timeout(function () {
                        $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                        //});
                    });
            }

        };
})
.controller('loginCtrl',function(Auth,$ionicLoading,$scope,$state){
        $scope.user ={};
        $scope.user.email = "3@3.com";
        $scope.user.password = "3";
        $scope.goSignUp = function(){
            $state.go('register',{reload:true});
        };

        $scope.goSignIn = function(){
            $state.go('login',{reload:true});
        };

        $scope.tryLogin = function(){
            $ionicLoading.show({
                template: '<div ><ion-spinner icon="lines"></ion-spinner></div>' + 'Loading...'
            });
            Auth.login($scope.user).then(function(user){
                $ionicLoading.hide();

                $state.go('tabs.home',{reload:true});
                var uid = user.uid;
            }).catch(function(err){
                $scope.error = err.toString();
                $ionicLoading.hide();
            });
        };

        $scope.createAccount = function(){
            Auth.register($scope.user).then(function(user){
                return Auth.login($scope.user).then(function(){
                    $scope.user.uid = user.uid;
                    return Auth.createProfile($scope.user);
                }).then(function(){
                    $scope.tryLogin();
                });
            }).catch(function(err){
                $scope.error = err.toString();
            });
        };
    })
.controller('logoutCtrl',function($scope,$ionicActionSheet,Auth){
    $scope.tryLogout = function(){
        $ionicActionSheet.show({
            destructiveText: 'Logout'+' <i class="icon ion-log-out">',
            cancelText: 'Cancel',
            destructiveButtonClicked: function () {
                Auth.logout();
            }
        });
    };
    })
.directive('goEdit',function(){
       return{
           restrict: 'E',
           scope:{
               key:'=',
               index:'='
           },
           template:' <a class="button button-icon ion-compose" ng-click="editUser()"></a>',
           controller: function($scope,$state){
               $scope.editUser = function(){
                   $state.go('tabs.userEdit',{"key":$scope.key,"index":$scope.index});
               };
           }
       };
    })
.directive('myCurrentTime', ['$interval', 'dateFilter',
    function($interval, dateFilter) {
        // return the directive link function. (compile function not needed)
        return function(scope, element, attrs) {
            var format,  // date format
                stopTime; // so that we can cancel the time updates

            // used to update the UI
            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            // watch the expression, and update the UI on change.
            scope.$watch(attrs.myCurrentTime, function(value) {
                format = value;
                updateTime();
            });

            stopTime = $interval(updateTime, 1000);

            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            element.on('$destroy', function() {
                $interval.cancel(stopTime);
            });
        };
    }]);