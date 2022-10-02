import { IGithub } from "../types/interfaces";
import { CronJob } from "cron";
import { Octokit } from "@octokit/core";
import config from "../config.json";

export async function MethodGithub(this: any, { key, per, options }: IGithub) {
    if (per !== "minutes" && per !== "hours" && per !== "daily" && per !== "weekly" && per !== "monthly" && per !== "yearly") throw new Error("Period is not defined or not a string!");
    try {
        if (this.connected) {
            const documents = await this.getDocuments();
            const octokit = new Octokit({ auth: key });

            const job = new CronJob(config.timesForCronJob[per], async () => {
                let backupValue: string[] = [];
                let maxBackupValue = documents.length;
                let totalItems = 0;
                documents.forEach(async (document: any, index: number) => {
                    const doc = await this.getDocument(document.name);

                    const fileName = `${new Date().toLocaleDateString()}-${new Date().getHours()}:${new Date().getMinutes()}`;
                    async function backup() {
                        return await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                            owner: options.owner,
                            repo: options.repo,
                            path: `.backuper/${fileName}/${document.name}.json`,
                            message: `Backuped ${document.name}.json with ${doc?.length || 0} items.`,
                            content: Buffer.from(JSON.stringify(doc, null, 2)).toString("base64"),
                            committer: {
                                name: "Mongoose Backup",
                                email: "root@voiddevs.org"
                            }
                        }).then(() => {
                            if (!backupValue.includes(document.name)) {
                                backupValue.push(document.name);
                                totalItems += doc?.length || 0;
                            }

                            return true;
                        }).catch(() => false);
                    }

                    while (true) {
                        const res: any = await backup();
                        if (res) {
                            if (backupValue.length === maxBackupValue) {
                                this.emit("githubBackup", {
                                    message: `Github Backup is done.`,
                                    location: this.location || "Europe/Istanbul",
                                    logger: this.logger || false,
                                    url: this.url || "Empty",
                                    time: new Date(),
                                    total: documents.length,
                                    items: totalItems || 0
                                });
                            }

                            break;
                        }
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