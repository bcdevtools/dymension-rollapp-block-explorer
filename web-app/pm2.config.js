module.exports = {
  apps: [
    {
      name: 'web-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '.',
      // instances: 0,
      // exec_mode: 'cluster',
      // wait_ready: true,
    },
  ],
};
