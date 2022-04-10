module.exports = {
    email: 'required|email',
    firstName: 'min:3',
    lastName: 'min:3',
    role: 'string',
    hash: 'string',
    salt: 'string',
    isDeleted: 'boolean',
    createdAt: 'date',
    updatedAt: 'date',
}