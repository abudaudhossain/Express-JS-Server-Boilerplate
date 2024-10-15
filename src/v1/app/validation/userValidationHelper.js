const userValidationHelper = {
    duplicateUserValidation: (
        users,
        userId = null,
        phone = null,
        email = null
    ) => {
        if (users.length > 0) {
            const phoneListOfExistUser = [];
            const emailListOfExistUser = [];
            for (let user of users) {
                if (user.phone) {
                    phoneListOfExistUser.push(user.phone);
                }
                if (user.email) {
                    emailListOfExistUser.push(user.email);
                }
            }

            // // console.log("phoneListOfExistUser: ", phoneListOfExistUser, emailListOfExistUser)

            let message = "";

            if (
                phoneListOfExistUser.includes(phone?.toString()) &&
                emailListOfExistUser.includes(email)
            )
                message = `Email and Phone Number Already exist. Please login now`;
            else if (phoneListOfExistUser.includes(phone?.toString()))
                message = `Phone Number already exists.Please login now`;
            else {
                message = `Email already exists.Please login now`;
            }

            return {
                isInvalid: true,
                message: message,
            };
        }

        return {
            isInvalid: false,
            message: null,
        };
    },
};

export default userValidationHelper;
