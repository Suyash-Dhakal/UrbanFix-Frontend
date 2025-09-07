import { Link } from "react-router-dom"
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 shadow-inner pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-teal-500" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">UrbanFix</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Empowering citizens to report and resolve urban issues for a better community.
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/issues"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 text-sm"
                >
                  Issues
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 text-sm"
                >
                  Map
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/report"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 text-sm"
                >
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Bijayapur Sadak, Dharan</span>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>contact@urbanfix.com</span>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+977 9842476397</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} UrbanFix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
