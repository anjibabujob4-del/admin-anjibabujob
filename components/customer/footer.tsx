import Link from 'next/link'

export default function CustomerFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
        <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-1">
          <h3 className="text-2xl font-black text-white tracking-tight">
            ANJIBABU<span className="text-orange-500">JOB</span>.COM
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Better Jobs, Brighter Future. Your Needs, Our Priority. Connecting workers with verified employers across India.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-5 uppercase text-sm tracking-wider">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-blue-400 transition-colors inline-block py-1">Home</Link></li>
            <li><Link href="/jobs" className="hover:text-blue-400 transition-colors inline-block py-1">Browse Jobs</Link></li>
            <li><Link href="/admin/login" className="hover:text-blue-400 transition-colors inline-block py-1">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-5 uppercase text-sm tracking-wider">Popular Categories</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/jobs?category=Drivers" className="hover:text-blue-400 transition-colors inline-block py-1">Drivers</Link></li>
            <li><Link href="/jobs?category=Delivery+Boys" className="hover:text-blue-400 transition-colors inline-block py-1">Delivery Boys</Link></li>
            <li><Link href="/jobs?category=Security+Guards" className="hover:text-blue-400 transition-colors inline-block py-1">Security Guards</Link></li>
            <li><Link href="/jobs?category=Office+Staff" className="hover:text-blue-400 transition-colors inline-block py-1">Office Staff</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-5 uppercase text-sm tracking-wider">Contact Us</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex flex-col">
              <span className="text-xs text-slate-500 mb-1">Email</span>
              <a href="mailto:support@anjibabujob.com" className="hover:text-white transition-colors">support@anjibabujob.com</a>
            </li>
            <li className="flex flex-col">
              <span className="text-xs text-slate-500 mb-1">Phone</span>
              <a href="tel:+916309981444" className="hover:text-white transition-colors">+91 6309981444</a>
            </li>
            <li className="flex flex-col">
              <span className="text-xs text-slate-500 mb-1">Location</span>
              <span>Hyderabad, India</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} ANJIBABUJOB.COM. All rights reserved.</p>
        <p>Built for the future of work.</p>
      </div>
    </footer>
  )
}
