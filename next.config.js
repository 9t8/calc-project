/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config) => {
    config.externals.push({
      sharp: "commonjs sharp",
    });

    return config;
  },
};

module.exports = nextConfig;
