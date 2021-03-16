const http = require("request-promise-native");
const util = require("util");

debug = false


module.exports = class ENetClient {



  /**
   * Checks if an update is available.
   * 
   * @param {String} hostname 
   * @param {String} isid 
   * @returns 
   */
  isBoxUpdateAvailable(hostname, isid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/management`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "isBoxUpdateAvailable",
            params: {
              queryServer: false
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result);
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to get update status at this time."));
      }
    });
  }



  /**
   * Calls a device function by UID.
   * 
   * @param {String} hostname 
   * @param {String} isid 
   * @param {String} fuid 
   * @param {Boolean} powerstate 
   * @returns {Promise}
   */
  callInputDeviceFunction(hostname, isid, fuid, powerstate) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "callInputDeviceFunction",
            params: {
              deviceFunctionUID: fuid,
              values: [
                {
                  valueTypeID: "VT_SWITCH",
                  value: powerstate
                }
              ]
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve();
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to set the powerstate at this time."));
      }
    });
  }



  /**
   * Fetches a function state of a device by UID.
   * 
   * @param {String} hostname Hostname
   * @param {String} isid Session token
   * @param {String} fuid Function UID
   * @returns {Promise}
   */
  getCurrentValuesFromOutputDeviceFunction(hostname, isid, fuid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getCurrentValuesFromOutputDeviceFunction",
            params: {
              deviceFunctionUID: fuid
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result.currentValues);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to set the powerstate at this time."));
      }
    });
  }



  /**
   * Fetches all locations.
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @returns {Promise<Object>}
   */
  getLocations(hostname, isid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getLocations",
            params: {
              locationUIDs: []
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result.locations);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to fetch devices at this time!"));
      }
    });
  }



  /**
   * Fetches all devices.
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @returns {Promise<Object>}
   */
  getDevicesWithParameterFilter(hostname, isid, deviceUIDs) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getDevicesWithParameterFilter",
            params: {
              deviceUIDs,
              filter: ".+\\.(SCV1|SCV2|SNA|PSN)\\[(.|1.|2.|3.)\\]+"
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result.devices);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to fetch devices at this time!"));
      }
    });
  }



  /**
   * Fetches all devices.
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @returns {Promise<Object>}
   */
  getDeviceUIDs(hostname, isid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getDeviceUIDs"
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result.deviceUIDs);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to fetch devices at this time!"));
      }
    });
  }



  /**
   * Fetches projects
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @returns {Promise<Object>}
   */
  getProjectUIDs(hostname, isid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/commissioning`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getProjectUIDs"
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result.projectUIDs);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to fetch devices at this time!"));
      }
    });
  }



  /**
   * Fetches project information
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @param {String} projectUID Project ID
   * @returns {Promise<Object>}
   */
  getProjectInformation(hostname, isid, projectUID) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/visualization`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: "getProjectInformation",
            params: { projectUID }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to fetch devices at this time!"));
      }
    });
  }



  /**
   * Restarts the eNet server.
   * 
   * @param {String} hostname Hostname or IP address
   * @param {String} isid Valid cookie
   * @returns {Promise<Object>}
   */
   restartBox(hostname, isid) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await http.post(`https://${hostname}/jsonrpc/management`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${isid}` }, json: {
            jsonrpc: "2.0",
            method: restartBox,
            params: {
              restartSystem: true
            }
          }
        });
        if (debug) console.log(util.inspect(response, false, null, true));
        const { result, error } = response;
        if (typeof result === "object") {
          resolve(result);
          return;
        }
        reject(new Error(error.message || "failure"));
      } catch (error) {
        if (debug) console.log(error);
        reject(new Error("Unable to restart server at this time!"));
      }
    });
  }

}