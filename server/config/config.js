const config = {
  production: {
    SECRET: process.env.SECRET,
    DATABASE: 'mongodb://user1:password1@ds119343.mlab.com:19343/book_shelf',
  },
  default: {
    SECRET: 'SUPERSECRETPASSWORD123',
    DATABASE: 'mongodb://localhost:27017/booksShelf',
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};

// exports.DATABASE_URL =
//   process.env.DATABASE_URL || 'mongodb://localhost:27017/booksShelf';
