module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface
            .createTable('user', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                name: {
                    allowNull: true,
                    type: Sequelize.STRING(50),
                },
                email: {
                    type: Sequelize.STRING(200),
                    unique: true,
                },
                mobile: Sequelize.STRING(15),
                password: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                reset_token: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.INTEGER,
                    defaultValue: 1,
                    comment: '0:inactive,1:active,2:delete,4:un_verify',
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            })
    },
    down: async(queryInterface) => {
        await queryInterface.dropTable('user')
    },
}