"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    /**
     * Helper function
     *
     * @param {*} len
     * @returns
     */
    static generateRandom(len) {
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabzdefghijklmnopqrstuvwxyz0123456789";
        var token = "";
        for (var i = 0; i < len; i++) {
            var randNum = Math.round(Math.random() * characters.length);
            token += characters.substr(randNum, 1);
        }
        return token;
    }
}
exports.default = Utils;
