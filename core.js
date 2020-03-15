class Sandbox {
    constructor(core) {
        this.core = core;
        this.evts = {}; 
    }

    listen(evts, handler) {
        if (Array.isArray(evts)) {
            for(const evt of evts) {
                this.evts[evt] = handler;
            }
        }
    }

    removeListener(evt) {
        if (this.evts.hasOwnProperty(evt)) {
            delete this.evts[evt];
        }
    }

    handle(message) {
        if (this.evts.hasOwnProperty(message.type)) {
            const handler = this.evts[message.type];
            if (typeof handler === "function") {
                handler(message);
            }
        }
    }

    notifyAll(message) {
        this.core.notifyAll(message);
    }

    destroy() {
        this.core.destroy(this);
    }
}

class Core {
    static moduleData = {};

    static destroy(sandbox) {
        for (const moduleId in this.moduleData) {
            if (this.moduleData[moduleId].instance.sandbox === sandbox) {
                console.log(`found it ${moduleKey}`)
                return;
            }
        }
    }

    static register(moduleId, creator) {
        this.moduleData[moduleId] = {
            creator: creator,
            instance: null,
            sandbox: null
        };
    }

    static start(moduleId) {
        if (this.moduleData.hasOwnProperty(moduleId)) {
            const sandbox = new Sandbox(this);
            this.moduleData[moduleId].instance = this.moduleData[moduleId].creator(sandbox);
            this.moduleData[moduleId].instance.init();
            this.moduleData[moduleId].sandbox = sandbox;
            console.log(`module: ${moduleId} initialized`);
        }
    }

    static stop(moduleId){
        if (this.moduleData.hasOwnProperty(moduleId)) {
            const data = this.moduleData[moduleId];
            if (data.instance) {
                data.instance.destroy();
                data.instance = null;
                data.sandbox = null;
                console.log(`module: ${moduleId} destroyed`);
            }
        }
    }

    static notify(moduleId, message) {
        if (this.moduleData.hasOwnProperty(moduleId)) {
            const data = this.moduleData[moduleId];
            if (data.sandbox) {
                data.sandbox.handle(message);
            }
        }
    }

    static startAll() {
        for (const moduleId in this.moduleData) {
            this.start(moduleId);
        }
    }

    static stopAll() {
        for (const moduleId in this.moduleData) {
            this.stop(moduleId);
        }
    }

    static notifyAll(message) {
        for (const moduleId in this.moduleData) {
            this.notify(moduleId, message);
        }
    }
}