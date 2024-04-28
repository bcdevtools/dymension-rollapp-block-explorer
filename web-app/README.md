## Run with PM2

### First start

1. Install PM2

```shell
sudo npm i pm2 -g
```

2. Install web-app dependencies

```shell
npm i
```

3. Build

```shell
npm run build
```

4. Start

```shell
pm2 start pm2.config.js
```

### Update Web-app

1. Rebuild

```shell
npm run build
```

2. Restart web-app

```shell
pm2 restart web-app

# if run with multi instances, use reload will make zero downtime deployment
pm2 reload web-app
```

### Some PM2 commands

```shell
# Check current status
pm2 ls

# Check logs, see more options at https://pm2.keymetrics.io/docs/usage/log-management/
pm2 logs web-app
pm2 logs web-app --lines 200

# Managing
pm2 restart web-app
pm2 reload web-app
pm2 stop web-app
pm2 delete web-app
```

### Notes

Uncomment these lines of code to run server with multi instances

```json
instances: 0, //means No of instances = No of logical cores
exec_mode: 'cluster',
wait_ready: true,
```
