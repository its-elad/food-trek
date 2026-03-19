module.exports = {
  apps: [
    {
      name: "food-trek-api",
      script: "dist/index.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
