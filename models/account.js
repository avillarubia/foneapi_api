const Joi = require('joi')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const joigoose = require('joigoose')(mongoose)

const JWT_SECRET = '12345'

const accountSchema = {
    account: Joi.string().max(50).trim(),
    password: Joi.string().min(5).max(100).trim().required(),
}

const joiSchema = Joi.object(accountSchema)

const mongooseSchema = new mongoose.Schema(joigoose.convert(joiSchema), { timestamps: true })

mongooseSchema.methods.encryptPassword = async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
}

mongooseSchema.methods.generateToken = function (payload) {
    return jwt.sign(payload, JWT_SECRET)
}

async function validateLogin(plain, encypted) {
    return await bcrypt.compare(plain, encypted);
}

const Account = mongoose.model('Account', mongooseSchema)

module.exports = {
    Account,
    validateLogin
}