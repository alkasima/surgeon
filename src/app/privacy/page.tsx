"use client";

import Link from 'next/link';
import SiteFooter from '@/components/layout/site-footer';
import { useEffect } from 'react';

const sections = [
	{ id: 'overview', title: '1. Overview' },
	{ id: 'information-we-collect', title: '2. Information We Collect' },
	{ id: 'how-we-use-information', title: '3. How We Use Information' },
	{ id: 'reddit-data', title: '4. Reddit Data & Analysis' },
	{ id: 'ai-processing', title: '5. AI Processing' },
	{ id: 'data-sharing', title: '6. Data Sharing' },
	{ id: 'data-security', title: '7. Data Security' },
	{ id: 'your-rights', title: '8. Your Rights' },
	{ id: 'cookies', title: '9. Cookies & Tracking' },
	{ id: 'international', title: '10. International Users' },
	{ id: 'children', title: "11. Children's Privacy" },
	{ id: 'changes', title: '12. Policy Changes' },
	{ id: 'contact', title: '13. Contact Us' },
];

export default function PrivacyPage() {
	useEffect(() => {
		const onScroll = () => {
			const offsets = sections.map(s => {
				const el = document.getElementById(s.id);
				if (!el) return { id: s.id, top: Number.POSITIVE_INFINITY };
				return { id: s.id, top: el.getBoundingClientRect().top };
			});
			const active = offsets
				.filter(o => o.top <= 160)
				.sort((a, b) => b.top - a.top)[0]?.id;
			if (active) {
				sections.forEach(s => {
					const link = document.querySelector(`a[href="#${s.id}"]`);
					if (link) {
						(link as HTMLElement).classList.toggle('bg-purple-50', s.id === active);
						(link as HTMLElement).classList.toggle('text-purple-700', s.id === active);
						(link as HTMLElement).classList.toggle('font-semibold', s.id === active);
					}
				});
			}
		};
		onScroll();
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<div className="font-sans bg-gray-50 min-h-screen">
			{/* Nav */}
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">F</span>
							</div>
							<Link href="/" className="text-gray-900 font-bold text-xl">FollicleFlow</Link>
						</div>
						<div className="flex items-center space-x-6">
							<Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors">Home</Link>
							<a href="/#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
							<Link href="/support" className="text-gray-600 hover:text-purple-600 transition-colors">Help Center</Link>
							<Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link>
							<span className="text-purple-600 font-semibold">Privacy</span>
							<Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors">Sign In</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="bg-gradient-to-br from-indigo-400 to-purple-600 py-12">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
					<p className="text-xl text-gray-100 mb-6">Your privacy and data security are our top priorities</p>
					<div className="bg-white/20 rounded-lg px-6 py-3 inline-block text-white text-sm">
						<span className="font-semibold">Last Updated:</span> December 15, 2024 • <span className="font-semibold">Version:</span> 2.1
					</div>
				</div>
			</section>

			{/* Main */}
			<section className="py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-4 gap-12">
						{/* Sidebar */}
						<div className="lg:col-span-1">
							<div className="sticky top-8 bg-white rounded-2xl p-6 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
								<h3 className="font-bold text-gray-900 mb-6">Table of Contents</h3>
								<nav className="space-y-2">
									{sections.map(s => (
										<a key={s.id} href={`#${s.id}`} className="block py-2 px-3 rounded-lg text-gray-700 text-sm hover:bg-gray-100">
											{s.title}
										</a>
									))}
								</nav>
								<div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
									<h4 className="font-semibold text-purple-900 mb-2">Quick Summary</h4>
									<ul className="text-sm text-purple-800 space-y-1">
										<li>• We protect your personal data</li>
										<li>• Reddit data is publicly sourced</li>
										<li>• AI processing is secure & private</li>
										<li>• You control your information</li>
										<li>• We never sell your data</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="lg:col-span-3">
							<div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 space-y-12">
								{/* Overview */}
								<section id="overview" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">1. Overview</h2>
									<div className="bg-sky-50 border-l-4 border-sky-500 p-6 rounded-lg mb-6">
										<h3 className="font-semibold text-gray-900 mb-3">In Simple Terms</h3>
										<p className="text-gray-700">FollicleFlow helps you research hair transplant surgeons by collecting publicly available information and organizing it for you. We take your privacy seriously and only collect what's necessary.</p>
									</div>
									<p className="text-gray-700">This Privacy Policy describes how we collect, use, and protect your personal information when you use our platform.</p>
								</section>

								{/* Information We Collect */}
								<section id="information-we-collect" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
									<div className="space-y-8">
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information You Provide</h3>
											<ul className="space-y-2 text-gray-700 bg-gray-50 rounded-lg p-6">
												<li>• Account info: name, email, preferences</li>
												<li>• Research data: surgeons, notes, photos</li>
												<li>• Communications via support or contact forms</li>
												<li>• Payment info via secure providers</li>
											</ul>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">Automatically Collected</h3>
											<ul className="space-y-2 text-gray-700 bg-gray-50 rounded-lg p-6">
												<li>• Usage data and feature interactions</li>
												<li>• Device info and IP address</li>
												<li>• Logs and performance metrics</li>
											</ul>
										</div>
									</div>
								</section>

								{/* How We Use */}
								<section id="how-we-use-information" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
									<div className="grid md:grid-cols-2 gap-6">
										<div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
											<h3 className="font-semibold text-gray-900 mb-3">✅ What We Do</h3>
											<ul className="space-y-2 text-gray-700 text-sm">
												<li>• Provide and improve services</li>
												<li>• Generate Reddit intelligence</li>
												<li>• AI recommendations</li>
												<li>• Account updates and support</li>
											</ul>
										</div>
										<div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
											<h3 className="font-semibold text-gray-900 mb-3">❌ What We Don't Do</h3>
											<ul className="space-y-2 text-gray-700 text-sm">
												<li>• Sell your personal information</li>
												<li>• Share data with advertisers</li>
												<li>• Use data for unrelated purposes</li>
											</ul>
										</div>
									</div>
									<p className="mt-6 text-gray-700">We use your information solely to provide and improve FollicleFlow.</p>
								</section>

								{/* Reddit Data */}
								<section id="reddit-data" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">4. Reddit Data & Analysis</h2>
									<div className="bg-sky-50 border-l-4 border-sky-500 p-6 rounded-lg mb-6">
										<h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
										<p className="text-gray-700">We analyze publicly available Reddit posts and comments from relevant subreddits. This information is already public.</p>
									</div>
									<ul className="list-disc pl-6 text-gray-700 space-y-2">
										<li>Public subreddit posts mentioning surgeons</li>
										<li>User comments and experiences</li>
										<li>Before/after posts when publicly shared</li>
									</ul>
									<div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 text-green-800">
										<ul className="space-y-1">
											<li>• We only use public data</li>
											<li>• Usernames anonymized in reports</li>
											<li>• No private messages accessed</li>
										</ul>
									</div>
								</section>

								{/* AI Processing */}
								<section id="ai-processing" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">5. AI Processing</h2>
									<p className="text-gray-700 mb-4">AI helps analyze surgeon info, generate summaries, and provide recommendations. We protect your privacy by removing personal info before processing and using secure providers.</p>
									<ul className="list-disc pl-6 text-gray-700 space-y-2">
										<li>No personal data used to train models</li>
										<li>Encrypted processing</li>
										<li>Outputs stored securely</li>
									</ul>
								</section>

								{/* Data Sharing */}
								<section id="data-sharing" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">6. Data Sharing</h2>
									<div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
										<h3 className="font-semibold text-gray-900 mb-3">Important</h3>
										<p className="text-gray-700">We do not sell your personal information to third parties.</p>
									</div>
									<p className="text-gray-700">We may share limited data with service providers, or when required by law.</p>
								</section>

								{/* Data Security */}
								<section id="data-security" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">7. Data Security</h2>
									<div className="grid md:grid-cols-2 gap-6 text-gray-700">
										<ul className="space-y-2">
											<li>• TLS encryption in transit</li>
											<li>• Encrypted storage</li>
											<li>• Regular security audits</li>
										</ul>
										<ul className="space-y-2">
											<li>• Limited employee access</li>
											<li>• Incident response procedures</li>
											<li>• Regular backups</li>
										</ul>
									</div>
									<p className="mt-6 text-gray-700 text-sm">No system is 100% secure, but we continuously improve our practices.</p>
								</section>

								{/* Your Rights */}
								<section id="your-rights" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">8. Your Rights & Controls</h2>
									<div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
										<h3 className="font-semibold text-gray-900 mb-2">You Have Control</h3>
										<p className="text-gray-700">Manage your data via account settings or by contacting us.</p>
									</div>
									<div className="grid md:grid-cols-2 gap-6 text-gray-700">
										<ul className="space-y-2">
											<li>• Access & download</li>
											<li>• Correction</li>
											<li>• Deletion</li>
										</ul>
										<ul className="space-y-2">
											<li>• Portability</li>
											<li>• Opt-out of marketing</li>
											<li>• Restriction</li>
										</ul>
									</div>
									<div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6 text-sm text-purple-800">
										<p>Most actions are available in settings. For others, email privacy@follicleflow.com</p>
										<button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Manage Privacy Settings</button>
									</div>
								</section>

								{/* Cookies */}
								<section id="cookies" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">9. Cookies & Tracking</h2>
									<p className="text-gray-700 mb-4">We use essential, analytics, preference, and performance cookies.</p>
									<div className="bg-sky-50 border-l-4 border-sky-500 p-6 rounded-lg">
										<h3 className="font-semibold text-gray-900 mb-2">Cookie Controls</h3>
										<p className="text-gray-700 mb-2">Control cookies via your browser or our preference center.</p>
										<button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Manage Cookie Preferences</button>
									</div>
								</section>

								{/* International */}
								<section id="international" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">10. International Users</h2>
									<p className="text-gray-700">We comply with GDPR, CCPA, and other applicable laws. Cross-border transfers use appropriate safeguards.</p>
								</section>

								{/* Children */}
								<section id="children" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">11. Children's Privacy</h2>
									<div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
										<p className="text-gray-700">FollicleFlow is not intended for individuals under 18, and we do not knowingly collect data from children.</p>
									</div>
								</section>

								{/* Changes */}
								<section id="changes" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">12. Policy Changes</h2>
									<p className="text-gray-700">We may update this policy as needed. We'll notify you of significant changes and update the date above.</p>
									<div className="mt-4 bg-gray-50 rounded-lg p-6">
										<ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
											<li>Significant changes notified by email or in-app</li>
											<li>Minor edits reflected by Last Updated date</li>
										</ul>
									</div>
									<div className="mt-4 bg-sky-50 border border-sky-200 rounded-lg p-6">
										<button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Subscribe to Policy Updates</button>
									</div>
								</section>

								{/* Contact */}
								<section id="contact" className="scroll-mt-24">
									<h2 className="text-3xl font-bold text-gray-900 mb-6">13. Contact Us</h2>
									<div className="grid md:grid-cols-2 gap-8">
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Questions</h3>
											<div className="space-y-4">
												<div className="flex items-start space-x-3">
													<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
														<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
													</div>
													<div>
														<p className="font-medium text-gray-900">Email</p>
														<p className="text-gray-600 text-sm">privacy@follicleflow.com</p>
													</div>
												</div>
												<div className="flex items-start space-x-3">
													<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
														<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
													</div>
													<div>
														<p className="font-medium text-gray-900">Mailing Address</p>
														<p className="text-gray-600 text-sm">FollicleFlow, Inc., Attn: Privacy Officer, 123 Innovation Drive, Suite 400, San Francisco, CA 94105</p>
													</div>
												</div>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
											<div className="space-y-3">
												<button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">Submit Privacy Request</button>
												<button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">Download My Data</button>
												<button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">Delete My Account</button>
											</div>
											<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">Response Time: We respond within 30 days (or sooner as required by law).</div>
										</div>
									</div>
								</section>
							</div>
						</div>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}


