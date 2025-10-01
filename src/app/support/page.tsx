"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SiteFooter from '@/components/layout/site-footer';

interface FaqItem {
	question: string;
	answer: string;
}

export default function SupportPage() {
	const [search, setSearch] = useState('');
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const faqs: FaqItem[] = useMemo(() => [
		{
			question: 'How do I add a new surgeon to my list?',
			answer: 'Use the finder tool, manually add details, or bulk upload from CSV. Go to the dashboard and click "Add Surgeon".'
		},
		{
			question: 'How does the Reddit analysis feature work?',
			answer: 'We search Reddit communities like r/hairtransplants and r/tressless and analyze mentions for each surgeon.'
		},
		{
			question: 'Can I upload my existing research from spreadsheets?',
			answer: 'Yes. Export your spreadsheet as CSV and upload it. We organize surgeons, notes, and contact info automatically.'
		},
		{
			question: 'Is my data secure and private?',
			answer: 'Yes. Data is encrypted in transit and at rest. We never share your personal information.'
		},
		{
			question: 'How does the AI analysis work?',
			answer: 'AI evaluates reviews, prices, location, Reddit feedback, and your notes to provide an objective recommendation.'
		},
		{
			question: 'Can I cancel my subscription anytime?',
			answer: 'You can cancel anytime. Access remains until the end of the billing period, and you can export your data.'
		},
	], []);

	const filteredFaqs = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return faqs;
		return faqs.filter(f => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term));
	}, [faqs, search]);

	return (
		<div className="font-sans bg-gray-50 min-h-screen">
			{/* Simple Nav */}
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
							<span className="text-purple-600 font-semibold">Support</span>
							<Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors">Sign In</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="bg-gradient-to-br from-indigo-400 to-purple-600 py-16">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">How Can We Help You?</h1>
					<p className="text-xl text-gray-100 mb-8">Find answers, get support, and make the most of your FollicleFlow experience</p>
					<div className="relative max-w-2xl mx-auto">
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search for help articles, features, or common questions..."
							className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
						/>
						<button className="absolute right-2 top-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
						</button>
					</div>
				</div>
			</section>

			{/* Quick Help */}
			<section className="py-16 -mt-8 relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.126A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
								</svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Live Chat Support</h3>
							<p className="text-gray-600 mb-6">Instant help from our support team. 9 AM - 6 PM EST, Mon-Fri.</p>
							<button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors w-full" onClick={() => alert('Live chat would open here.')}>Start Chat</button>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
								</svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Email Support</h3>
							<p className="text-gray-600 mb-6">Send a detailed message. We respond within 24 hours.</p>
							<button className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors w-full" onClick={() => alert('Email form would open here: support@follicleflow.com')}>Send Email</button>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
								</svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Video Tutorials</h3>
							<p className="text-gray-600 mb-6">Watch step-by-step guides to master every feature.</p>
							<button className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors w-full" onClick={() => alert('Video tutorial library would open here.')}>Watch Videos</button>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="py-16 bg-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
						<p className="text-lg text-gray-600">Quick answers to the most common questions</p>
					</div>
					<div className="space-y-4">
						{filteredFaqs.map((f, i) => (
							<div key={i} className="bg-gray-50 rounded-lg border border-gray-200">
								<button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
									<span className="font-semibold text-gray-900">{f.question}</span>
									<svg className={`w-5 h-5 text-gray-500 transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
									</svg>
								</button>
								<div className={`px-6 pb-4 overflow-hidden transition-[max-height] duration-300 ${openIndex === i ? 'max-h-40' : 'max-h-0'}`}>
									<p className="text-gray-600">{f.answer}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Getting Started */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started with FollicleFlow</h2>
						<p className="text-lg text-gray-600">Follow these simple steps to organize your research</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{['Sign Up','Add Surgeons','Track Progress','Make Decision'].map((step, idx) => (
							<div key={idx} className="text-center">
								<div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">{idx+1}</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{step}</h3>
								<p className="text-gray-600">{idx===0?'Create your free account and start your 7-day trial': idx===1?'Use the finder tool or bulk upload your existing research': idx===2?'Log consultations, quotes, and communications':'Use AI analysis to choose the best surgeon for you'}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Contact */}
			<section className="py-16 bg-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
						<p className="text-lg text-gray-600">Our support team is here to help you succeed</p>
					</div>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="bg-gray-50 rounded-2xl p-8">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
							<div className="space-y-4">
								<div className="flex items-center space-x-3">
									<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
									<span className="text-gray-700">support@follicleflow.com</span>
								</div>
								<div className="flex items-center space-x-3">
									<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
									<span className="text-gray-700">Monday - Friday, 9 AM - 6 PM EST</span>
								</div>
								<div className="flex items-center space-x-3">
									<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.126A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path></svg>
									<span className="text-gray-700">Live chat available during business hours</span>
								</div>
							</div>
						</div>
						<div className="bg-purple-50 rounded-2xl p-8">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h3>
							<form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll get back to you within 24 hours."); }}>
								<input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
								<input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
								<textarea placeholder="How can we help you?" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
								<button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Send Message</button>
							</form>
						</div>
					</div>
				</div>
			</section>
			<SiteFooter />
		</div>
	);
}


