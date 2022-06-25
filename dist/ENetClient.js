"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const request_1 = __importDefault(require("request"));
const util_1 = require("util");
const ENetDevice_1 = __importDefault(require("./ENetDevice"));
const Utils_1 = __importDefault(require("./Utils"));
const crypto_1 = __importDefault(require("crypto"));
var debug = false;
/**
 * @description Direct interface for eNet protocol.
 */
class ENetClient {
    /**
     *
     * @param hostname Hostname
     * @param isid Session token
     */
    constructor(hostname, isid) {
        this.hostname = hostname;
        this.isid = isid;
    }
    /**
     *
     * @param hostname
     * @param command One of 'management', 'visualization', 'commissioning'
     */
    async request(command, method, options, params = null) {
        const headers = {};
        if (options.auth) {
            headers['Cookie'] = `INSTASESSIONID=${this.isid}`;
        }
        const { response, body } = await new Promise(async (resolve, reject) => {
            request_1.default.post(`https://${this.hostname}/jsonrpc/${command}`, {
                strictSSL: false, headers, json: {
                    jsonrpc: "2.0",
                    method,
                    params
                }
            }, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ response, body });
            });
        });
        if (debug)
            console.log((0, util_1.inspect)(body, true, null, true));
        if (options.response) {
            return { response, body };
        }
        return body;
    }
    async setRemember() {
        await request_promise_native_1.default.get(`https://${this.hostname}/ibnclient.html?icp=${Utils_1.default.generateRandom(20)}`, {
            strictSSL: false,
            headers: { Cookie: `uEhaA=true; pbAudioFalg=ON; VideoFormatAVN=ActiveX; INSTASESSIONID=${this.isid}; downloadFinished=true; rememberMe=true` }
        });
    }
    /**
     * Checks if an update is available.
     *
     * @returns
     */
    async isBoxUpdateAvailable() {
        try {
            const response = await this.request("management", "isBoxUpdateAvailable", { auth: true, response: false }, { queryServer: false });
            const { result, error } = response;
            if (typeof result === "object") {
                return result;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to get update status at this time.");
        }
    }
    async userLoginDigest(username, password, challenge) {
        var ncd = 1;
        var ha1 = crypto_1.default.createHash("sha1").update(`${username}:Insta-NetBox:${password}`).digest("hex");
        var ha1u = ha1.toUpperCase();
        var ha2 = crypto_1.default.createHash("sha1").update("POST:/jsonrpc//management").digest("hex");
        var ha2u = ha2.toUpperCase();
        var nc = ("00000000" + ncd).slice(-8);
        var cnonce = Utils_1.default.generateRandom(40);
        var ha3 = crypto_1.default.createHash("sha1").update(`${ha1u}:${challenge.nonce}:${nc}:${cnonce}:auth:${ha2u}`).digest("hex");
        var response = ha3.toUpperCase();
        var authRequestParams = { username: username, realm: challenge.realm, nonce: challenge.nonce, uri: challenge.uri, qop: challenge.qop, opaque: challenge.opaque, response: response, nc: nc, cnonce: cnonce };
        const payload = {
            userName: username,
            uri: "/jsonrpc//management",
            qop: "auth",
            cnonce: authRequestParams.cnonce,
            nc: authRequestParams.nc,
            response: response,
            realm: "Insta-NetBox",
            nonce: authRequestParams.nonce,
            algorithm: "sha",
            opaque: authRequestParams.opaque
        };
        return await this.request('management', 'userLoginDigest', { auth: true, response: false }, payload);
    }
    /**
     * Calls a device function by UID.
     *
     * @param fuid
     * @param powerstate
     */
    async callInputDeviceFunction(fuid, powerstate) {
        try {
            const response = await this.request("visualization", "callInputDeviceFunction", { auth: true, response: false }, {
                deviceFunctionUID: fuid,
                values: [
                    {
                        valueTypeID: "VT_SWITCH",
                        value: powerstate
                    }
                ]
            });
            const { result, error } = response;
            if (typeof result === "object") {
                return;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to set the powerstate at this time.");
        }
    }
    /**
     * Fetches a function state of a device by UID.
     *
     * @param fuid Function UID
     */
    async getCurrentValuesFromOutputDeviceFunction(fuid) {
        try {
            const response = await this.request("visualization", "getCurrentValuesFromOutputDeviceFunction", { auth: true, response: false }, { deviceFunctionUID: fuid });
            const { result, error } = response;
            if (typeof result === "object") {
                return result.currentValues;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to set the powerstate at this time.");
        }
    }
    /**
     * Fetches all locations.
     */
    async getLocations() {
        try {
            const response = await this.request("visualization", "getLocations", { auth: true, response: false }, { locationUIDs: [] });
            const { result, error } = response;
            if (typeof result === "object") {
                return result.locations;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Fetches all devices.
     */
    async getDeviceUIDs() {
        try {
            const response = await this.request("visualization", "getDeviceUIDs", { auth: true, response: false }, null);
            const { result, error } = response;
            if (typeof result === "object") {
                return result.deviceUIDs;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Fetches all devices.
     */
    async getDevices(deviceUIDs = null) {
        try {
            const response = await this.request("visualization", "getDevices", { auth: true, response: false }, { deviceUIDs });
            const { result, error } = response;
            if (typeof result === "object") {
                return result.devices;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Fetches all devices.
     */
    async getDevicesWithParameterFilter(deviceUIDs = []) {
        try {
            const response = await this.request("visualization", "getDevicesWithParameterFilter", { auth: true, response: false }, {
                deviceUIDs,
                filter: ".+\\.(SCV1|SCV2|SNA|PSN)\\[(.|1.|2.|3.)\\]+"
            });
            const { result, error } = response;
            if (typeof result === "object") {
                return ENetDevice_1.default.fromJSON(result.devices);
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Fetches projects
     */
    async getProjectUIDs() {
        try {
            const response = await this.request("commissioning", "getProjectUIDs", { auth: true, response: false }, null);
            const { result, error } = response;
            if (typeof result === "object") {
                return result.projectUIDs;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Fetches project information
     *
     * @param projectUID Project ID
     */
    async getProjectInformation(projectUID) {
        try {
            const response = await this.request("visualization", "getProjectInformation", { auth: true, response: false }, { projectUID });
            const { result, error } = response;
            if (typeof result === "object") {
                return result;
            }
            throw new Error(error.message || "failure");
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to fetch devices at this time!");
        }
    }
    /**
     * Restarts the eNet server.
     */
    async restartBox() {
        try {
            const { result, error } = await this.request("management", "restartBox", { auth: true, response: false }, { restartSystem: true });
            if (error) {
                throw new Error(error.message || "failure");
            }
        }
        catch (error) {
            if (debug)
                console.log(error);
            throw new Error("Unable to restart server at this time!");
        }
    }
}
class RequestOptions {
}
exports.default = ENetClient;
