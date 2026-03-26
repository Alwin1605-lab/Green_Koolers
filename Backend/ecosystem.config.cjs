module.exports = {
  apps: [
    {
      name: "consultancy-backend",
      script: "src/index.js",
      cwd: __dirname,
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      min_uptime: "10s",
      restart_delay: 5000,
      kill_timeout: 5000,
      time: true
    }
  ]
}
