"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ENetDevice {
    constructor(uid, typeID, metaData, installationLocationUID, installationArea, batteryState, isModified, isSoftwareUpdateAvailable, usedLinkResources, securityMode, deviceChannelConfigurationGroups) {
        this.uid = uid;
        this.typeID = typeID;
        this.metaData = metaData;
        this.installationLocationUID = installationLocationUID;
        this.installationArea = installationArea;
        this.batteryState = batteryState;
        this.isModified = isModified;
        this.isSoftwareUpdateAvailable = isSoftwareUpdateAvailable;
        this.usedLinkResources = usedLinkResources;
        this.securityMode = securityMode;
        this.deviceChannelConfigurationGroups = deviceChannelConfigurationGroups;
    }
    getInputFunctions() {
        const functions = [];
        for (const configurationGroup of this.deviceChannelConfigurationGroups)
            for (const deviceChannel of configurationGroup.deviceChannels)
                for (const func of deviceChannel.inputDeviceFunctions)
                    if (typeof func === "object")
                        functions.push({
                            uid: func.uid,
                            typeID: func.typeID,
                            active: func.active,
                            currentValues: func.currentValues,
                            deviceFunctionDependency: func.deviceFunctionDependency
                        });
        return functions;
    }
    getOutputFunctions() {
        const functions = [];
        for (const configurationGroup of this.deviceChannelConfigurationGroups)
            for (const deviceChannel of configurationGroup.deviceChannels)
                for (const func of deviceChannel.outputDeviceFunctions)
                    if (typeof func === "object")
                        functions.push({
                            uid: func.uid,
                            typeID: func.typeID,
                            active: func.active,
                            currentValues: func.currentValues,
                            deviceFunctionDependency: func.deviceFunctionDependency
                        });
        return functions;
    }
    static fromJSON(object) {
        const devices = [];
        for (const device of object) {
            devices.push(new ENetDevice(device.uid, device.typeID, device.metaData, device.installationLocationUID, device.installationArea, device.batteryState, device.isModified, device.isSoftwareUpdateAvailable, device.usedLinkResources, device.securityMode, device.deviceChannelConfigurationGroups));
        }
        return devices;
    }
}
class MetaData {
}
class DeviceChannelConfigurationGroup {
}
class DeviceChannel {
}
class DeviceFunction {
}
class DeviceFunctionValue {
}
class DeviceParameter {
}
class DeviceParameterValue {
}
class DeviceChannelDependency {
}
class DependentDeviceParameterValue {
}
class DependentValueChannelSetting {
}
exports.default = ENetDevice;
