/**
 * Created by C5226508 on 8/4/2015.
 */
angular.module('myApp.filters',[])
.filter('searchFor',function(){
        return function(arr, searchString){
            if(!searchString){
                return arr;
            }

            var result = [];

            searchString = searchString.toLowerCase();

            angular.forEach(arr,function(item){
                if(item.name.first.toLowerCase().indexOf(searchString) !== -1 ){
                    result.push(item);
                }
                else if(item.email.toLowerCase().indexOf(searchString) !== -1){
                    result.push(item);
                }
            });
            return result;
        };
    });