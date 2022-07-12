const Response = require('../services/Response')
const jwToken = require('../services/jwtToken')
const { User } = require('../models')
const { INACTIVE, ACTIVE, USER_ROLE_TYPE } = require('../services/Constants')

module.exports = {
    apiTokenAuth: async(req, res, next) => {
        const token = req.headers.authorization
        if (!token) {
            Response.errorResponseData(res, res.locals.__('authorizationError'), 401)
        } else {
            const tokenData = await jwToken.decode(token)
            if (tokenData) {
                jwToken.verify(tokenData, (err, decoded) => {
                    if (err) {
                        Response.errorResponseData(res, res.locals.__('invalidToken'), 401)
                    }
                    if (decoded.id) {
                        req.authUserId = decoded.id
                        User.findOne({
                            where: {
                                id: req.authUserId,
                            },
                        }).then((result) => {
                            if (!result) {
                                return Response.errorResponseData(
                                    res,
                                    res.locals.__('invalidToken'),
                                    401
                                )
                            } else {
                                if (result && result.status === INACTIVE) {
                                    return Response.errorResponseData(
                                        res,
                                        res.locals.__('accountIsInactive'),
                                        401
                                    )
                                }
                                if (result && result.status === ACTIVE) {
                                    return next()
                                } else {
                                    return Response.errorResponseData(
                                        res,
                                        res.locals.__('accountBlocked'),
                                        401
                                    )
                                }
                            }
                        })
                    } else {
                        Response.errorResponseData(res, res.locals.__('invalidToken'), 401)
                    }
                })
            } else {
                Response.errorResponseData(res, res.locals.__('invalidToken'), 401)
            }
        }
    },
}