import { ILocalize } from "../types/interfaces";
import { CronJob } from "cron";
import fs from "fs";
import config from "../config.json";

export async function MethodLocalize(this: any, { per }: ILocalize) {
    if (per !== "minutes" && per !== "hours" && per !== "daily" && per !== "weekly" && per !== "monthly" && per !== "yearly") throw new Error("Period is not defined or not a string!");
    try {
        if (this.connected) {
            const documents = await this.getDocuments();
            const job = new CronJob(config.timesForCronJob[per], async () => {
                documents.forEach(async (document: any, index: number) => {
                    const doc = await this.getDocument(document.name);
                    const fileName = `${new Date().toLocaleDateString().replace(/\//g, "-")}-${new Date().toLocaleTimeString().replace(/:/g, "-")}`;

                    if (!fs.existsSync(`./.backuper`)) {
                        fs.mkdirSync(`./.backuper`);
                    }
                    
                    if (!fs.existsSync(`./.backuper/${fileName}`)) {
                        fs.mkdirSync(`./.backuper/${fileName}`);
                    }

                    fs.writeFileSync(`./.backuper/${fileName}/${document.name}.json`, JSON.stringify(doc, null, 4));

                    if (index === documents.length - 1) {
                        this.emit("localizeBackup", {
                            message: `Localize Backup is done.`,
                            location: this.location || "Europe/Istanbul",
                            logger: this.logger || false,
                            time: new Date(),
                            total: documents.length,
                            items: doc.length
                        });
                    }
                });

            }, null, true, this.location);

            job.start();
        } else {
            this.emit("backupError", "You must connect to database first!");
        }
    } catch (err) {
        throw new Error(err);
    }
}