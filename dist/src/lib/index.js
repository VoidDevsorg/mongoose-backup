"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backuper = void 0;
const Github_1 = require("../methods/Github");
const Localize_1 = require("../methods/Localize");
const events_1 = require("events");
const mongoose_1 = __importDefault(require("mongoose"));
class Backuper extends events_1.EventEmitter {
    connected;
    url;
    logger;
    location;
    getDocuments;
    getDocument;
    constructor({ url, location = "Europe/Istanbul" }) {
        super();
        if (!url || typeof url !== "string")
            throw new Error("URL is not defined or not a string!");
        if (location && typeof location !== "string")
            throw new Error("Location is not a string!");
        if (!url || typeof url !== "string" || location && typeof location !== "string")
            return;
        this.connected = false;
        this.url = url;
        this.location = location;
        mongoose_1.default.connect(url).catch((err) => {
            throw new Error(err);
        });
        mongoose_1.default.connection.on("error", (err) => {
            this.connected = false;
            throw new Error(err);
        });
        mongoose_1.default.connection.on("connected", () => {
            this.emit('connected', { url, location });
            setInterval(() => {
                this.emit("ping", {
                    message: "Mongoose Backup is alive.",
                    location: this.location || "Europe/Istanbul",
                    logger: this.logger || false,
                    url: this.url || "Empty",
                    time: new Date()
                });
            }, 60000);
        });
        this.on('connected', () => { this.connected = true; });
        this.getDocuments = () => {
            return mongoose_1.default.connection.db.listCollections().toArray();
        };
        this.getDocument = (name) => {
            return mongoose_1.default.connection.db.collection(name).find().toArray();
        };
        return this;
    }
    async Github({ key, per, options }) {
        if (!key || typeof key !== "string")
            throw new Error("Key is not defined or not a string!");
        if (!per || typeof per !== "string")
            throw new Error("Period is not defined or not a string!");
        if (!options || typeof options !== "object")
            throw new Error("Options is not defined or not an object!");
        if (!key || typeof key !== "string" || !per || typeof per !== "string" || !options || typeof options !== "object")
            return;
        return Github_1.MethodGithub.call(this, { key, per, options });
    }
    async Localize({ per }) {
        if (!per || typeof per !== "string")
            throw new Error("Period is not defined or not a string!");
        if (!per || typeof per !== "string")
            return;
        return Localize_1.MethodLocalize.call(this, { per });
    }
}
exports.Backuper = Backuper;
