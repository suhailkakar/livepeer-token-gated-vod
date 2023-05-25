const withTM = require("next-transpile-modules")(["lit-share-modal-v3"])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  swcMinify: true,
})

module.exports = nextConfig
