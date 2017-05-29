var fs = require('fs');
var dircompare = require('dir-compare');
var console = require("simple-console-color");
var jsdiff = require('diff');

var options = {
    compareDate: false,
    dateTolerance: 1000,
    compareContent: true,
    skipSubdirs: false,
    skipSymlinks: false,
    ignoreCase: false,
    noDiffSet: false,
    fileDiferences: true
};
require('rc')('compare', options);
var format = require('util').format;

var path1 = options.path1;
var path2 = options.path2;



dircompare.compare(path1, path2, options).then(function(res){

    console.log('List of differences: ');

    res.diffSet.forEach(function (entry) {
        if (entry.state == 'equal' ||  (!options.fileDiferences && entry.state == 'distinct')) return;

        console.log('');
        var state = {
            'equal' : '==',
            'left' : '->',
            'right' : '<-',
            'distinct' : '<>'
        }[entry.state];
        var name1 = entry.name1 || '';
        var name2 = entry.name2 || '';

        var path1 = entry.path1 || '';
        var path2 = entry.path2 || '';

        var logText = format('%s(%s) %s %s(%s)', (path1 ? path1 + '/' : '') + name1, entry.type1, state, (path2 ? path2 + '/' : '') + name2, entry.type2);
 
        if (entry.state === 'distinct') {
            console.logYellow(logText);
            var file1Str = fs.readFileSync(path1 + '/' + name1).toString();
            var file2Str = fs.readFileSync(path2 + '/' + name2).toString();
            var diff = jsdiff.diffLines(file1Str, file2Str, {newlineIsToken:true});
            diff.forEach(function(part){
                if (part.removed)
                    console.logRed('     - '+part.value);
                if (part.added)
                    console.logGreen('     + '+part.value);
            });
        } else {
            console.logRed(logText);
        }

    });

    console.log('');
    console.log('');
    console.log('');
    console.logGreen('equal: ' + res.equal);
    if (options.fileDiferences)
        console.logYellow('distinct: ' + res.distinct);

    console.logRed('left: ' + res.left);
    console.logRed('right: ' + res.right);
    console.log('');

    console.logBlack(console.bg.red(' Total differences: ' + (options.fileDiferences? res.differences : res.differences - res.distinct) + ' '));

    /*
    console.log('');
    console.log('');
    console.log('');
    console.logWhite(console.bg.green('equal: ' + res.equal));
    console.logBlack(console.bg.yellow('distinct: ' + res.distinct));
    console.logBlack(console.bg.red('left: ' + res.left));
    console.logBlack(console.bg.red('right: ' + res.right));
    console.log('');
    console.logBlack(console.bg.red('Total differences: ' + res.differences));
    */

});

