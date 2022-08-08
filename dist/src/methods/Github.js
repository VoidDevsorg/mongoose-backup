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
                documents.forEach(async (document, index) => {
                    const doc = await this.getDocument(document.name);
                    const i = setInterval(async () => {
                        const rateLimit = await octokit.request("GET /rate_limit");
                        const remaining = rateLimit.data.resources.core.remaining;
                        const limit = rateLimit.data.resources.core.limit;
                        const reset = rateLimit.data.resources.core.reset;
                        const used = limit - remaining;
                        const percent = Math.round((used / limit) * 100);
                        this.emit("rateLimit", {
                            remaining,
                            limit,
                            reset,
                            used,
                            percent
                        });
                    }, 60000);
                    const ii = setInterval(async () => {
                        const rateLimit = await octokit.request("GET /rate_limit");
                        const remaining = rateLimit.data.resources.core.remaining;
                        if (remaining > 0) {
                            const fileName = `${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}`;
                            const res = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                                owner: options.owner,
                                repo: options.repo,
                                path: `.backuper/${fileName}/${document.name}.json`,
                                message: `Backuped ${document.name}.json with ${doc?.length || 0} items.`,
                                content: Buffer.from(JSON.stringify(doc, null, 2)).toString("base64"),
                                committer: {
                                    name: "Mongoose Backup",
                                    email: "root@voiddevs.org"
                                }
                            });
                            if (index === documents.length - 1) {
                                clearInterval(i);
                                clearInterval(ii);
                                this.emit("githubBackup", {
                                    message: `Github Backup is done.`,
                                    location: this.location || "Europe/Istanbul",
                                    logger: this.logger || false,
                                    url: this.url || "Empty",
                                    time: new Date(),
                                    total: documents.length,
                                    items: doc.length
                                });
                            }
                        }
                    }, 1000);
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
