var fs = require('fs');


class Storage {
    configuration = {
        path: "./config.json",
        downloadPath: "./"
    }

    async constructor() {
        let result = await this.readData(this.configuration.path)
        if (result == null) {
            result = this.configuration;
            await this.saveData(this.configuration.path, result)
        }
    }

    async setPath(path){
        this.configuration.path = path;
        await this.saveData(this.configuration.path, this.configuration)
    }
    async setDownload(downloadPath){
        this.configuration.downloadPath = downloadPath;
        await this.saveData(this.configuration.path, this.configuration)
    }

    async readData(name = "./defaultConfig.json") {
        try {
            return JSON.parse(await fs.readFileSync(name));
        } catch (e) {
            console.error("Error reading file: " + name, e)
            return null;
        }
    }

    async saveData(name = "./defaultConfig.json", data = {}) {
        try {
            await fs.writeFileSync(name, JSON.stringify(data));
            return true;
        }catch (e){
            console.error("Error saving file: " + name,data, e)
            throw e;
        }
    }
}
