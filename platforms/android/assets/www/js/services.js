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