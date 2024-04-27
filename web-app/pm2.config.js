module.exports = {
  apps: [
    {
      name: 'web-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      wait_ready: true,
    },
  ],
};
