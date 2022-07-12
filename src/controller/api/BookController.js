const { Op } = require('sequelize')
const Response = require('../../services/Response')
const Helper = require('../../services/Helper')
const Joi = require('@hapi/joi')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const {
    SUCCESS,
    FAIL,YES,NO,
    INTERNAL_SERVER,
    DELETE,PER_PAGE,
    ACTIVE,BAD_REQUEST
} = require('../../services/Constants')
const { Book } = require('../../models')
const { required } = require('@hapi/joi')

module.exports = {
    UserBookList: async (req, res) => {
        const {authUserId} = req
        await Book.findAndCountAll({
            where: {
                user_id: authUserId,
                status: {
                    [Op.not]: DELETE,
                }
            },
        }).then((data) => {
            if (data.rows.length > 0) {
                return Response.successResponseData(
                    res,
                    data,
                    SUCCESS,
                    res.locals.__('success'),
                )
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('noDataFound'),
                    FAIL
                )
            }
        }, (e) => {
            console.log(e);
            Response.errorResponseData(
                res,
                res.__('internalError'),
                INTERNAL_SERVER
            )
        })
    },

    /**
     * @description 'This function is use to add Book
     * @param req
     * @param res
     * @returns {Promise<void>}
     */

    AddBook: async (req, res) => {
        const reqParam = req.fields;
        const {authUserId} = req
        const requestObj = {
            title: Joi.string().required(),
            author_name: Joi.string().required(),
            isbn: Joi.string().required(),
            file: Joi.string().optional(),
        }
        const schema = Joi.object(requestObj)
        const {error} = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('addBooKValidation', error))
            )
        } else {
             file= false;
           if (req.files.file && req.files.file.size > 0) {
                file = true;
            }
            if (req.files.file && req.files.file.size < 0) {
                return Response.errorResponseData(res, res.__('fileInvalid'), BAD_REQUEST);
            }
            const FileName = file ? `${moment().unix()}${path.extname(req.files.file.name)}` : '';
            const Obj = {
                user_id: authUserId,
                title: reqParam.title,
                author_name: reqParam.author_name,
                isbn: reqParam.isbn,
                book_file: FileName,
                status: ACTIVE
            }
            await Book.create(Obj)
                .then(async (result) => {
                    if (result) {
                        if (file) { 
                            await Helper.FileUpload(req, res, FileName);
                        }
                        Response.successResponseData(
                            res,
                            result,
                            res.__('bookAdded')
                        )
                    }
                })
                .catch(async () => {
                    Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        INTERNAL_SERVER
                    )
                })
        }
    },

    /**
     * @description 'This function is use to Edit Book
     * @param req
     * @param res
     * @returns {Promise<void>}
     */

    EditBook: async (req, res) => {
        const reqParam = req.body;
        const requestObj = {
            id:Joi.string().required(),
            title: Joi.string().required(),
            author_name: Joi.string().required(),
            isbn: Joi.string().required(),
        }
        const schema = Joi.object(requestObj)
        const {error} = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('addBooKValidation', error))
            )
        } else {
            const Obj = {
                title: reqParam.title,
                author_name: reqParam.author_name,
                isbn: reqParam.isbn
            }
            await Book.update(Obj,{
                where:{
                   id:reqParam.id
                }
            }).then(async (updated) => {
                    if (updated) {
                        Response.successResponseWithoutData(res,res.__('bookUpdated'),SUCCESS)
                    }
                })
                .catch(async () => {
                    Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        INTERNAL_SERVER
                    )
                })
        }
    },
    /**
     * @description 'This function is use to Book list
     * @param req
     * @param res
     * @returns {Promise<void>}
     */

    BookList: async (req, res) => {
        const {authUserId} = req
        await Book.findAndCountAll({
            where: {
                status: {
                    [Op.not]: DELETE,
                }
            },
        }).then((data) => {
            if (data.rows.length > 0) {
                return Response.successResponseData(
                    res,
                    data,
                    SUCCESS,
                    res.locals.__('success'),
                )
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('noDataFound'),
                    FAIL
                )
            }
        }, (e) => {
            console.log(e);
            Response.errorResponseData(
                res,
                res.__('internalError'),
                INTERNAL_SERVER
            )
        })
    },


     /**
     * @description delete single book
     * @param req
     * @param res
     * */
      DeleteBook: async (req, res) => {
        const requestParam = req.params
        const BookData = await Book.findByPk(requestParam.id)
        if (BookData === null) {
            Response.successResponseWithoutData(
                res,
                res.__('noDataFound'),
                FAIL
            )
        } else {
            BookData.status = DELETE
            BookData.save()
                .then(() => {
                    Response.successResponseWithoutData(
                        res,
                        res.__('bookDeleted'),
                        SUCCESS
                    )
                })
                .catch(() => {
                    Response.errorResponseData(
                        res,
                        res.__('somethingWentWrong'),
                        BAD_REQUEST
                    )
                })
        }
    },
}