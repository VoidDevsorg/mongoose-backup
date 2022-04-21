const MongoDBackuper = require('../src/index');
const backuper = new MongoDBackuper({
    url: process.env.MongoDBURL,
    logger: false, // default = true
    cronLocation: 'Europe/Istanbul' // default = 'Europe/Istanbul'
});


backuper.localizeBackup({
    output: './_backups/', 
    per: 'minutes'
});


backuper.githubBackup({
    apiKey: process.env.GithubApiKey,
    output: './_backups/', 
    per: 'minutes',
    settings: {
        owner: 'VoidDevsOrg',
        repo: 'myDatabase'
    }
});



backuper.customFunction({
    per: 'minutes', 
    event: (collection, content) => {
        console.log(collection, content)
        /*
            ------------------
                # Output #
            ------------------
            partners    
            [
                {
                    "_id": "613e17744e71bd057ef62038",
                    "id": "129189362375",
                    "__v": 0
                }
            ]


        */
    }
});
