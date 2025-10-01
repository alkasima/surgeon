"use client";

import Link from 'next/link';

export default function SiteFooter() {
	return (
		<footer className="bg-gray-900 text-white py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center space-x-2 mb-4">
							<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">F</span>
							</div>
							<span className="font-bold text-xl">FollicleFlow</span>
						</div>
						<p className="text-gray-400">Take control of your hair transplant journey with confidence.</p>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Product</h4>
						<ul className="space-y-2 text-gray-400">
							<li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
							<li><Link href="/credits" className="hover:text-white transition-colors">Pricing</Link></li>
							<li><a href="#features" className="hover:text-white transition-colors">Demo</a></li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Support</h4>
						<ul className="space-y-2 text-gray-400">
							<li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
							<li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
							<li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Connect</h4>
						<ul className="space-y-2 text-gray-400">
							<li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
							<li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
							<li><a href="#" className="hover:text-white transition-colors">Reddit</a></li>
						</ul>
					</div>
				</div>
				<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
					<p>© 2024 FollicleFlow. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}


