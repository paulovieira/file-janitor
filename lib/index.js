'use strict';

const Path = require('path');
const Fs = require('fs-extra');
const Glob = require('glob');

module.exports.clean = function(options){

    if (!options.source || !options.destination){
        throw new Error('Options must have paths for "source" and "destination"');
    }

    options.separator = options.separator || '.';
    options.deleteOld = !!options.deleteOld;

    // cautiousMode is always on, unless it has been explicitely turned off
    if (options.cautiousMode !== false){
        options.cautiousMode = true;
    }

    // will throw an error if there exists a regular file with the path given in options.destination
    Fs.ensureDirSync(Path.resolve(options.destination));

    if (typeof options.source === 'string'){
        options.source = [options.source];
    }

    let paths = [];
    options.source.forEach(function (s){

        if (typeof s !== 'string'){
            throw new Error('pattern in "source" must be a string (or an array of strings)');
        }

        paths = paths.concat(Glob.sync(s));
    });

    paths = paths.map(function (s){

        return Path.resolve(s);
    });

    // remove entries that are not regular files
    paths = paths.filter(function (s){

        return Fs.statSync(s).isFile();
    });

    if (paths.length === 0){
        console.log('warning: no source files');
        return;
    }

    paths.forEach(function(sourceFile){

        const parse = Path.parse(sourceFile);

        if(parse.dir === options.destination){
            throw new Error("Source files cannot be in the same directory as the destination: " + sourceFile);
        }

        const sourceBasename = parse.base;
        const sourceName = parse.name;

        const parts = sourceName.split(options.separator);
        if (parts.length <= 1){
            throw new Error('Source file should have at least one occurrence of the separator.');
        }

        const prefix = parts[0];
        const similarFiles = Glob.sync(Path.join(options.destination, prefix + '*'));

        let sameName = false;
        if (similarFiles.length > 0){

            // the destination directory has files with the same prefix; 

            // check if destination has a file with the same name; if so it will be kept intact;

            for (let i = 0; i < similarFiles.length; i++){
                if (Path.parse(similarFiles[i]).base === sourceBasename){
                    sameName = true;
                    similarFiles.splice(i, 1);
                    break;
                }
            }

            if (options.deleteOld){
                if (options.cautiousMode && similarFiles.length > 10){
                    throw new Error('Destination directory has more than 10 files with the given prefix. To delete them all use "cautiousMode" with false');
                }

                similarFiles.forEach(function (path){

                    Fs.removeSync(path);
                });
            }
        }

        // if the destination directory doesn't have a file with the same name as the source file, copy
        if (sameName === false){
            Fs.copySync(sourceFile, Path.join(options.destination, sourceBasename), { preserveTimestamps: true });
        }
    });
};
