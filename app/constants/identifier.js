module.exports = {
    identifierModels: {
        users: {
            modelName: 'users-*',
            deps: [],
            length: 10000, // how many ids will store each doc
            total: 900, // total docs that are storing unique ids,
            startId: 1000000,
            isPartial: true // means ids are stored in multiple docs
        },
        courses: {
            modelName: 'courses',
            deps: ['courseModel'],
            isPartial: false
        }
    }
}