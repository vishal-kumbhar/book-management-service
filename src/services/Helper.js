const { Op } = require('sequelize')
const path = require('path')
const fetch = require('node-fetch')
const bcrypt = require('bcrypt')
const fs = require('fs-extra')
const Jimp = require('jimp')
const { User } = require('../models')
    //const firebase = require('firebase-admin');
const FCM = require('fcm-node');
const Response = require('../services/Response')
const Constants = require('../services/Constants')
//const serviceAccount = require('../config/hindustaan-fcm-firebase.json');
// const { FirebaseDynamicLinks } = require('firebase-dynamic-links');
// const firebaseDynamicLinks = new FirebaseDynamicLinks(process.env.firebaseWebAppKey);
// var serverKey = 'AAAAVLEA2W4:APA91bHJcW5AwsnGzNiIr9Dhu0Qng2NRaFHQIN9bHMXdyiLrmCUIhMaDkjmmVZGwJD2oapFp0mzQwlGOnFMGxZ8DSdIw92t4cjlz_MeSb3FQn4ePsQQue6wOQPr2xMVCqLV0nxtkksGt'; //put your server key here
// var fcm = new FCM(serverKey);


// firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     databaseURL: process.env.FIRE_BASE_DB_URL
// });

module.exports = {
    AppName: 'HINDUSTAN JOBS',
    forgotTemplate: 'forgotPassword',
    supportTemplate: 'customAlert',
    userEmailVerification: 'userEmailVerification',
    sendVerificationCode: 'sendVerificationCode',
    acceptApplyJobMail: 'acceptApplyJobMail',
    rejectApplyJobMail: 'rejectApplyJobMail',
    // get cashback
    async calculateCashBack(amount, per) {
        return await (Number(amount) * per / 100);
    },
    generatePassword: (password) => {
        return new Promise((resolve, reject) => {
            return bcrypt.hash(password, 10, async(err, hash) => {
                if (err) reject()
                resolve(hash)
            })
        })
    },
    toUpperCase: (str) => {
        if (str.length > 0) {
            const newStr = str
                .toLowerCase()
                .replace(/_([a-z])/, (m) => m.toUpperCase())
                .replace(/_/, '')
            return str.charAt(0).toUpperCase() + newStr.slice(1)
        }
        return ''
    },

    generateReferrerCode: function(mobile) {
        let text = ''
        const possible = '0123456789'
        for (let i = 0; i < 3; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        const last5DigitFromMobile = mobile.substr(mobile.length - 5)
        return 'HINDU' + last5DigitFromMobile + text
    },


    createDynamicLink: async function(referralCode) {
        const { shortLink, previewLink } = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo: {
                domainUriPrefix: process.env.domainUriPrefix,
                link: `${process.env.prodRedirectUrl}${referralCode}`,
                androidInfo: {
                    androidPackageName: process.env.androidPackageName,
                },
                iosInfo: {
                    iosBundleId: process.env.iosBundleId,
                },
            },
        });
        return shortLink;
    },

    /*** 
     * @description This function use for create validation unique key
     * @param apiTag
     * @param error
     * @returns {*}
     */
    validationMessageKey: (apiTag, error) => {
        let key = module.exports.toUpperCase(error.details[0].context.key)
        let type = error.details[0].type.split('.')
        type = module.exports.toUpperCase(type[1])
        key = apiTag + key + type
        return key
    },
    /**
     * @description This function use for create random number
     * @param length
     * @returns {*}
     */

    makeRandomNumber: (length) => {
        let result = ''
        const characters =
            '0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    },
    generateMobileOtp: async function(len, mobile) {
        if (process.env.GENERATE_AND_SEND_OTP === 'true') {
            let text = ''
            const possible = '0123456789'
            for (let i = 0; i < len; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length))
            }

            const mobileOtpExist = await User.findOne({
                where: {
                    mobile: mobile,
                    status: {
                        [Op.not]: Constants.DELETE,
                    },
                    otp: text,
                },
            }).then((mobileOtpExistData) => mobileOtpExistData)

            if (mobileOtpExist) {
                await this.generateMobileOtp(len, mobile)
            }
            return text
        } else {
            return 1234
        }
    },

    generateReferrerCode: function(mobile) {
        let text = ''
        const possible = '0123456789'
        for (let i = 0; i < 3; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        const last5DigitFromMobile = mobile.substr(mobile.length - 5)
        return 'HINDU' + last5DigitFromMobile + text
    },

    generateReferrerCodeSocialLogin: function() {
        let text = ''
        const possible = '0123456789'
        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return 'HINDU' + text
    },
    generateResetToken: async function(len, mobile) {
        if (['pre-production', 'production'].indexOf(process.env.NODE_ENV) > -1) {
            let text = ''
            const possible = '0123456789'
            for (let i = 0; i < len; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length))
            }

            const mobileResetTokenExist = await User.findOne({
                where: {
                    mobile: mobile,
                    status: {
                        [Op.not]: Constants.DELETE,
                    },
                    reset_token: text,
                },
            }).then((mobileResetTokenExistData) => mobileResetTokenExistData)

            if (mobileResetTokenExist) {
                await this.generateResetToken(len, mobile)
            }
            return text
        } else {
            return 1234
        }
    },

    sendOtp: async function(mobile, otp) {
        if (process.env.GENERATE_AND_SEND_OTP === 'true') {
            return new Promise((resolve) => {
                fetch(
                        `${process.env.MSG91_SEND_OTP_URL}&mobile=91${mobile}&message=Your otp is ${otp}&otp=${otp}`
                    )
                    .then((res) => res.json())
                    .then(() => {
                        resolve(true)
                    })
                    .catch(() => {
                        resolve(false)
                    })
            })
        } else {
            return true
        }
    },

    ImageUpload: (req, res, imageName) => {
        console.log(imageName);
        console.log(req.files.image.path);
        const oldPath = req.files.image.path;
        const newPath = `${path.join(__dirname, '../public/assets/images/user')
    }/${imageName}`;
        const rawData = fs.readFileSync(oldPath);
        console.log(newPath);
        // eslint-disable-next-line consistent-return
        fs.writeFile(newPath, rawData, (err) => {
            if (err) {
                console.log(err)
                return Response.errorResponseData(res, res.__('somethingWentWrong'), 500);
            }
        });
    },
    FileUpload: (req, res, fileName, folder = 'book_files') => {
        console.log(req.files.file.path);
        const oldPath = req.files.file.path;
        const newPath = `${path.join(__dirname, '../public/assets/' + folder)
    }/${fileName}`;
        const rawData = fs.readFileSync(oldPath);
        console.log("path1");
        console.log(newPath);
        // eslint-disable-next-line consistent-return
        fs.writeFile(newPath, rawData, (err) => {
            if (err) {
                return Response.errorResponseData(res, res.__('somethingWentWrong'), 500);
            }
        });
    },

    SepResumeUpload: (req, res, fileName) => {
        const oldPath = req.files.file.path;
        const newPath = `${path.join(__dirname, '../public/assets/resume')
        }/${fileName}`;
        const rawData = fs.readFileSync(oldPath);
        console.log(newPath);
        // eslint-disable-next-line consistent-return
        fs.writeFile(newPath, rawData, (err) => {
            if (err) {
                return Response.errorResponseData(res, res.__('somethingWentWrong'), 500);
            }
        });
    },

    ResumeUpload: (req, res, resumeName) => {
        const oldPath = req.files.resume.path;
        const newPath = `${path.join(__dirname, '../public/assets/resume')
    }/${resumeName}`;
        const rawData = fs.readFileSync(oldPath);
        console.log(newPath);
        // eslint-disable-next-line consistent-return
        fs.writeFile(newPath, rawData, (err) => {
            if (err) {
                return Response.errorResponseData(res, res.__('somethingWentWrong'), 500);
            }
        });
    },

    mediaUrl: (folder, name) => {
        if (name && name !== '') {
            return `${process.env.APP_URL}/${folder}/${name}`;
        }
        return '';
    },

    pushNotification(notification, firebaseToken) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: firebaseToken,
            // collapse_key: 'your_collapse_key',

            notification: {
                title: notification.title,
                body: notification.message,
            },

            data: { //you can send only notification or only data(or include both)
                my_key: 'my value',
                my_another_key: 'my another value'
            }
        };

        fcm.send(message, function(err, response) {
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
}