class UserService {
  async addUser(params) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(params)
      }, 3000)
    })
  }
}

module.exports = new UserService()