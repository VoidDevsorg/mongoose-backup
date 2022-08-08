# [mongoose-backup](https://npmjs.com/package/mongoose-backup)
[Do you need my help? Visit our Discord server.](https://voiddevs.org/discord)

![NPM Downloads](https://img.shields.io/npm/dm/mongoose-backup?style=for-the-badge)
![License](https://img.shields.io/npm/l/mongoose-backup?style=for-the-badge)
```bash
Node Version >= 16.16.0
```

### Installation
```bash
npm i mongoose-backup --save
# or
yarn add mongoose-backup
```

<br>

### Importing

```js
// CJS
const { MongooseBackup } = require("mongoose-backup");
const Backup = new MongooseBackup({
    url: "{mongodb_url}",
    location: "Europe/Istanbul" // optional, default: Europe/Istanbul
});

// ESM
import { MongooseBackup } from "mongoose-backup";
const Backup = new MongooseBackup({
    url: "{mongodb_url}",
    location: "Europe/Istanbul" // optional, default: Europe/Istanbul
});
```

<br>

# Events

| Name  |  Returns |
|---|---|
| connected  | Object: url, location |
| ping  | Object: message, url, location, time |
| backupError  | String |
| githubBackup | Object: time, total, items |
| localizeBackup | Object: time, total, items |

### Types
```js
url: String,
location: String,
time: Date,
total: Number, // Total Size of Documents.
items: Number // Total Size of Document items.
```

<br>


# Usage

### Backup with Localize
```js
// ESM
import { MongooseBackup } from "mongoose-backup";
const Backup = new MongooseBackup({
    url: "mongodb://localhost:27017"
});

Backup.on('connected', () => {
    Backup.Localize({
        per: 'minutes' // minutes, hours, daily, monthly, yearly
    });
});

Backup.on("localizeBackup", (data: IEvents) => {
    console.log(`Total ${data.total} documents with ${data.items} items backed up.`);
});
```

<br>

### Backup with Github
```js
// ESM
import { MongooseBackup } from "mongoose-backup";
const Backup = new MongooseBackup({
    url: "mongodb://localhost:27017"
});

Backup.on('connected', () => {
    Backup.Github({
        key: "ghp_XXXX",
        per: "daily",
        options: {
            owner: "clqu",
            repo: "empty-repo",
        }
    });
});

Backup.on("githubBackup", (data: IEvents) => {
    console.log(`Total ${data.total} documents with ${data.items} items backed up.`);
});
```

### Example File
```js
// ESM
import { MongooseBackup, IEvents } from "mongoose-backup";

const Backup = new MongooseBackup({
    url: "mongodb://localhost:27017/workspace",
    location: "Europe/Istanbul"
});

Backup.on("connected", (data: IEvents) => {
    console.log(`Connected to ${data.url}!`);
    // Backup.Github({
    //     key: "ghp_XXX",
    //     per: "minutes",
    //     options: {
    //         owner: "clqu",
    //         repo: "empty-repo",
    //     }
    // });

    Backup.Localize({
        per: "minutes"
    });
});

Backup.on("backupError", (message: string) => {
    console.log(message);
});

Backup.on("ping", (data: IEvents) => {
    console.log(`Mongoose Backup is alive. Location: ${data.location}, Logger: ${data.logger}, URL: ${data.url}, Time: ${data.time}`);
});

Backup.on("githubBackup", (data: IEvents) => {
    console.log(`[GitHub]: Total ${data.total} documents with ${data.items} items backed up.`);
});

Backup.on("localizeBackup", (data: IEvents) => {
    console.log(`[Localize]: Total ${data.total} documents with ${data.items} items backed up.`);
});
```

<br><br><br><br>

---
<h6 align="center">Developed with ❤️ by Void Development</h6>
