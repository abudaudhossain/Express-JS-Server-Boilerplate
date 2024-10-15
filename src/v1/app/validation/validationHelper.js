import mongoose from "mongoose";
import NotFoundError from "../../../exceptions/NotFoundError.js";
import ValidationError from "../../../exceptions/ValidationError.js";

const validationHelper = {
  ObjExists: (keys, obj, flag = "") => {
    // console.log(keys, obj)
    let message = [];
    for (let i = 0; i < keys.length; i++) {
      if (!obj.hasOwnProperty(keys[i]))
        message.push(`${keys[i]} field is required${flag && flag}`);
    }

    if (message.length > 0) {
      throw new NotFoundError(message);
    } else {
      return true;
    }
  },

  isEmpty: (body, flag = "") => {
    // data= Object.values(object1) parameter values
    let data = Object.values(body);
    let keys = Object.keys(body);
    let message = [];
    for (let i = 0; i < data.length; i++) {
      if (!data[i])
        message.push(`${flag ? flag + " " : ""}${keys[i]} required`);
      else if (data[i].length === 0)
        message.push(`${keys[i]} field is required${flag && flag}`);
    }

    if (message.length > 0) {
      throw new NotFoundError(message);
    } else {
      return true;
    }
  },
  isValidMongoDBObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  phoneValidation: (phone) => {
    const pattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;

    return !pattern.test(phone);
  },
  validateEmail: (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !emailPattern.test(email);
  },
  passwordValidation: (pass) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-])(?=.*\d).{8,}$/;
    //  'Password must meet the requirements: at least one uppercase letter, one lowercase letter, one special character, one digit, and a minimum of 8 characters.'

    // Password meets all requirements return false
    return !passwordRegex.test(pass);
  },
  userModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "password",
      "role",
      "accessTokens",
      "refreshTokens",
      "lastLogAt",
      "existence",
      "createBy",
      "createdAt",
      "updatedAt",
      "resetToken",
      "otp",
      "otpExpireTime",
      "isActivated",
      "existence",
      "fcmToken",
      "alertCategory",
      "alertRate",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
  eventModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "createBy",
      "createdAt",
      "updatedAt",
      "organization",
      "updatedBy",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
  eventSessionModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "createBy",
      "createdAt",
      "updatedAt",
      "organization",
      "updatedBy",
      "event",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
  speakerModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "createBy",
      "createdAt",
      "updatedAt",
      "organization",
      "updatedBy",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
  typeModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "createBy",
      "createdAt",
      "updatedAt",
      "organization",
      "updatedBy",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
  meetupsModelUpdateValidation: (body = {}) => {
    let keys = Object.keys(body);
    const query = [
      "_id",
      "createBy",
      "createdAt",
      "updatedAt",
      "organization",
      "updatedBy",
    ];
    let message = [];
    for (let key of keys) {
      if (query.indexOf(key) != -1)
        message.push(`Insufficient permissions to update ${key}`);
    }

    if (message.length > 0) {
      throw new ValidationError(message);
    } else {
      return true;
    }
  },
};

export default validationHelper;
