const router = require('express').Router()
const { apiTokenAuth } = require('../../middlewares/api')
const formidableMiddleware = require('express-formidable')

const AuthController = require('../../controller/api/AuthController')
const BookController = require('../../controller/api/BookController')


router.post('/login', AuthController.login)
router.post('/register', AuthController.signUp)
router.post('/change-password',apiTokenAuth,AuthController.changePassword)

router.post('/add-book',apiTokenAuth,formidableMiddleware(), BookController.AddBook)
router.post('/edit-book',apiTokenAuth, BookController.EditBook)
router.get('/book-list',apiTokenAuth, BookController.BookList)
router.get('/user-book-list',apiTokenAuth, BookController.UserBookList)
router.delete('/delete-book/:id', apiTokenAuth, BookController.DeleteBook);



module.exports = router