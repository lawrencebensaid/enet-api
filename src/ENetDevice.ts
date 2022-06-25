

class ENetDevice {
  uid: string
  typeID: string
  metaData: MetaData
  installationLocationUID: string
  installationArea: string
  batteryState: any
  isModified: boolean
  isSoftwareUpdateAvailable: boolean
  usedLinkResources: number
  securityMode: string
  deviceChannelConfigurationGroups: DeviceChannelConfigurationGroup[]

  constructor(uid: string, typeID: string, metaData: MetaData, installationLocationUID: string, installationArea: string, batteryState: any, isModified: boolean, isSoftwareUpdateAvailable: boolean, usedLinkResources: number, securityMode: string, deviceChannelConfigurationGroups: DeviceChannelConfigurationGroup[]) {
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

  public getInputFunctions(): DeviceFunction[] {
    const functions: DeviceFunction[] = [];
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

  public getOutputFunctions(): DeviceFunction[] {
    const functions: DeviceFunction[] = [];
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

  static fromJSON(object: any): ENetDevice[] {
    const devices: ENetDevice[] = [];
    for (const device of object) {
      devices.push(new ENetDevice(
        device.uid,
        device.typeID,
        device.metaData,
        device.installationLocationUID,
        device.installationArea,
        device.batteryState,
        device.isModified,
        device.isSoftwareUpdateAvailable,
        device.usedLinkResources,
        device.securityMode,
        device.deviceChannelConfigurationGroups
      ));
    }
    return devices;
  }
}

class MetaData {
  serialNumber: string
}

class DeviceChannelConfigurationGroup {
  no: number
  deviceParameters: DeviceParameter[]
  deviceChannels: DeviceChannel[]
}

class DeviceChannel {
  no: number
  hannelTypeID: string
  writeProtected: boolean
  active: boolean
  effectLocationUID: string
  effectArea: string
  inputDeviceFunctions: DeviceFunction[]
  outputDeviceFunctions: DeviceFunction[]
  deviceParameters: DeviceParameter[]
  deviceChannelDependency: DeviceChannelDependency[]
}

class DeviceFunction {
  uid: string
  typeID: string
  active: boolean
  currentValues: DeviceFunctionValue[]
  deviceFunctionDependency: any
}

class DeviceFunctionValue {
  value: any
  valueTypeID: string
  valueUID: string
}

class DeviceParameter {
  uid: boolean
  typeID: boolean
  readOnly: boolean
  parentAffectsWriteProtection: boolean
  active: boolean
  synchronisationRequired: boolean
  toBeValues: DeviceParameterValue[]
  currentValues: DeviceParameterValue[]
  deviceParameterDependency: any
}

class DeviceParameterValue {
  value: number
  valueTypeID: string
}

class DeviceChannelDependency {
  activationOperand: string
  dependentDeviceParameterValues: DependentDeviceParameterValue[]
}

class DependentDeviceParameterValue {
  deviceParameterUID: string
  valueUID: string
  valueTypeID: string
  dependentValueChannelSettings: DependentValueChannelSetting[]
}

class DependentValueChannelSetting {
  dependOnValueTypeID: string
  dependOnValue: boolean
  writeProtected: boolean
  active: any
  channelTypeID: string
}


export default ENetDevice