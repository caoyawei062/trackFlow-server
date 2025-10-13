module.exports = {
  apps: [
    {
      name: "trackflow-prod",
      script: "./dist/app.js",
      instances: "max", // 使用所有CPU核心
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      cron_restart: "0 3 * * *", // 每天凌晨3点重启
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
    },
    {
      name: "trackflow-dev",
      script: "./src/app.ts",
      interpreter: "ts-node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: true,
      watch_delay: 1000,
      ignore_watch: [
        "node_modules",
        "dist",
        "logs",
        ".git",
        "*.log",
      ],
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      error_file: "./logs/pm2-dev-error.log",
      out_file: "./logs/pm2-dev-out.log",
      log_file: "./logs/pm2-dev-combined.log",
      time: true,
    },
  ],
};
