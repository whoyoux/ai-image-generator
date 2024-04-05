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
};

export default nextConfig;
