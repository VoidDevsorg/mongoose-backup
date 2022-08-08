import { MongooseBackup, IEvents } from "../src/";

const Backup = new MongooseBackup({
    url: "mongodb://localhost:27017/vcodes",
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