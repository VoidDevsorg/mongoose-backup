import { MethodGithub } from "../methods/Github";
import { MethodLocalize } from "../methods/Localize";
import { EventEmitter } from "events";
import { IConstructor, IGithub, ILocalize } from "src/types/interfaces";
import mongoose from "mongoose";

export class Backuper extends EventEmitter {
    connected: boolean;
    url: string;
    logger: boolean;
    location: string;
    getDocuments: Function;
    getDocument: Function;

    constructor({ url, location = "Europe/Istanbul" }: IConstructor) {
        super();

        if (!url || typeof url !== "string") throw new Error("URL is not defined or not a string!");
        if (location && typeof location !== "string") throw new Error("Location is not a string!");
        if (!url || typeof url !== "string" || location && typeof location !== "string") return;

        this.connected = false;
        this.url = url;
        this.location = location;

        mongoose.connect(url).catch((err) => {
            throw new Error(err);
        });

        mongoose.connection.on("error", (err) => {
            this.connected = false;
            throw new Error(err);
        });

        mongoose.connection.on("connected", () => {
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
        })

        this.on('connected', () => { this.connected = true; });

        this.getDocuments = () => {
            return mongoose.connection.db.listCollections().toArray();
        }
        this.getDocument = (name: string) => {
            return mongoose.connection.db.collection(name).find().toArray();
        }
        return this;
    }

    async Github({ key, per, options }: IGithub) {
        if (!key || typeof key !== "string") throw new Error("Key is not defined or not a string!");
        if (!per || typeof per !== "string") throw new Error("Period is not defined or not a string!");
        if (!options || typeof options !== "object") throw new Error("Options is not defined or not an object!");
        if (!key || typeof key !== "string" || !per || typeof per !== "string" || !options || typeof options !== "object") return;

        return MethodGithub.call(this, { key, per, options });
    }

    async Localize({ per }: ILocalize) {
        if (!per || typeof per !== "string") throw new Error("Period is not defined or not a string!");
        if (!per || typeof per !== "string") return;

        return MethodLocalize.call(this, { per });
    }
}