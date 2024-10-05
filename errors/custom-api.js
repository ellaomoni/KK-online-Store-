class CustomAPIErrors extends Error {
    constructor(message){
        super(message)
    } 
}

module.exports = CustomAPIErrors;