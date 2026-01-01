module.exports = {
  apps: [
    {
      name: "aws-sms-server",
      script: "./index.js",    // entry point of your app
      watch: true,             // optional: auto-restart on changes
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
