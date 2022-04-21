![npm install](https://nodei.co/npm/mongoose-backup.png?mini=false)<br/>
[Do you need my help? Visit our Discord server.](https://voiddevs.org/discord)
<br /><br />

# Installation
```console
npm i mongoose-backup --save
yarn add mongoose-backup
```
<br /><br />

# Guide

```js
const MongoBackuper = require('mongoose-backup');
const backuper = new MongoDBackuper({
    url: 'MONGODB_URI',
    logger: false, // default: true
    cronLocation: 'Europe/Istanbul' // default: 'Europe/Istanbul'
});
```

> ### Backup with Local
```js
backuper.localizeBackup({
    output: './_backups/', 
    per: 'minutes'
});
```

> ### Backup with Github Commit
```js
backuper.githubBackup({
    apiKey: '{GITHUB_API_KEY}',
    output: './_backups/', 
    per: 'minutes',
    settings: {
        owner: '{owner}',
        repo: '{repository_name}'
    }
});
```

> ### Backup with Custom Function
```js
backuper.customFunction({
    per: 'minutes', 
    event: (collection, content) => {
        console.log(collection, content)
        /*
            partners
            [
                {
                    "_id": "6175972494483a042c0387ce",
                    "id": "153781113468",
                    "__v": 0
                },
            ]
        */
    }
});
```
<br />

# License
```
MIT License

Copyright (c) 2022 Void Development

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---
<h6 align="center">Developed with ❤️ by Void Development</h6>
