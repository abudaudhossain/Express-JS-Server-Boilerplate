import jwt from "jsonwebtoken";

const getOTP = () => {
  return "1234"
  const otp = Math.floor(Math.random() * 10000).toString();
  if (otp.length > 3) {
    return otp;
  } else {
    return getOTP();
  }
};

const getAccessToken = (data) => {
  console.log(process.env.JWT_KEY);
  return jwt.sign(data, process.env.JWT_KEY, { expiresIn: "30 days" });
};

const getFileUrl = (file) => {
  if (!file) return null;
  let fileUrl = file.path.split("\\").join("/");
  return `${process.env.BASE_URL}/api/v1/show/${fileUrl}`;
};

const getFilesUrl = (files) => {
  let filesUrl = [];
  if (files?.length > 0) {
    for (let f = 0; f < files?.length; f++) {
      filesUrl.push(
        `${process.env.BASE_URL}/api/v1/show/${files[f].path
          .split("\\")
          .join("/")}`
      );
    }
  }
  return filesUrl;
};

export { getOTP, getAccessToken, getFileUrl, getFilesUrl };
