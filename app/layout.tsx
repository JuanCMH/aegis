import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Insurance",
		template: "%s | Insurance",
	},
	description: "",
	keywords: [],
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: "/isotipo.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html lang="es" suppressHydrationWarning>
				<body className={`${outfit.variable} antialiased`}>
					<NuqsAdapter>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							storageKey="nexus-theme"
						>
							<ConvexClientProvider>
								<JotaiProvider>
									{children}
									<ModalProvider />
								</JotaiProvider>
							</ConvexClientProvider>
						</ThemeProvider>
					</NuqsAdapter>
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	);
}
