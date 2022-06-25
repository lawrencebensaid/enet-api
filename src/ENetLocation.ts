import ENetDeviceUID from './ENetDeviceUID'


class ENetLocation {

  uid: string;
  name: string;
  type: number;
  nameId: number;
  deviceUIDs: ENetDeviceUID[];
  childLocations: ENetLocation[];

  constructor(uid: string, name: string, type: number, nameId: number, deviceUIDs: ENetDeviceUID[], childLocations: ENetLocation[]) {
    this.uid = uid;
    this.name = name;
    this.type = type;
    this.nameId = nameId;
    this.deviceUIDs = deviceUIDs;
    this.childLocations = childLocations;
  }

}


export default ENetLocation