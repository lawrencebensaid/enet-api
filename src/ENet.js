const http = require("request-promise-native");
const request_http = require("request");
var crypto = require("crypto");
const ENetClient = require("./ENetClient.js");



module.exports = class ENet {

  constructor(hostname, token = null) {
    this.hostname = hostname;
    this.token = token;
  }



  /**
   * Authenticate with eNet server.
   * 
   * @param {string} username 
   * @param {string} password 
   * @returns 
   */
  authenticate(username, password) {
    this.username = username;
    this.password = password;
    return new Promise(async (resolve, reject) => {
      const hostname = this.hostname;
      if (typeof hostname !== "string") throw new Error("No hostname");

      try {

        const { response: res, body } = await new Promise(async (resolve, reject) => {
          request_http.post(`https://${hostname}/jsonrpc/management`, {
            strictSSL: false,
            json: {
              jsonrpc: "2.0",
              method: "getDigestAuthentificationInfos",
              params: null
            }
          }, (error, response, body) => {
            if (error) {
              reject(error);
              return;
            }
            resolve({ response, body })
          });
        });
        const token = res.headers["x-clientcredentials-sessionid"];
        const response = await http.post(`https://${hostname}/jsonrpc/management`, {
          strictSSL: false,
          headers: { Cookie: `INSTASESSIONID=${token}` }, json: {
            jsonrpc: "2.0",
            method: "userLoginDigest",
            params: calculateLoginDigest({ username, password }, body)
          }
        });
        if (response.result.userName === username) {

          const ress = await http.get(`https://${hostname}/ibnclient.html?icp=${GenerateRandom(20)}`, {
            strictSSL: false,
            headers: {
              Cookie: `uEhaA=true; pbAudioFalg=ON; VideoFormatAVN=ActiveX; INSTASESSIONID=${token}; downloadFinished=true; rememberMe=true`
            }
          });


          this.token = token;
          resolve(token);

        } else {
          reject("login failed");
        }

      } catch (error) {
        reject(error.message);
      }
    });
  }



  /**
   * Shuts down the IMB service and invalidates the token.
   * 
   * @param {String} token 
   * @returns 
   */
  deauthenticate(token) {
    const sessionID = token || this.token;
    return new Promise(async (resolve, reject) => {
      try {
        if (sessionID === null) throw new Error("Missing token");
        reject();
      } catch (error) {
        reject(error.message);
      }
    });
  }



  /**
   * Location list
   * 
   * @param {Boolean} flat 
   * @returns 
   */
  getLocations(flat = false) {
    const client = new ENetClient();
    return new Promise(async (resolve, reject) => {
      try {
        const response = await client.getLocations(this.hostname, this.token);
        if (flat) {
          resolve(locationsFlat(response));
        } else {
          resolve(response);
        }
      } catch (error) {
        reject(error.message);
      }
    });
  }



  /**
   * 
   * @returns 
   */
  getDevices(deviceLsIncludeState = false) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient();
      try {
        var data = [];
        const response = await this.getLocations(true);
        for (const location of response) {
          for (let device of location.deviceUIDs) {
            device.locationName = location.name;
            if (deviceLsIncludeState) {
              var functions = parseDeviceFunctions(await client.getDevicesWithParameterFilter(this.hostname, this.token, [device.deviceUID]));
              for (const func of functions) {
                if (func.typeID.includes(".IOO") && func.io === "OUT") {
                  const values = await client.getCurrentValuesFromOutputDeviceFunction(this.hostname, this.token, func.uid) || [];
                  if (values.length > 0 && typeof values[0].value === "boolean") {
                    device.state = values[0].value;
                  }
                  break;
                }
              }
            }
            data.push(device);
          }
        }
        resolve(data);
      } catch (error) {
        console.log(error);
        reject(error.message);
      }
    });
  }



  /**
   * 
   * @param {string[]} deviceUIDs 
   * @returns 
   */
  getDevicesInfo(deviceUIDs) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient();
      try {
        const response = await client.getDevicesWithParameterFilter(this.hostname, this.token, deviceUIDs);
        resolve(response);
      } catch (error) {
        reject(error.message);
      }
    });
  }



  /**
   * 
   * @param {string} deviceUID 
   * @returns 
   */
  getDeviceInfo(deviceUID) {
    return new Promise(async (resolve, reject) => {
      this.getDevicesInfo([deviceUID])
        .then(response => { resolve(response[0]) })
        .catch(reject);
    });
  }



  /**
   * 
   * @param {string} deviceUID 
   * @param {*} state 
   * @returns 
   */
  setDevicePrimaryState(deviceUID, state) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient();
      try {
        const response = await client.getDevicesWithParameterFilter(this.hostname, this.token, [deviceUID]);
        var data = parseDeviceFunctions(response);
        for (const func of data) {
          if (func.typeID.includes(".SOO") && func.io === "IN") {
            await client.callInputDeviceFunction(this.hostname, this.token, func.uid, state);
            resolve();
            return;
          }
        }
      } catch (error) {
        reject(error.message);
      }
    });
  }



  /**
   * 
   * @param {string} deviceUID 
   * @returns 
   */
  getDevicePrimaryState(deviceUID) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient();
      try {
        const response = await client.getDevicesWithParameterFilter(this.hostname, this.token, [deviceUID]);
        var data = parseDeviceFunctions(response);
        for (const func of data) {
          if (func.typeID.includes(".IOO") && func.io === "OUT") {
            const values = await client.getCurrentValuesFromOutputDeviceFunction(this.hostname, this.token, func.uid);
            resolve(values[0].value);
            return;
          }
        }
        reject();
      } catch (error) {
        reject(error.message);
      }
    });
  }

}



