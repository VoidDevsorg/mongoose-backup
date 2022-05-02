const mongoose = require('mongoose');
const fs = require('fs');
const { CronJob } = require('cron');
const { Octokit } = require("@octokit/core");

let times = {
    'month': '0 0 1 * *',
    'day': '0 1 * * *',
    'year': '0 0 1 1 *',
    'week': '0 0 * * 0',
    'hours': '0 * * * *',
    'minutes': '* * * * *'
};
let _logger = true;
let _cronLocation =  'Europe/Istanbul';
module.exports = class MongoDBackuper {
    
    constructor({ url, logger = true, cronLocation = 'Europe/Istanbul' }) {
        if (!url)
            throw new Error('(mongoose-backup): MongoDB URL is required.');
        if (![true, false].includes(logger))
            throw new Error('(mongoose-backup): Logger value is incorrect (type: Boolean).');
        
        _logger = logger;
        _cronLocation = cronLocation;

        console.log(`(mongoose-backup): Logger Status: ${logger}`)
        mongoose.connect(url).then(() => {
            console.log('(mongoose-backup): Successfully connected to the database.')
        }).catch(err => {
            throw new Error(`(mongoose-backup): An error occurred while connecting.\n- ${err.message}\n\n`);
        });

        return this;
    }

    localizeBackup({ output, per }) {
        if (!output)
            throw new Error(`(mongoose-backup): output is required.`);
        if (!per)
            throw new Error(`(mongoose-backup): per is required.`);
        try {
            fs.mkdirSync(`./${output.split('/').join('').split('.').join('')}/`);
        } catch { };
        if (!Object.keys(times).includes(per))
            throw new Error(`(mongoose-backup): The backup time must be one of the month, day, hours, minutes, year parameters.`);
        mongoose.connection.on('open', function (ref) {
            new CronJob(times[per], async function () {
                const now = new Date();
                const day = `${now.getDate()}`.padStart(2, '0');
                const month = `${now.getMonth()}`.padStart(2, '0');
                const year = now.getFullYear();
                const hours = `${now.getHours()}`.padStart(2, '0');
                const minutes = `${now.getMinutes()}`.padStart(2, '0');
                const $Date = `Backup-${day}-${month}-${year}-${hours}-${minutes}`
                fs.mkdirSync(`${output.endsWith('/') ? output : output + '/'}${$Date}`);
                mongoose.connection.db.listCollections().toArray(function (err, names) {
                    names.forEach(collection => {
                        getDocuments(mongoose.connection.db, collection.name, function (docs) {
                            try {
                                fs.writeFileSync(`${output.endsWith('/') ? output : output + '/'}${$Date}/${collection.name}.json`, JSON.stringify(docs, null, 2));
                            }
                            catch (err) {
                                throw new Error(`(mongoose-backup): ${err.message}`);;
                            }
                        });
                    })
                    if (_logger) {
                        console.log(`${new Date()}: (mongoose-backup-[Localize]): A total of ${names.length} collections were backed up. (${output.endsWith('/') ? outputDir : output + '/'}${$Date})`);
                    }
                });
            }, null, true, _cronLocation);
        })
    }

    githubBackup({ apiKey, output, per, settings }) {
        if (!apiKey)
            throw new Error(`(mongoose-backup): apiKey is required.`);
        if (!settings)
            throw new Error(`(mongoose-backup): settings is required.`);
        if (!settings.owner)
            throw new Error(`(mongoose-backup): settings.owner is required.`);
        if (!settings.repo)
            throw new Error(`(mongoose-backup): settings.repo is required.`);
        if (!output)
            throw new Error(`(mongoose-backup): output is required.`);
        if (!per)
            throw new Error(`(mongoose-backup): per is required.`);
        if (!Object.keys(times).includes(per))
            throw new Error(`(mongoose-backup): The backup time must be one of the month, day, hours, minutes, year parameters.`);
        mongoose.connection.on('open', function (ref) {
            new CronJob(times[per], async function () {
                const now = new Date();
                const day = `${now.getDate()}`.padStart(2, '0');
                const month = `${now.getMonth()}`.padStart(2, '0');
                const year = now.getFullYear();
                const hours = `${now.getHours()}`.padStart(2, '0');
                const minutes = `${now.getMinutes()}`.padStart(2, '0');
                const $Date = `Backup-${day}-${month}-${year}-${hours}-${minutes}`
                mongoose.connection.db.listCollections().toArray(function (err, names) {
                    names.forEach((collection, index) => {
                        getDocuments(mongoose.connection.db, collection.name, function (docs) {
                            try {
                                const octokit = new Octokit({ auth: apiKey });
                                let path = `${output.split('/').join('').split('.').join('') + '/'}${$Date}/${collection.name}.json`;
                                setTimeout(async () => {
                                    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                                        owner: settings?.owner,
                                        repo: settings?.repo,
                                        path: path,
                                        message: $Date,
                                        committer: {
                                            name: 'Mongoose Backup',
                                            email: 'root@voiddevs.org'
                                        },
                                        content: Buffer.from(JSON.stringify(docs, null, 2)).toString('base64')
                                    }).then((res) => {
                                        if (res) {
                                            if (_logger) {
                                                console.log(`${new Date()}: (mongoose-backup-[github.com/${settings?.owner}/${settings?.repo}]): ${collection.name}.json backed up.`)
                                            }
                                        }
                                    })
                                }, 2000 * index);
                            }
                            catch (err) {
                                throw new Error(`(mongoose-backup): ${collection.name}.json - ${err.message}`);;
                            }
                        });
                    })
                });
            }, null, true, _cronLocation);
        })
    }
    customFunction({ per, event }) {
        if (!event)
            throw new Error(`(mongoose-backup): event is required.`);
        if (!per)
            throw new Error(`(mongoose-backup): per is required.`);
        if (!Object.keys(times).includes(per))
            throw new Error(`(mongoose-backup): The backup time must be one of the month, day, hours, minutes, year parameters.`);
        mongoose.connection.on('open', function (ref) {
            new CronJob(times[per], async function () {
                mongoose.connection.db.listCollections().toArray(function (err, names) {
                    names.forEach(collection => {
                        getDocuments(mongoose.connection.db, collection.name, function (docs) {
                            try {
                                event(collection.name, JSON.stringify(docs, null, 2))
                            }
                            catch (err) {
                                throw new Error(`(mongoose-backup): ${err.message}`);;
                            }
                        });
                    })
                });
            }, null, true, _cronLocation);
        })
    }
}

const getDocuments = function (db, collectionName, callback) {
    const query = {};
    db.collection(collectionName)
        .find(query)
        .toArray(function (err, result) {
            if (err) throw new Error(`(mongoose-backup): ${err.message}`);;
            callback(result);
        });
};
