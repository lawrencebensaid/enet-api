import ENetDevice from './ENetDevice'
import ENetClient from './ENetClient'
import ENetLocation from './ENetLocation'


/**
 * @description Abstraction over ENetClient.
 */
class ENet {

  username: string
  password: string
  hostname: string
  token: string

  constructor(hostname: string, token: string = null) {
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
  authenticate(username: string, password: string): Promise<string> {
    this.username = username;
    this.password = password;
    var client = new ENetClient(this.hostname, this.token);
    return new Promise<string>(async (resolve, reject) => {
      const hostname = this.hostname;
      if (typeof hostname !== "string") throw new Error("No hostname");
      try {
        const { response, body } = await client.request('management', 'getDigestAuthentificationInfos', { auth: false, response: true }, null);
        const token = response.headers["x-clientcredentials-sessionid"];
        client = new ENetClient(this.hostname, token);
        const user = await client.userLoginDigest(username, password, body.result);
        if (user.result.userName === username) {
          await client.setRemember();
          this.token = token;
          resolve(token);
        } else {
          reject("login failed");
        }
      } catch (error) {
        if (error && error.statusCode) {
          reject(error.statusMessage);
        } else {
          reject(error);
        }
      }
    });
  }


  /**
   * Shuts down the IMB service and invalidates the token.
   * 
   * @param {String} token 
   * @returns 
   */
  deauthenticate(token: string = null) {
    const sessionID = token || this.token;
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (sessionID === null) throw new Error("Missing token");
        resolve();
      } catch (error) {
        reject(error.message);
      }
    });
  }


  /**
   * Reboots the ENet server.
   * 
   * @returns 
   */
  reboot() {
    return new Promise<void>(async (resolve, reject) => {
      const client = new ENetClient(this.hostname, this.token);
      try {
        await client.restartBox();
        resolve();
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
  getLocations(flat: boolean = false): Promise<ENetLocation[]> {
    const client = new ENetClient(this.hostname, this.token);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await client.getLocations();
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


  // /**
  //  * 
  //  * @returns 
  //  */
  // getDevices(deviceLsIncludeState: boolean = false) {
  //   return new Promise(async (resolve, reject) => {
  //     const client = new ENetClient(this.hostname, this.token);
  //     try {
  //       var data = [];
  //       const response = await this.getLocations(true);
  //       for (const location of response) {
  //         for (let device of location.deviceUIDs) {
  //           device.locationName = location.name;
  //           if (deviceLsIncludeState) {
  //             var functions = parseDeviceFunctions(await client.getDevicesWithParameterFilter([device.deviceUID]));
  //             for (const func of functions) {
  //               if (func.typeID.includes(".IOO") && func.io === "OUT") {
  //                 const values = await client.getCurrentValuesFromOutputDeviceFunction(func.uid) || [];
  //                 if (values.length > 0 && typeof values[0].value === "boolean") {
  //                   device.state = values[0].value;
  //                 }
  //                 break;
  //               }
  //             }
  //           }
  //           data.push(device);
  //         }
  //       }
  //       resolve(data);
  //     } catch (error) {
  //       console.log(error);
  //       reject(error.message);
  //     }
  //   });
  // }


  /**
   * 
   * @param {string[]} deviceUIDs 
   * @returns 
   */
  getDevicesInfo(deviceUIDs) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient(this.hostname, this.token);
      try {
        const response = await client.getDevicesWithParameterFilter(deviceUIDs);
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
  async setDevicePrimaryState(deviceUID, state) {
    const client = new ENetClient(this.hostname, this.token);
    try {
      const response = await client.getDevicesWithParameterFilter([deviceUID]);
      var data = parseDeviceFunctions(response);
      for (const func of data) {
        if (func.typeID.includes(".SOO") && func.io === "IN") {
          await client.callInputDeviceFunction(func.uid, state);
          return;
        }
      }
    } catch (error) {
      throw error;
    }
  }


  /**
   * 
   * @param {string} deviceUID 
   * @returns 
   */
  getDevicePrimaryState(deviceUID) {
    return new Promise(async (resolve, reject) => {
      const client = new ENetClient(this.hostname, this.token);
      try {
        const response = await client.getDevicesWithParameterFilter([deviceUID]);
        var data = parseDeviceFunctions(response);
        for (const func of data) {
          if (func.typeID.includes(".IOO") && func.io === "OUT") {
            const values = await client.getCurrentValuesFromOutputDeviceFunction(func.uid);
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
function locationsFlat(data: ENetLocation[]) {
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
 * @param devices
 * @returns 
 */
function parseDeviceFunctions(devices: ENetDevice[]) {
  const functions: any[] = [];
  for (const device of devices) {
    for (const configurationGroup of device.deviceChannelConfigurationGroups) {
      for (const deviceChannel of configurationGroup.deviceChannels) {
        const inputFunctions = deviceChannel.inputDeviceFunctions;
        const outputFunctions = deviceChannel.outputDeviceFunctions;
        for (const func of inputFunctions) if (typeof func === "object") {
          functions.push({
            uid: func.uid,
            typeID: func.typeID,
            active: func.active,
            currentValues: func.currentValues,
            deviceFunctionDependency: func.deviceFunctionDependency,
            io: "IN"
          });
        }
        for (const func of outputFunctions) if (typeof func === "object") {
          functions.push({
            uid: func.uid,
            typeID: func.typeID,
            active: func.active,
            currentValues: func.currentValues,
            deviceFunctionDependency: func.deviceFunctionDependency,
            io: "OUT"
          });
        }
      }
    }
  }
  return functions;
}


export default ENet