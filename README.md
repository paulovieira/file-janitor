# file-janitor

Keep the public directory of your front-end assets clean (to be used after webpack or similar tools).

## Usage example:

```js
const FileJanitor = require('file-janitor');

FileJanitor.clean({
    source: ['/path1/*.js', '/path2/*.css'],  // string patterns for glob 
    destination: '/public',   // must be a directory, will be created if it doesn't exists
    separator: '-',  // default is '.',
    deleteOld: true  // default is false
});
```

The `clean` method will copy all files that match the patterns given in the `source` option to the directory given in `destination`. 

The source files are expected have have a name with a hash, like `app.53e25327dcbe3560d7b6.js` (or `app-53e25327dcbe3560d7b6.js`, if the separator is '-' instead of '.'). This is the usual format of the chunks produced by webpack and related tools. If `deleteOld` is true, all files in the destination directory with the same prefix will be deleted (except files matched by `source`).

If `destination` already has a file with the same name, it will remain untouched.

## Concrete example

Suppose webpack was executed and we now have a bunch of new files:
```
/path1/app.123.js
/path1/lib.456.js
/path2/app.789.css
```

The destination directory looks like this:
```
/public/app.321.js
/public/lib.456.js
/public/app.987.css
```

After calling
```js
FileJanitor.clean({
    source: ['/path1/*.js', '/path2/*.css'],
    destination: '/public', 
    deleteOld: true
});
```
the new files will be copied to the destination directory and the old files will be deleted. That is:
- `/path1/app.123.js` will be copied to `/public`
- `/public/app.321.js` will be deleted
- `/path1/lib.456.js` will NOT be copied to `/public`
- `/public/lib.456.js` will remain untouched
- `/path1/app.789.css` will be copied to `/public`
- `/public/app.987.css` will be deleted

That is, the destination directory will be:
```
/public/app.123.js    <-- new file
/public/lib.456.js    <-- same file, was not touched
/public/app.789.css   <-- new file
```

**IMPORTANT NOTE:** we assume files are 'new' and 'old' only by taking into account that they have the same prefix and different hashes (as well as being in different directories).
