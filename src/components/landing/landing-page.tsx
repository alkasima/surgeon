"use client";

import Link from 'next/link';
import SiteFooter from '@/components/layout/site-footer';
import { useEffect, useState } from 'react';

export default function LandingPage() {
	const [navSolid, setNavSolid] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setNavSolid(window.scrollY > 50);
		};
		onScroll();
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<div className="font-sans">
			{/* Navigation */}
			<nav className={`fixed w-full z-50 transition-colors ${navSolid ? 'bg-[rgba(102,126,234,0.95)]' : 'bg-[rgba(255,255,255,0.1)]'} backdrop-blur-md border-b border-white/20`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
								<span className="text-purple-600 font-bold text-lg">F</span>
							</div>
							<span className="text-white font-bold text-xl">FollicleFlow</span>
						</div>
						<Link href="/signup" className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-600">
				<div className="absolute inset-0 opacity-10">
					<div className="animate-[float_3s_ease-in-out_infinite] absolute top-20 left-10 w-20 h-20 bg-white rounded-full" />
					<div className="animate-[float_3s_ease-in-out_infinite] absolute top-40 right-20 w-16 h-16 bg-white rounded-full" style={{ animationDelay: '1s' }} />
					<div className="animate-[float_3s_ease-in-out_infinite] absolute bottom-40 left-1/4 w-12 h-12 bg-white rounded-full" style={{ animationDelay: '2s' }} />
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="text-white">
							<h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
								Don't Risk Your <span className="text-red-200">$20,000</span> on the Wrong Surgeon
							</h1>
							<p className="text-xl mb-8 text-gray-100/90 leading-relaxed">
								A bad hair transplant is permanent. One wrong choice and you'll spend years regretting it. FollicleFlow helps you research, compare, and choose the right surgeon with confidence.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Link href="/signup" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-colors">
									Start Free Trial - $1.99/month
								</Link>
								<Link href="#features" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
									Watch Demo
								</Link>
							</div>
							<p className="text-sm text-gray-100/80 mt-4">✨ No credit card required • 7-day free trial</p>
						</div>

						<div className="relative">
							<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
								<div className="bg-white rounded-xl p-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-bold text-gray-800">Your Dashboard</h3>
										<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
									</div>
									<div className="space-y-3">
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<span className="text-sm font-medium">Dr. Smith Clinic</span>
											<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Consultation Booked</span>
										</div>
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<span className="text-sm font-medium">Hair Restore Center</span>
											<span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Quote Received</span>
										</div>
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<span className="text-sm font-medium">Elite Hair Solutions</span>
											<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Research Complete</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Problem Section */}
			<section className="py-20 bg-red-50 border-t-4 border-red-500" id="problem">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-red-900 mb-6">The Harsh Reality of Bad Hair Transplants</h2>
						<p className="text-xl text-red-700 max-w-4xl mx-auto leading-relaxed">Every year, thousands of people make the wrong choice and live with the consequences forever. Don't let poor research ruin your life and waste your money.</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8 mb-12">
						<div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-red-500">
							<div className="text-3xl font-bold text-red-600 mb-4">$20,000+</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Money Down the Drain</h3>
							<p className="text-gray-700">A botched transplant means starting over. That's another $20K+ to fix what went wrong the first time.</p>
						</div>
						<div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-red-500">
							<div className="text-3xl font-bold text-red-600 mb-4">2-3 Years</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Lost Time</h3>
							<p className="text-gray-700">Repair procedures take years to complete. Years of looking worse than when you started.</p>
						</div>
						<div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-red-500">
							<div className="text-3xl font-bold text-red-600 mb-4">Permanent</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Damage</h3>
							<p className="text-gray-700">Some mistakes can't be fixed. Scarring and poor hairlines can be permanent reminders of a bad choice.</p>
						</div>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-red-900 mb-4">Don't become another horror story.</p>
						<p className="text-lg text-red-700">Research properly. Choose wisely. Your future self will thank you.</p>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-gray-50" id="features">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need in One Place</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">Replace the overwhelming chaos of spreadsheets with an intelligent system designed specifically for your hair restoration journey.</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								title: 'Find Surgeons',
								desc: 'Discover qualified hair transplant surgeons in your area with our built-in search tool.',
								color: 'purple'
							},
							{
								title: 'Reddit Intelligence',
								desc: "Get real patient experiences from Reddit discussions about each surgeon.",
								color: 'red'
							},
							{
								title: 'Bulk Upload',
								desc: 'Import multiple surgeons at once from your existing research.',
								color: 'blue'
							},
							{
								title: 'Track Everything',
								desc: 'Monitor consultations, quotes, reviews, and communications in one dashboard.',
								color: 'green'
							},
							{
								title: 'AI Analysis',
								desc: 'Get unbiased AI recommendations based on your research data.',
								color: 'yellow'
							},
							{
								title: 'Photo Management',
								desc: 'Store and organize consultation photos and progress securely.',
								color: 'indigo'
							},
						].map((f, i) => (
							<div key={i} className="feature-card bg-white rounded-2xl p-8 shadow-lg transition-transform hover:-translate-y-2">
								<div className={`w-16 h-16 bg-${f.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
									<span className={`w-8 h-8 text-${f.color}-600`}>★</span>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
								<p className="text-gray-600 leading-relaxed">{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Reddit Feature Highlight */}
			<section className="py-20 bg-gradient-to-r from-orange-500 to-red-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="text-white">
							<h2 className="text-4xl font-bold mb-6">What Are Patients Really Saying?</h2>
							<p className="text-xl mb-8 text-orange-100 leading-relaxed">Doctors show you their best work. But what do real patients say when they think no one's listening? Our Reddit intelligence reveals the unfiltered truth about every surgeon.</p>
							<div className="space-y-3">
								<p className="text-orange-100">✓ Real patient experiences from Reddit discussions</p>
								<p className="text-orange-100">✓ Unbiased reviews and horror stories</p>
								<p className="text-orange-100">✓ Automatically updated with new discussions</p>
							</div>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-2xl">
							<div className="flex items-center space-x-3 mb-6">
								<div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
									<span className="text-white font-bold">r/</span>
								</div>
								<h3 className="font-bold text-gray-900">Reddit Intelligence Report</h3>
							</div>
							<div className="space-y-4">
								<div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
									<p className="text-sm text-red-800 font-medium">"Avoid Dr. X - terrible hairline, looks unnatural"</p>
									<p className="text-xs text-red-600 mt-1">r/hairtransplants • 23 upvotes</p>
								</div>
								<div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
									<p className="text-sm text-green-800 font-medium">"Dr. Y changed my life, amazing results"</p>
									<p className="text-xs text-green-600 mt-1">r/tressless • 156 upvotes</p>
								</div>
								<div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
									<p className="text-sm text-yellow-800 font-medium">"Dr. Z is expensive but worth every penny"</p>
									<p className="text-xs text-yellow-600 mt-1">r/hairtransplants • 89 upvotes</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Social Proof */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Hair Restoration Patients</h2>
						<div className="flex justify-center items-center space-x-8">
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600">500+</div>
								<div className="text-gray-600">Surgeons Tracked</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600">1,200+</div>
								<div className="text-gray-600">Consultations Organized</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600">98%</div>
								<div className="text-gray-600">Feel More Confident</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gradient-to-br from-indigo-400 to-purple-600 py-20">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<h2 className="text-4xl font-bold text-white mb-6">Don't Make a $20,000 Mistake</h2>
					<p className="text-xl text-gray-100 mb-8">Your hair transplant decision is permanent. Make sure you get it right the first time with FollicleFlow's comprehensive research tools.</p>
					<div className="bg-red-600 text-white p-4 rounded-lg mb-8 border-2 border-red-400">
						<p className="font-bold text-lg">⚠ WARNING: Poor research leads to poor results</p>
						<p className="text-red-100">Don't trust your future to Google searches and scattered notes</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/signup" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-colors">
							Protect Your Investment - Start Free Trial
						</Link>
						<Link href="#features" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
							See How It Works
						</Link>
					</div>
					<p className="text-sm text-gray-100 mt-6">Only $1.99/month after trial • Less than the cost of a coffee • Your future is worth it</p>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}


