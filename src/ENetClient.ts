import http from 'request-promise-native'
import request_http from 'request'
import { inspect } from 'util'
import ENetDevice from './ENetDevice'
import ENetDeviceUID from './ENetDeviceUID'
import ENetLocation from './ENetLocation'
import ENetProjectUID from './ENetProjectUID'
import ENetProjectInformation from './ENetProjectInformation'
import Utils from './Utils'
import crypto from 'crypto'

var debug = false


/**
 * @description Direct interface for eNet protocol.
 */
class ENetClient {

  hostname: string;
  isid: string;

  /**
   * 
   * @param hostname Hostname
   * @param isid Session token
   */
  constructor(hostname: string, isid: string) {
    this.hostname = hostname;
    this.isid = isid;
  }

  /**
   * 
   * @param hostname 
   * @param command One of 'management', 'visualization', 'commissioning'
   */
  async request(command: string, method: string, options: RequestOptions, params: any = null): Promise<string | any> {
    const headers = {};
    if (options.auth) {
      headers['Cookie'] = `INSTASESSIONID=${this.isid}`;
    }
    const { response, body } = await new Promise(async (resolve, reject) => {
      request_http.post(`https://${this.hostname}/jsonrpc/${command}`, {
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
        resolve({ response, body })
      });
    });
    if (debug) console.log(inspect(body, true, null, true));
    if (options.response) {
      return { response, body };
    }
    return body;
  }


  async setRemember() {
    await http.get(`https://${this.hostname}/ibnclient.html?icp=${Utils.generateRandom(20)}`, {
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
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to get update status at this time.");
    }
  }


  async userLoginDigest(username: string, password: string, challenge: any) {
    var ncd = 1;
    var ha1 = crypto.createHash("sha1").update(`${username}:Insta-NetBox:${password}`).digest("hex");
    var ha1u = ha1.toUpperCase();
    var ha2 = crypto.createHash("sha1").update("POST:/jsonrpc//management").digest("hex");
    var ha2u = ha2.toUpperCase();
    var nc = ("00000000" + ncd).slice(-8);
    var cnonce = Utils.generateRandom(40);
    var ha3 = crypto.createHash("sha1").update(`${ha1u}:${challenge.nonce}:${nc}:${cnonce}:auth:${ha2u}`).digest("hex");
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
  async callInputDeviceFunction(fuid: string, powerstate: boolean) {
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
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to set the powerstate at this time.");
    }
  }


  /**
   * Fetches a function state of a device by UID.
   * 
   * @param fuid Function UID
   */
  async getCurrentValuesFromOutputDeviceFunction(fuid: string) {
    try {
      const response = await this.request("visualization", "getCurrentValuesFromOutputDeviceFunction", { auth: true, response: false }, { deviceFunctionUID: fuid });
      const { result, error } = response;
      if (typeof result === "object") {
        return result.currentValues;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to set the powerstate at this time.");
    }
  }


  /**
   * Fetches all locations.
   */
  async getLocations(): Promise<ENetLocation[]> {
    try {
      const response = await this.request("visualization", "getLocations", { auth: true, response: false }, { locationUIDs: [] })
      const { result, error } = response;
      if (typeof result === "object") {
        return result.locations;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Fetches all devices.
   */
  async getDeviceUIDs(): Promise<ENetDeviceUID[]> {
    try {
      const response = await this.request("visualization", "getDeviceUIDs", { auth: true, response: false }, null);
      const { result, error } = response;
      if (typeof result === "object") {
        return result.deviceUIDs;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Fetches all devices.
   */
  async getDevices(deviceUIDs: string[] = null): Promise<ENetDevice[]> {
    try {
      const response = await this.request("visualization", "getDevices", { auth: true, response: false }, { deviceUIDs });
      const { result, error } = response;
      if (typeof result === "object") {
        return result.devices;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Fetches all devices.
   */
  async getDevicesWithParameterFilter(deviceUIDs: string[] = []): Promise<ENetDevice[]> {
    try {
      const response = await this.request("visualization", "getDevicesWithParameterFilter", { auth: true, response: false }, {
        deviceUIDs,
        filter: ".+\\.(SCV1|SCV2|SNA|PSN)\\[(.|1.|2.|3.)\\]+"
      });
      const { result, error } = response;
      if (typeof result === "object") {
        return ENetDevice.fromJSON(result.devices);
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Fetches projects
   */
  async getProjectUIDs(): Promise<ENetProjectUID[]> {
    try {
      const response = await this.request("commissioning", "getProjectUIDs", { auth: true, response: false }, null);
      const { result, error } = response;
      if (typeof result === "object") {
        return result.projectUIDs;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Fetches project information
   * 
   * @param projectUID Project ID
   */
   async getProjectInformation(projectUID: string): Promise<ENetProjectInformation> {
    try {
      const response = await this.request("visualization", "getProjectInformation", { auth: true, response: false }, { projectUID });
      const { result, error } = response;
      if (typeof result === "object") {
        return result;
      }
      throw new Error(error.message || "failure");
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to fetch devices at this time!");
    }
  }


  /**
   * Restarts the eNet server.
   */
  async restartBox(): Promise<void> {
    try {
      const { result, error } = await this.request("management", "restartBox", { auth: true, response: false }, { restartSystem: true });
      if (error) {
        throw new Error(error.message || "failure");
      }
    } catch (error) {
      if (debug) console.log(error);
      throw new Error("Unable to restart server at this time!");
    }
  }

}

class RequestOptions {
  auth: boolean
  response: boolean
}


export default ENetClient