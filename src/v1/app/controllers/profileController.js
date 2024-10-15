import handlers from "../../../exceptions/handlers.js";

import response from "../../../utils/native.js";
import { getFileUrl } from "../helpers/utility.js";
import { profileDB } from "../services/db/profileDB.js";
import { userDB } from "../services/db/userDB.js";
import validationHelper from "../validation/validationHelper.js";
import fs from "fs";

const profileController = {
  getProfileHandler: async (req, res) => {
    try {
      const user = req.nativeRequest.setUser;
      const profile = await profileDB.find({ _id: user._id });
      const {
        referenceName,
        referenceContactNumber,
        personal,
        professional,
        educational,
        nidNumber,
        interestedArea,
      } = profile ? profile : {};
      let profileRes = {
        id: user._id,
        name: user?.name ? user.name : null,
        phone: user?.phone ? user.phone : null,
        email: user?.email ? user.email : null,
        avatar: user?.avatar ? user.avatar : null,
        role: user.role
          ? {
              id: user.role._id,
              name: user.role?.name ? user.role?.name : null,
              permissions: user.role.permissions,
            }
          : null,
        organization: user?.organization
          ? {
              id: user?.organization?._id,
              name: user?.organization?.name ? user.organization.name : null,
              country: user?.organization?.country
                ? user.organization.country
                : null,
              region: user?.organization?.region
                ? user.organization.region
                : null,
            }
          : null,
        isActivated: user?.isActivated,
        isApproved: user?.isApproved,

        // profile
        referenceName: referenceName ? referenceName : null,
        referenceContactNumber: referenceContactNumber
          ? referenceContactNumber
          : null,
        nidNumber: nidNumber ? nidNumber : null,
        interestedArea: interestedArea ? interestedArea : null,
        // personal
        gender: personal?.gender ? personal.gender : null,
        dateOfBirth: personal?.dateOfBirth ? personal?.dateOfBirth : null,
        bloodGroup: personal?.bloodGroup ? personal.bloodGroup : null,
        presentAddress: personal?.presentAddress
          ? personal.presentAddress
          : null,
        permanentAddress: personal?.permanentAddress
          ? personal.permanentAddress
          : null,
        maritalStatus: personal?.maritalStatus ? personal.maritalStatus : null,
        anniversaryDate: personal?.anniversaryDate
          ? personal.anniversaryDate
          : null,
        spouseName: personal?.spouseName ? personal.spouseName : null,
        // professional
        occupation: professional?.occupation ? professional.occupation : null,
        companyName: professional?.companyName
          ? professional.companyName
          : null,
        designation: professional?.designation
          ? professional.designation
          : null,

        // educational
        higherEducation: educational?.higherEducation
          ? educational.higherEducation
          : null,
        institutionName: educational?.institutionName
          ? educational.institutionName
          : null,
        yearOfGraduation: educational?.yearOfGraduation
          ? educational.yearOfGraduation
          : null,
      };

      response(
        {
          success: true,
          message: "Data loaded Successful",
          data: profileRes,
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
      handlers(
        {
          errorLog: {
            location: req.originalUrl.split("/").join("::"),
            details: `Error: ${error}`,
          },
          message: error.message,
          success: false,
          error,
        },
        req,
        res
      );
    }
  },
  updateProfileHandler: async (req, res) => {
    try {
      const { setUserId } = req.nativeRequest;
      req.body = { ...req.body };

      if (req.file) {
        req.body.avatar = getFileUrl(req.file);
      }
      validationHelper.userModelUpdateValidation(req.body);
      const user = await userDB.update({ _id: setUserId }, { ...req.body });

      response(
        {
          success: true,
          message: "You have successfully updated your profile",
          data: null,
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
      try {
        if (req.file) {
          let fileUrl = req.file.path.split("\\").join("/");
          let imagePath = req.rootDir + "/" + fileUrl;
          console.log(imagePath);
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.log(error);
      } finally {
        handlers(
          {
            errorLog: {
              location: req.originalUrl.split("/").join("::"),
              details: `Error: ${error}`,
            },
            message: error.message,
            success: false,
            error,
          },
          req,
          res
        );
      }
    }
  },
};

export default profileController;
