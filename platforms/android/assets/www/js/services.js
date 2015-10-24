/**
 * Created by C5226508 on 7/31/2015.
 */
angular.module('myApp.services',['firebase'])

.factory('peopleService',function( $q, $http, FIREBASE_URL,$firebaseObject,$firebaseArray,searchHistory,localStorageService){

        var ref = new Firebase(FIREBASE_URL);
        var people = $firebaseArray(ref.child('user'));
        //(ref.child('user').child(0)).setPriority(0);
        //(ref.child('user').child(1)).setPriority(1);
        //(ref.child('user').child(2)).setPriority(2);
        //(ref.child('user').child(3)).setPriority(3);

        //function getData(){
        //    var d = $q.defer();
        //
        //    var ref = new Firebase(FIREBASE_URL);
        //    var people = $firebase(ref.child('user')).$asArray();
        //    people.$loaded().then(function(data){
        //        d.resolve(data);
        //    });
        //
        //    return d.promise;
        //};
        //
        //getData().then(function(data){
        //    angular.forEach(data,function(value){
        //        console.log(value);
        //    });
        //});


        //people.$loaded().then(function(){
        //    angular.forEach(people,function(value){
        //        console.log(value.$id);
        //    });
        //});


    people.$loaded().then(function(){
        localStorageService.clearAll();
        angular.forEach(people,function(value){
            searchHistory.updateHistory('personInfo',value.$id,value);
        });
    });


    var People = {
      all: people,
      get: function(userId){
          //return $firebaseObject(ref.child('user').child(userId)) ;
          return people.$getRecord(userId) ;
      },
      delete: function (user){
          ref.child('user').child(user.$id).remove(function(error){
              if (error) {
                  console.log("Error:", error);
              } else {
                  console.log("Removed successfully!");
              }
          });
      },
      update: function(user){
          //this.delete(user);
          //var d = $q.defer();
          //people.$add(user).then(function(ref){
          //    d.resolve(ref.key());
          //});
          //return d.promise;
          var d = $q.defer();
          var index = people.$indexFor(user.$id);
          people[index] = user;
          people.$save(index).then(function(ref){
              d.resolve(ref.key());
          });
          return d.promise;
      },
      create: function(user){
          var d = $q.defer();
          people.$add(user).then(function(ref){
              d.resolve(ref.key());
          });
          return d.promise;
      }
    };

    return People ;
})

.factory('jsonFactory',function($http){
        var jsonFactory = {
            hospitals: function(fileName){
                var url = 'format/' + fileName + '.json';
                console.log(url);
                var promise = $http.get(url).then(function(response){
                    console.log(response);
                    return response.data;
                });
                return promise;
            }
        };
        return jsonFactory ;
    })
.factory('searchHistory', function (localStorageService) {
    var searchHistory;
    searchHistory = {
        getHistory: function (arrayName) {
            if ((typeof  localStorageService.get(arrayName) !== 'undefined') && (localStorageService.get(arrayName) !== null)) {
                return localStorageService.get(arrayName);
            } else {
                return {};
            }
        },
        indexInHistory: function (arrayName, key) {
            var arr = this.getHistory(arrayName);
            var hash = {};
            for (var i = 0; i < arr.length; i += 1) {
                hash[arr[i]] = i;
            }
            return !!(hash.hasOwnProperty(key));
        },
        objSize: function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        },
        updateHistory: function (arrayName, key,value) {
            var obj = this.getHistory(arrayName);
            //if (!obj.hasOwnProperty(key)) {
            //    //var i=this.objSize(obj);
            //    obj[key] = value;
            //}
            obj[key] = value;
            localStorageService.set(arrayName, obj);
            return obj;
        },

        deleteHistory: function (arrayName, key) {
            var obj = this.getHistory(arrayName);

            if (obj.hasOwnProperty(key)) {
                //var i=this.objSize(obj);
                delete obj[key];
            }
            localStorageService.set(arrayName, obj);
            return obj;

        }


    };
    return searchHistory;
})
.factory('customFunction',function($ionicLoading,$timeout,$ionicActionSheet){
    var customFunct;
    customFunct = {
        myNotice : function(msg,timeout){
            $ionicLoading.show({template: msg});
            $timeout(function(){
                $ionicLoading.hide();
            },timeout || 1000);
            return false;
        },
        sendGossip : function(){
            if(!(navigator && navigator.connection && navigator.connection.type!=Connection.NONE)){
                return this.myNotice('no network connect...');
            }
            $ionicActionSheet.show({
                titleText : 'Share',
                cancelText: 'Cancel',
                buttons   : [{text: 'share to friend circle'},{text: 'share to wechat friend'}],
                //cancel    : function(){Yibeiban.myLogger('CANCELLED');},
                buttonClicked : function(index){
                    customFunct.myNotice('Loading...',20000);
                    Wechat.share({
                        message: {
                            description: index === 0 ? 'anonymous information?click to get detail...' : '',
                            title: 'test',
                            thumb:'',
                            media: {
                                type: 7,
                                webpageUrl: "http://www.baidu.com"
                            }
                        }, scene: index ===0 ? 1:0
                    }, function(){
                        $ionicLoading.hide();
                    }, function(reason) {
                        $ionicLoading.hide();
                    });
                    return true;
                }
            });
        }
    };

    return customFunct;

})
.factory('Auth',function(FIREBASE_URL,$firebaseAuth,$rootScope,$location){
        var ref = new Firebase(FIREBASE_URL);
        var authObj = $firebaseAuth(ref);

        var Auth = {
            register: function(user){
                return authObj.$createUser({
                    email: user.email,
                    password: user.password
                });
            },
            createProfile: function(user){
                return ref.child("users").child(user.uid).set({
                    username: user.username,
                    useremail: user.email
                });
            },
            login: function(user){
                return authObj.$authWithPassword({
                    email    : user.email,
                    password : user.password
                });
            },
            logout: function(){
                return authObj.$unauth();
            },
            signedIn: function(){
                return authObj.$onAuth(function(data){
                    if(data){
                        $rootScope.authData = data;
                        console.log(data);
                    }else{
                        console.log("Logged out");
                        $location.path('/login');
                    }
                });
            }
        };

        return Auth;
    })
