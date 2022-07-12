    const fs = require('fs')
    const path = require('path')
    const { Sequelize } = require('sequelize')
    const basename = path.basename(__filename)
    const env = process.env.NODE_ENV || 'local'
    console.log(env)
        // eslint-disable-next-line import/no-dynamic-require,no-path-concat
    const config = require(__dirname + '/../config/config.js')[env]
    const db = {}

    let sequelize
    if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config, {
            logging: false
                // rest of your config
        })
    } else {
        sequelize = new Sequelize(
            config.database,
            config.username,
            config.password,
            config, {
                logging: false
                    // rest of your config
            }
        )
    }

    try {
        sequelize.options.logging = false;
        sequelize.authenticate()
        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
    fs.readdirSync(__dirname)
        .filter((file) => {
            return (
                file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
            )
        })
        .forEach((file) => {
            // eslint-disable-next-line global-require,import/no-dynamic-require
            const model = require(path.join(__dirname, file))(
                sequelize,
                Sequelize.DataTypes
            )
            db[model.name] = model
        })

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db)
        }
    })

    db.sequelize = sequelize
    db.Sequelize = Sequelize

    module.exports = db