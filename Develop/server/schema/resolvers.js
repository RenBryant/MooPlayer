const { AuthenticationError } = require ('apollo-server-express')
const { User } = require ('../models')
const { signToken } = require ('../utils/auth')

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select("-__v -password");

                return userData
            }
            throw new AuthenticationError("Not Logged In!")
        }
    },
    Mutation: {
        addUser: async(parent, args) => {
            const user = await User.create(args);
            const token = signToken(user)
            return {token, user};
        },
        login: async(parent, {email, password}) => {
            const user = await User.findOne({email})
            if (!user) {
                throw new AuthenticationError("Incorrect Credentials!")
            }
            const correctPassword = await user.isCorrectPassword(password)
            if (!password) {
                throw new AuthenticationError("Incorrect Credentials!")
            }
            const token = signToken(user)
            return {token, user};
        },
        saveBook: async(parent, {bookData}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id}, 
                    {$push: {savedBooks: bookData}},
                    {new: true}
                )
                return updatedUser
            }
            throw new AuthenticationError("Must Be Logged In to Save Books")
        },
        removeBook: async(parent, {bookData}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id}, 
                    {$pull: {savedBooks: bookData}},
                    {new: true}
                )
                return updatedUser
            }
            throw new AuthenticationError("Must Be Logged In to Remove Books")
        }
    }
}

module.exports = resolvers