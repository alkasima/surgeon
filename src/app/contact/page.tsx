"use client";

import Link from 'next/link';
import SiteFooter from '@/components/layout/site-footer';
import { useEffect, useRef } from 'react';

export default function ContactPage() {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		// noop placeholder for potential live status updates
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
							<span className="text-purple-600 font-semibold">Contact</span>
							<Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors">Sign In</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="bg-gradient-to-br from-indigo-400 to-purple-600 py-16">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Get in Touch</h1>
					<p className="text-xl text-gray-100 mb-8">We're here to help you succeed with your hair transplant research</p>
					<div className="bg-white/20 rounded-full px-6 py-3 inline-flex items-center space-x-2 mb-8">
						<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-white font-medium">Support team is online</span>
						<span className="text-gray-200">•</span>
						<span className="text-gray-200">Average response: 2 minutes</span>
					</div>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="py-16 -mt-8 relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
								<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.126A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Live Chat</h3>
							<p className="text-gray-600 mb-4">Get instant help from our support team</p>
							<div className="text-sm text-gray-500 mb-6">
								<div className="flex items-center justify-center mb-2">
									<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
									<span>Available now</span>
								</div>
								<p>Monday - Friday: 9 AM - 6 PM EST</p>
								<p>Average response: 2 minutes</p>
							</div>
							<button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors w-full" onClick={() => alert('Live chat would open here.')}>Start Chat</button>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Email Support</h3>
							<p className="text-gray-600 mb-4">Send detailed questions and get comprehensive answers</p>
							<div className="text-sm text-gray-500 mb-6">
								<p className="mb-2">support@follicleflow.com</p>
								<p>Response time: Within 24 hours</p>
								<p>Best for: Complex issues, feature requests</p>
							</div>
							<button className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors w-full" onClick={() => window.location.href = 'mailto:support@follicleflow.com?subject=Support Request'}>Send Email</button>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Video Call</h3>
							<p className="text-gray-600 mb-4">Schedule a screen share session for personalized help</p>
							<div className="text-sm text-gray-500 mb-6">
								<p className="mb-2">15 or 30 minute sessions</p>
								<p>Available: Monday - Friday</p>
								<p>Perfect for: Setup help, training</p>
							</div>
							<button className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors w-full" onClick={() => alert('Calendar booking would open here.')}>Schedule Call</button>
						</div>
						<div className="bg-white rounded-2xl p-8 shadow-lg text-center transition-transform hover:-translate-y-1">
							<div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">Phone Support</h3>
							<p className="text-gray-600 mb-4">Speak directly with our support team</p>
							<div className="text-sm text-gray-500 mb-6">
								<div className="flex items-center justify-center mb-2"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" /><span>Currently busy</span></div>
								<p>+1 (555) 123-4567</p>
								<p>Monday - Friday: 10 AM - 5 PM EST</p>
							</div>
							<button className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors w-full" onClick={() => alert('Dialer would open here.')}>Call Now</button>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section className="py-16 bg-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
						<p className="text-lg text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
					</div>
					<div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
						<form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert("Thank you! We'll respond within 24 hours."); }}>
							<div className="grid md:grid-cols-2 gap-8">
								<div className="relative">
									<input type="text" placeholder=" " className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
									<span className="absolute left-4 top-4 text-gray-500 pointer-events-none transition-all">First Name *</span>
								</div>
								<div className="relative">
									<input type="text" placeholder=" " className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
									<span className="absolute left-4 top-4 text-gray-500 pointer-events-none transition-all">Last Name *</span>
								</div>
							</div>
							<div className="grid md:grid-cols-2 gap-8">
								<div className="relative">
									<input type="email" placeholder=" " className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
									<span className="absolute left-4 top-4 text-gray-500 pointer-events-none transition-all">Email Address *</span>
								</div>
								<div className="relative">
									<input type="tel" placeholder=" " className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
									<span className="absolute left-4 top-4 text-gray-500 pointer-events-none transition-all">Phone Number (Optional)</span>
								</div>
							</div>
							<div className="relative">
								<select className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
									<option value="">Select a topic *</option>
									<option value="general">General Question</option>
									<option value="technical">Technical Support</option>
									<option value="billing">Billing & Account</option>
									<option value="feature">Feature Request</option>
									<option value="reddit">Reddit Analysis Help</option>
									<option value="bulk-upload">Bulk Upload Issues</option>
									<option value="surgeon-finder">Surgeon Finder Help</option>
									<option value="ai-features">AI Features</option>
									<option value="bug">Bug Report</option>
									<option value="other">Other</option>
								</select>
							</div>
							<div className="relative">
								<textarea rows={6} placeholder=" " className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" required />
								<span className="absolute left-4 top-4 text-gray-500 pointer-events-none transition-all">How can we help you? *</span>
							</div>
							<div className="bg-white rounded-xl p-6 border border-gray-200">
								<h4 className="font-semibold text-gray-900 mb-4">Attachments (Optional)</h4>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
									<svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
									<p className="text-gray-600 mb-2">Drop files here or click to upload</p>
									<p className="text-sm text-gray-500">Screenshots, CSV files, or documents (Max 10MB)</p>
									<input ref={fileInputRef} type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx" />
									<button type="button" className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => fileInputRef.current?.click()}>Choose Files</button>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<input type="checkbox" className="text-purple-600 focus:ring-purple-500 rounded" id="newsletter" />
								<label htmlFor="newsletter" className="text-gray-700">I'd like to receive helpful tips and product updates via email</label>
							</div>
							<button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300">Send Message</button>
						</form>
					</div>
				</div>
			</section>

			{/* Before You Contact */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Before You Contact Us</h2>
						<p className="text-lg text-gray-600">Check if your question is already answered</p>
					</div>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="bg-white rounded-2xl p-6 shadow-lg">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Quick Answers</h3>
							<div className="space-y-3">
								<div className="flex items-start space-x-3">
									<div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
									<div>
										<p className="font-medium text-gray-900">How do I reset my password?</p>
										<p className="text-sm text-gray-600">Use the "Forgot Password" link on the login page</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
									<div>
										<p className="font-medium text-gray-900">Can I cancel my subscription?</p>
										<p className="text-sm text-gray-600">Yes, anytime from your account settings</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
									<div>
										<p className="font-medium text-gray-900">How does Reddit analysis work?</p>
										<p className="text-sm text-gray-600">We scan Reddit for surgeon mentions and reviews</p>
									</div>
								</div>
							</div>
							<Link href="/support" className="inline-flex items-center text-purple-600 font-medium mt-4 hover:text-purple-700">View all FAQs<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></Link>
						</div>
						<div className="bg-white rounded-2xl p-6 shadow-lg">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Help Resources</h3>
							<div className="space-y-4">
								<a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
									</div>
									<div>
										<p className="font-medium text-gray-900">Getting Started Guide</p>
										<p className="text-sm text-gray-600">Step-by-step setup instructions</p>
									</div>
								</a>
								<a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
									<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
									</div>
									<div>
										<p className="font-medium text-gray-900">Video Tutorials</p>
										<p className="text-sm text-gray-600">Watch how to use key features</p>
									</div>
								</a>
								<a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
									</div>
									<div>
										<p className="font-medium text-gray-900">Knowledge Base</p>
										<p className="text-sm text-gray-600">Comprehensive help articles</p>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Office Info */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Our Office</h2>
						<p className="text-lg text-gray-600">Visit us or send mail to our headquarters</p>
					</div>
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
									<p className="text-gray-600">123 Innovation Drive<br />Suite 400<br />San Francisco, CA 94105<br />United States</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
									<div className="text-gray-600 space-y-1">
										<p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
										<p>Saturday: 10:00 AM - 2:00 PM PST</p>
										<p>Sunday: Closed</p>
										<p className="text-sm text-purple-600 font-medium mt-2">Live chat available during business hours</p>
									</div>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
									<div className="text-gray-600 space-y-1">
										<p>Email: support@follicleflow.com</p>
										<p>Phone: +1 (555) 123-4567</p>
										<p>Emergency: +1 (555) 123-4568</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
							<div className="text-center">
								<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
								<p className="text-gray-500 font-medium">Interactive Map</p>
								<p className="text-sm text-gray-400">San Francisco, CA</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}


