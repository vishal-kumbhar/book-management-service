const bcrypt = require('bcrypt')
const Transformer = require('object-transformer')
const Constants = require('../../services/Constants')
const { Op } = require('sequelize')
const Response = require('../../services/Response')
const Helper = require('../../services/Helper')
const Mailer = require('../../services/Mailer')
const moment = require('moment')
const path = require('path')
const Joi = require('@hapi/joi')
const jwToken = require('../../services/jwtToken')
const {
    DELETE,
    USER_IMAGE,
    SUCCESS,
    FAIL,
    ACTIVE,
    BAD_REQUEST,
    UNAUTHORIZED,
    INTERNAL_SERVER,
    UN_VERIFY,
    SIGN_UP_REDIRECTION,
    INACTIVE,
    USER_ROLE_TYPE
} = require('../../services/Constants')
const { User } = require('../../models')
module.exports = {
    /**
     * @description sign-up controller
     * @param req
     * @param res
     */
    signUp: async (req, res) => {
        const reqParam = req.body
        console.log(reqParam,"ac csign-up api called");
        // eslint-disable-next-line consistent-return
        const reqObj = {
            name: Joi.string().trim().max(50).required(),
            email: Joi.string().email().required(),
            mobile: Joi.string()
                .trim()
                .min(10)
                .max(10)
                .regex(/^[0-9]*$/)
                .required(),
            password: Joi.string().required(),
        }
        const schema = Joi.object(reqObj)
        const {error} = await schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('signUpValidation', error))
            )
        } else {
            if (reqParam.email && reqParam.email !== '') {
                const userEmailExist = await User.findOne({
                    where: {
                        email: reqParam.email,
                        status: {
                            [Op.not]: DELETE,
                        },
                    },
                }).then((userEmailData) => userEmailData)

                if (userEmailExist) {
                    return Response.errorResponseWithoutData(
                        res,
                        res.locals.__('emailAddressIsAlreadyRegisteredWithUs'),
                        FAIL
                    )
                }
            }

            const user = await User.findOne({
                where: {
                    mobile: reqParam.mobile,
                    status: {
                        [Op.not]: DELETE,
                    },
                },
            }).then((userMobileExistData) => userMobileExistData)

            if (user) {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('mobileIsAlreadyRegisteredWithUs'),
                    FAIL
                )
            }
            try {
                const passwordHash = await bcrypt.hashSync(reqParam.password, 10)
                const userObj = {
                    name: reqParam.name,
                    email: reqParam.email,
                    mobile: reqParam.mobile,
                    password: passwordHash,
                    status: ACTIVE,
                }
                await User.create(userObj)
                    .then(async (result) => {
                        if (result) {
                            const token = jwToken.issueUser({
                                id: result.id
                            })
                            result.reset_token = token
                            User.update({reset_token: token}, {
                                where: {
                                    email: result.email
                                }
                            }).then(async (updateData) => {
                                if (updateData) {
                                    return Response.successResponseData(
                                        res,
                                        result,
                                        SUCCESS,
                                        res.locals.__('userAddedSuccessfully')
                                    )

                                } else {
                                    return Response.errorResponseData(
                                        res,
                                        res.__('somethingWentWrong')
                                    )
                                }
                            }, (e) => {
                                console.log(e)
                                Response.errorResponseData(
                                    res,
                                    res.__('internalError'),
                                    INTERNAL_SERVER
                                )
                            })
                        } else {
                            return Response.errorResponseData(
                                res,
                                res.__('somethingWentWrong')
                            )
                        }
                    }).catch((e) => {
                        console.log(e)
                        return Response.errorResponseData(
                            res,
                            res.__('somethingWentWrong')
                        )
                    })
            } catch (e) {
                console.log(e)
                return Response.errorResponseData(res, res.__('somethingWentWrong'))
            }
        }
    },

    /**
     * @description user login controller
     * @param req
     * @param res
     */
    login: async (req, res) => {
        const reqParam = req.body
        const reqObj = {
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }
        const schema = Joi.object(reqObj)
        const {error} = await schema.validate(reqParam)
        if (error) {
            console.log(error)
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('LoginValidation', error))
            )
        } else {
            let user = await User.findOne({
                where: {
                    email: reqParam.email,
                    status: {
                        [Op.not]: DELETE,
                    },
                },
            }).then((customerData) => customerData)

            if (user) {
                if (user.status === ACTIVE) {
                    bcrypt.compare(
                        reqParam.password,
                        user.password,
                        async (err, result) => {
                            if (err) {
                                return Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('emailPasswordNotMatch'),
                                    600
                                )
                            }
                            if (result) {
                                const token = jwToken.issueUser({
                                    id: user.id,
                                    company_id: user.company_id,
                                    user_role_type: user.user_role_type,
                                })
                                console.log(result)
                                user.reset_token = token
                                User.update({reset_token: token}, {
                                    where: {
                                        email: user.email
                                    }
                                }).then(async (updateData) => {
                                    if (updateData) {
                                        // const meta = {token: jwToken.issueUser(user.id)}
                                        console.log()
                                        return Response.successResponseData(
                                            res,
                                            user,
                                            SUCCESS,
                                            res.locals.__('loginSuccess'),
                                        )

                                    } else {
                                        return Response.errorResponseData(
                                            res,
                                            res.__('somethingWentWrong')
                                        )
                                    }
                                }, (e) => {
                                    console.log(e)
                                    Response.errorResponseData(
                                        res,
                                        res.__('internalError'),
                                        INTERNAL_SERVER
                                    )
                                })
                            } else {
                                Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('usernamePasswordNotMatch'),
                                    FAIL
                                )
                            }
                            return null
                        }
                    )
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('accountIsInactive'),
                        UNAUTHORIZED
                    )
                }
            } else {
                Response.errorResponseWithoutData(
                    res,
                    res.locals.__('UserNameNotExist'),
                    FAIL
                )
            }
        }
    },

    /**
     * @description admin change password
     * @param req
     * @param res
     */
    changePassword: async (req, res) => {
        const {authUserId} = req
        const requestParams = req.body;
        const schema = Joi.object().keys({
            old_password: Joi.string().trim().required(),
            password: Joi.string()
                .trim()
                .min(6)
                .required()
                .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
        })
        const {error} = schema.validate(requestParams)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('changePassword', error))
            )
        } else {
            await User.findOne({
                where: {
                    id: authUserId,
                    status: {
                        [Op.ne]: Constants.DELETE,
                    },
                },
            })
                .then(async (userData) => {
                    if (userData) {
                        bcrypt.compare(
                            requestParams.old_password,
                            userData.password,
                            async (err, oldPasswordRes) => {
                                if (err) {
                                    Response.errorResponseData(
                                        res,
                                        res.__('somethingWentWrong'),
                                        Constants.INTERNAL_SERVER
                                    )
                                }
                                if (oldPasswordRes) {
                                    bcrypt.compare(
                                        requestParams.password,
                                        userData.password,
                                        async (innerErr, newPasswordRes) => {
                                            if (innerErr) {
                                                Response.errorResponseData(
                                                    res,
                                                    res.__('somethingWentWrong'),
                                                    Constants.INTERNAL_SERVER
                                                )
                                            }
                                            if (newPasswordRes) {
                                                Response.successResponseWithoutData(
                                                    res,
                                                    res.__('oldNewPasswordSame'),
                                                    Constants.FAIL
                                                )
                                            } else {
                                                bcrypt.hash(
                                                    requestParams.password,
                                                    10,
                                                    (bcryptErr, adminPassword) => {
                                                        if (bcryptErr) {
                                                            Response.errorResponseData(
                                                                res,
                                                                res.__('somethingWentWrong'),
                                                                Constants.INTERNAL_SERVER
                                                            )
                                                        }
                                                        User.update(
                                                            {
                                                                password: adminPassword,
                                                            },
                                                            {
                                                                where: {
                                                                    id: userData.id,
                                                                },
                                                            }
                                                        ).then((update) => {
                                                            if (update) {
                                                                Response.successResponseWithoutData(
                                                                    res,
                                                                    res.__('changePasswordSuccess')
                                                                )
                                                            } else {
                                                                Response.errorResponseData(
                                                                    res,
                                                                    res.__('somethingWentWrong'),
                                                                    Constants.INTERNAL_SERVER
                                                                )
                                                            }
                                                        })
                                                    }
                                                )
                                            }
                                        }
                                    )
                                } else {
                                    Response.successResponseWithoutData(
                                        res,
                                        res.__('oldPasswordNotMatch'),
                                        Constants.FAIL
                                    )
                                }
                            }
                        )
                    } else {
                        return Response.successResponseData(
                            res,
                            null,
                            Constants.SUCCESS,
                            res.locals.__('userNotFound')
                        )
                    }
                    return null
                })
                .catch(() => {
                    Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                })
        }
    }
}