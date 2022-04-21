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

---
<h6 align="center">Developed with ❤️ by Void Development</h6>
