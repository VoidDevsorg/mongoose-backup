"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodGithub = void 0;
const cron_1 = require("cron");
const core_1 = require("@octokit/core");
const config_json_1 = __importDefault(require("../config.json"));
async function MethodGithub({ key, per, options }) {
    if (per !== "minutes" && per !== "hours" && per !== "daily" && per !== "weekly" && per !== "monthly" && per !== "yearly")
        throw new Error("Period is not defined or not a string!");
    try {
        if (this.connected) {
            const documents = await this.getDocuments();
            const octokit = new core_1.Octokit({ auth: key });
            const job = new cron_1.CronJob(config_json_1.default.timesForCronJob[per], async () => {
                let backupValue = [];
                let maxBackupValue = documents.length;
                let totalItems = 0;
                documents.forEach(async (document, index) => {
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
                        const res = await backup();
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
        }
        else {
            this.emit("backupError", "You must connect to database first!");
        }
    }
    catch (err) {
        throw new Error(err);
    }
}
exports.MethodGithub = MethodGithub;
