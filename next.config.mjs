/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["oslo"],
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "utfs.io",
			},
		],
	},
	output: "standalone",
};

export default nextConfig;
