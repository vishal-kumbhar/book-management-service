const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Book, {
                sourceKey: 'id',
                foreignKey: 'user_id',
            })
        }
    }
    User.init({
        name: DataTypes.STRING(50),
        email: {
            type: DataTypes.STRING(200),
            unique: true,
        },
        mobile: DataTypes.STRING(15),
        password: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        reset_token: {
            type: DataTypes.TEXT,
            defaultValue: '',
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '0-inactive, 1-active, 2-deleted ,4-un_verify',
        },
    }, {
        sequelize,
        timestamps: true,
        modelName: 'User',
        tableName: 'user',
    })
    return User
}