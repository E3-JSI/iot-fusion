const fs = require('fs');
const path = require('path');

/**
 * Removes the file.
 * @param {String} filename - Name of the file to be removed.
 */
exports.removeFile = function(filename) {
    // check if file exists
    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    } else {
        console.warn(`File does not exist: ${filename}`);
    }
};

/**
 * Removes the folder and it's content.
 * @param {String} sourcePath - The folder to be removed.
 */
exports.removeFolder = function (sourcePath) {
    let source = path.resolve(sourcePath);
    // ensure to clean up the database after the tests
    if (fs.existsSync(source)) {
        // get all file names in the directory and iterate through them
        let files = fs.readdirSync(source);
        for (let file of files) {
            let filename = path.join(source, file);
            let stat = fs.lstatSync(filename);
            // check if file is a directory
            if (stat.isDirectory()) {
                // recursively remove folder
                exports.removeFolder(filename);
            } else {
                exports.removeFile(filename);
            }
        }
        // remove the folder
        fs.rmdirSync(source);
    }
};

/**
 * Copies the folder source to folder destination.
 * @param {String} source - The source folder.
 * @param {String} destination - The destination folder.
 */
exports.copyFolder = function(source, destination) {
    // check if source exists
    if (!fs.existsSync(source)) {
        throw new Error(`ParamError: source not exists ${source}`);
    }
    // check if destination exists
    if (!fs.existsSync(destination)) {
        exports.createDirectoryPath(destination);
    }
    // get all file names in the directory and iterate through them
    let files = fs.readdirSync(source);
    for (let file of files) {
        let filename = path.join(source, file);
        let destinationfilename = path.join(destination, file);
        let stat = fs.lstatSync(filename);
        // check if file is a directory
        if (stat.isDirectory()) {
            // recursive check if it contains files
            exports.copyFolder(filename, destinationfilename);
        } else {
            let readFile = fs.createReadStream(filename);
            let writeFile = fs.createWriteStream(destinationfilename);
            readFile.pipe(writeFile);
        }
    }
};

/**
 * Creates a directory.
 * @param {String} dirPath - Directory path.
 */
exports.createFolder = function(dirPath) {
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
};

/**
 * Creates all directories in path.
 * @param {String} dirPath - Directory path.
 */
exports.createDirectoryPath = function(dirPath) {
    // resolve path
    let resolvedPath = path.resolve(dirPath);
    // split to get it's directories
    let directories = resolvedPath.split('\\');
    let currentDir = directories[0];
    // add and create directories in path
    for (let i = 1; i < directories.length; i++) {
        currentDir += `\\${directories[i]}`;
        exports.createFolder(currentDir);
    }
};