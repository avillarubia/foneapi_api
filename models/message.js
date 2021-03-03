const Joi = require('joi')
const mongoose = require('mongoose')
const joigoose = require('joigoose')(mongoose)

const chatSchema = {
    account_id: Joi.string(),
    message: Joi.string().trim()
}

const joiSchema = Joi.object(chatSchema)

const mongooseSchema = new mongoose.Schema(joigoose.convert(joiSchema), { timestamps: true })

const Message = mongoose.model('Message', mongooseSchema)

module.exports = {
    Message
}