.factory('versionUpdate',function($http,$rootScope,$ionicPopup,$ionicLoading,
                                  $cordovaFileTransfer,$cordovaFileOpener2,$timeout,customFunction){
        var versionUpdate;
        versionUpdate = {
            checkUpdate: function(){
                $http({
                            method: 'POST',
                            url:'http://www.pgyer.com/apiv1/app/getAppKeyByShortcut',
                            data: $.param({
                                shortcut: "MRKK",
                                _api_key: "3e82e9b1d0472abd52e0b292b5ff02cd"
                            }),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function(data){
                               if($rootScope.currentVersion != data.data.appVersion){
                                   var confirmPopup =  $ionicPopup.confirm({
                                       title:'version update',
                                       template: 'Get latest version',
                                       cancelText: 'Cancel',
                                       okText: 'Update'
                                   });

                                   confirmPopup.then(function(res){
                                       if(res){
                                           $ionicLoading.show({
                                               template: "download: 0%"
                                           });

                                           var url= "http://www.pgyer.com/apiv1/app/install?_api_key=3e82e9b1d0472abd52e0b292b5ff02cd" +
                                               "&aKey="+data.data.appKey+"&password=123";
                                           var targetPath ="file:///storage/sdcard0/Download/test.apk";
                                           var trustHosts = true;
                                           var options = {};

                                           $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                                               // open the download app
                                               $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                                               ).then(function () {
                                                       // success
                                                   }, function (err) {
                                                       // error
                                                   });
                                               $ionicLoading.hide();
                                           }, function (err) {
                                               customFunction.myNotice('load error');
                                           }, function (progress) {
                                               //progress
                                               $timeout(function () {
                                                   var downloadProgress = (progress.loaded / progress.total) * 100;
                                                   $ionicLoading.show({
                                                       template: "download: " + Math.floor(downloadProgress) + "%"
                                                   });
                                                   if (downloadProgress > 99) {
                                                       $ionicLoading.hide();
                                                   }
                                               });
                                           });
                                       }else{
                                           //cancel
                                       }
                                   });
                               }else {
                                   customFunction.myNotice("The current version is latest");
                               }
                        }).error(function(data,status){
                        });
            },
        };

        return versionUpdate;
    })
.factory('sqlService',function($cordovaSQLite){

      //db = $cordovaSQLite.openDB({ name: 'app.db' });
      //$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS data (id integerd primary key, data text)");

      var sqlService;
      sqlService = {
          insert : function(data) {
              db = $cordovaSQLite.openDB({ name: 'app.db' });
              $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS data (id integerd primary key, data text)");

              var query = "INSERT INTO people (data) VALUES (?)";
              $cordovaSQLite.execute(db,query,[data]).then(function(result) {
                  alert("INSERT ID -> " + result.insertId);
              }, function(error) {
                  alert("error"+error);
              });
          },

          select : function(key) {
              var query = "SELECT data FROM people WHERE id = ?";
              $cordovaSQLite.execute(db,query,[key]).then(function(result) {
                  if(result.rows.length > 0) {
                      alert("SELECTED -> " + result.rows.item(0).data);
                      alert("SELECTED -> " + result.rows.item(0).id);
                  } else {
                      alert("NO ROWS EXIST");
                  }
              }, function(error) {
                  console.error(error);
              });
          },

          delete : function(key) {
              var query = "DELETE FROM people WHERE id = ?";
              $cordovaSQLite.execute(db,query,[key]).then(function(result) {
                  if(result.rows.length > 0) {
                      alert("SELECTED -> " + result.rows.item(0).data );
                  } else {
                      alert("NO ROWS EXIST");
                  }
              }, function(error) {
                  alert(error);
              });
          }
      };
      return  sqlService;
  })
.factory('getData',function(Restangular){
      var getData;
      getData = {
          getData: function(){
              return Restangular.all('sap/po/purchase_orders/4500017495/items/00010').customGET('',{},{token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9' +
              '.eyJjbXlHVUlEIjoiNDAyODhiODE0N2NkMTZjZTAxNDdjZDIzNmRmMjAwMDAiLCJjbXlOYW1lIjoiZGVsbCIsInVzZXJJZCI6MTAwMDAxLCJl' +
              'bWFpbCI6InRvbnkuc2hhbmdAb3J5emFzb2Z0LmNvbSJ9.' +
              'qF0vdhbA1pWriJQualvMgW-OHkrTwJ2SP5AJUctnH6k'});
          }
      };
     return getData;
});
//.factory('Camera',['$q',function($q){
//        return {
//            getPicture: function(options){
//            var q = $q.defer();
//
//            navigator.camera.getPicture(function (result)
//            {
//                q.resolve(result);
//            }, function (err) {
//                q.reject(err);
//            }, options);
//
//            return q.promise;
//        }
//    }
//}])