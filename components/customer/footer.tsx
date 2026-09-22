import Link from 'next/link'

export default function CustomerFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            ANJIBABU<span className="text-orange-500">JOB</span>.COM
          </h3>
          <p className="text-sm text-slate-400">
            Better Jobs, Brighter Future. Your Needs, Our Priority.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-blue-400">Home</Link></li>
            <li><Link href="/jobs" className="hover:text-blue-400">Browse Jobs</Link></li>
            <li><Link href="/admin/login" className="hover:text-blue-400">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/jobs?category=Drivers" className="hover:text-blue-400">Drivers</Link></li>
            <li><Link href="/jobs?category=Delivery+Boys" className="hover:text-blue-400">Delivery Boys</Link></li>
            <li><Link href="/jobs?category=Security+Guards" className="hover:text-blue-400">Security Guards</Link></li>
            <li><Link href="/jobs?category=Office+Staff" className="hover:text-blue-400">Office Staff</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact Us</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Email: support@anjibabujob.com</li>
            <li>Phone: +91 1234567890</li>
            <li>Location: Hyderabad, India</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        &copy; {new Date().getFullYear()} ANJIBABUJOB.COM. All rights reserved.
      </div>
    </footer>
  )
}
