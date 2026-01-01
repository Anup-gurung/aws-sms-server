module.exports = {
  apps: [
    {
      name: 'sms-smpp-service',
      script: 'src/server.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
