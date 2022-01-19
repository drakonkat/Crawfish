const fs = require('fs');


class ConfigStorage {
    configuration = {
        path: "./config.json",
        downloadPath: "./Downloads/"
    }

    constructor() {
        console.log("MI COSTRUISCO")
        let result = this.readData(this.configuration.path)
        if (result == null) {
            result = this.configuration;
            this.saveData(this.configuration.path, result)
        }
    }

    getConf() {
        return this.configuration;
    }

    setPath(path) {
        this.configuration.path = path;
        this.saveData(this.configuration.path, this.configuration)
    }

    setVariable(key,data) {
        this.configuration[key] = data;
        this.saveData(this.configuration.path, this.configuration)
    }
    getVariable(key) {
        return this.configuration[key];
    }
    getPath() {
        return this.configuration.path;
    }

    setDownload(downloadPath) {
        this.configuration.downloadPath = downloadPath;
        this.saveData(this.configuration.path, this.configuration)
    }

    getDownload() {
        return this.configuration.downloadPath;
    }

    readData(name = this.configuration.path) {
        try {
            return JSON.parse(fs.readFileSync(name));
        } catch (e) {
            console.error("Error reading file: " + name, e)
            return null;
        }
    }

    saveData(name = this.configuration.path, data = {}) {
        try {
            fs.writeFileSync(name, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Error saving file: " + name, data, e)
            throw e;
        }
    }
}

module.exports = ConfigStorage;
