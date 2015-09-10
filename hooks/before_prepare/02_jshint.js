#!/usr/bin/env node

var fs = require('fs'); 
var path = require('path'); 
var jshint = require('jshint').JSHINT; 
var async = require('async'); 

var foldersToProcess = [ 
    'js'
];

foldersToProcess.forEach(function(folder) { 
    processFiles("www/" + folder);
}); 


function processFiles(dir, callback) { 
    var errorCount = 0; 
    fs.readdir(dir, function(err, list) { 
        if (err) {
            console.log('processFiles err: ' + err);
            return; 
        } 

        async.eachSeries(list, function(file, innercallback) { 
            file = dir + '/' + file; //2 
            fs.stat(file, function(err, stat) { //3 
                if(!stat.isDirectory()) { //4 
                    if(path.extname(file) === ".js") { //5 
                        lintFile(file, function(hasError) { 
                            if(hasError) { //6 
                                errorCount++; 
                            }
                            innercallback(); 
                        }); 
                    } else { 
                        innercallback(); 
                    } 
                } else { 
                    innercallback(); 
                } 
            }); 
        }, function(error) { // 7 
            if(errorCount > 0) { 
                process.exit(1); 
            } 
        }); 
    });
}

 function lintFile(file, callback) { 
    console.log("Linting " + file); //1 
    fs.readFile(file, function(err, data) { //2 
        if(err) { //3 
            console.log('Error: ' + err); 
            return; 
        } 
        if(jshint(data.toString())) { //4 
            console.log('File ' + file + ' has no errors.'); //5 
            console.log('-----------------------------------------'); 
            callback(false); //6 
        } else { 
            console.log('Errors in file ' + file); //7 
            var out = jshint.data(), //8 
            errors = out.errors; 
            for(var j = 0; j < errors.length; j++) { //9 
                console.log(errors[j].line + ':' + errors[j].character + ' -> ' + errors[j].reason + ' -> ' + errors[j].evidence); 
            } 
            console.log('-----------------------------------------');   
            callback(true); //10 
        } 
    }); 
} 