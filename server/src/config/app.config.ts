export default () => ({
  port: parseInt(process.env.PORT || '', 10) || 5000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
});