/**
 * Helper function
 * 
 * @param {*} data 
 * @returns 
 */
function locationsFlat(data) {
  const array = [];
  for (const location of data) {
    const { childLocations } = location;
    if (childLocations) {
      for (const child of locationsFlat(childLocations)) array.push(child);
    }
    delete location.childLocations;
    array.push(location);
  }
  return array;
}



/**
 * Helper function
 * 
 * @param {object[]} data 
 * @returns 
 */
function parseDeviceFunctions(data) {
  const functions = [];
  for (const device of data) {
    for (const configurationGroup of device["deviceChannelConfigurationGroups"]) {
      for (const deviceChannel of configurationGroup["deviceChannels"]) {
        const inputFunctions = deviceChannel["inputDeviceFunctions"];
        const outputFunctions = deviceChannel["outputDeviceFunctions"];
        for (const func of inputFunctions) if (typeof func === "object") {
          func.io = "IN"
          functions.push(func);
        }
        for (const func of outputFunctions) if (typeof func === "object") {
          func.io = "OUT"
          functions.push(func);
        }
      }
    }
  }
  return functions;
}



/**
 * Helper function
 * 
 * @param {*} len 
 * @returns 
 */
function GenerateRandom(len) {
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabzdefghijklmnopqrstuvwxyz0123456789";
  var token = "";
  for (var i = 0; i < len; i++) {
    var randNum = Math.round(Math.random() * characters.length);
    token += characters.substr(randNum, 1);
  }
  return token;
}



/**
 * Helper function
 * 
 * @param {*} challengeParams 
 * @returns 
 */
function calculateLoginDigest({ username, password }, challengeParams) {
  var ncd = 1;
  var ha1 = crypto.createHash("sha1").update(`${username}:Insta-NetBox:${password}`).digest("hex");
  var ha1u = ha1.toUpperCase();
  var ha2 = crypto.createHash("sha1").update("POST:/jsonrpc//management").digest("hex");
  var ha2u = ha2.toUpperCase();
  var nc = ("00000000" + ncd).slice(-8);
  var cnonce = GenerateRandom(40);
  var ha3 = crypto.createHash("sha1").update(`${ha1u}:${challengeParams.result.nonce}:${nc}:${cnonce}:auth:${ha2u}`).digest("hex");
  var response = ha3.toUpperCase();
  var authRequestParams = { username: username, realm: challengeParams.result.realm, nonce: challengeParams.result.nonce, uri: challengeParams.result.uri, qop: challengeParams.result.qop, opaque: challengeParams.result.opaque, response: response, nc: nc, cnonce: cnonce };
  return {
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
}