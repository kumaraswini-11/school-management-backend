// Configuration object for the application (centralizing your configuration in one place)
export const config = {
  port: process.env.PORT || 9000,
  mongoDBUri: process.env.MONGODB_URI,
};
