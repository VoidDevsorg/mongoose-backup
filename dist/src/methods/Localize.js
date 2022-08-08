"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodLocalize = void 0;
const cron_1 = require("cron");
const fs_1 = __importDefault(require("fs"));
const config_json_1 = __importDefault(require("../config.json"));
async function MethodLocalize({ per }) {
    if (per !== "minutes" && per !== "hours" && per !== "daily" && per !== "weekly" && per !== "monthly" && per !== "yearly")
        throw new Error("Period is not defined or not a string!");
    try {
        if (this.connected) {
            const documents = await this.getDocuments();
            const job = new cron_1.CronJob(config_json_1.default.timesForCronJob[per], async () => {
                documents.forEach(async (document, index) => {
                    const doc = await this.getDocument(document.name);
                    const fileName = `${new Date().toLocaleDateString().replace(/\//g, "-")}-${new Date().toLocaleTimeString().replace(/:/g, "-")}`;
                    if (!fs_1.default.existsSync(`./.backuper`)) {
                        fs_1.default.mkdirSync(`./.backuper`);
                    }
                    if (!fs_1.default.existsSync(`./.backuper/${fileName}`)) {
                        fs_1.default.mkdirSync(`./.backuper/${fileName}`);
                    }
                    fs_1.default.writeFileSync(`./.backuper/${fileName}/${document.name}.json`, JSON.stringify(doc, null, 4));
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
        }
        else {
            this.emit("backupError", "You must connect to database first!");
        }
    }
    catch (err) {
        throw new Error(err);
    }
}
exports.MethodLocalize = MethodLocalize;
