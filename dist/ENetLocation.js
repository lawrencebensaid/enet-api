"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ENetLocation {
    constructor(uid, name, type, nameId, deviceUIDs, childLocations) {
        this.uid = uid;
        this.name = name;
        this.type = type;
        this.nameId = nameId;
        this.deviceUIDs = deviceUIDs;
        this.childLocations = childLocations;
    }
}
exports.default = ENetLocation;
