const config = {
  production: {
    SECRET: process.env.SECRET,
    DATABASE: process.env.MONGODB_URL,
  },
  default: {
    SECRET: 'SUPERSECRETPASSWORD123',
    DATABASE: 'mongodb://localhost:27017/booksShelf',
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};
