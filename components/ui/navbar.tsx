"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "ACCUEIL", href: "/" },
  { label: "CONNEXION", href: "/auth/login" },
  { label: "INSCRIPTION", href: "/auth/login" },
  // { label: "CONTACTEZ NOUS", href: "/contact" },
];

const contactInfo = [
  { icon: Phone, label: "+33 1 23 45 67 89", href: "tel:+33123456789" },
  { icon: Mail, label: "contact@secure-acompte.fr", href: "mailto:contact@secure-acompte.fr" },
  { icon: MapPin, label: "123 Avenue des Champs-Élysées, Paris", href: "https://maps.google.com" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed w-full z-50 transition-all duration-300",
      scrolled ? "bg-white shadow-md" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className={cn(
                "text-2xl font-bold transition-colors duration-300",
                scrolled ? "text-[#dd7109]" : "text-white"
              )}
            >
                Secure Acompte
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  scrolled 
                    ? pathname === item.href
                      ? "text-[#dd7109]"
                      : "text-gray-800 hover:text-[#dd7109]"
                    : pathname === item.href
                      ? "text-[#dd7109]"
                      : "text-gray-300 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                scrolled 
                  ? "text-gray-800 hover:bg-gray-100" 
                  : "text-white hover:bg-white/10"
              )}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-[#1a1a1a] lg:hidden transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link href="/" className="text-2xl font-bold text-[#dd7109]">
              Secure Acompte
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col p-6 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg py-3 transition-all duration-300 relative group",
                  pathname === item.href
                    ? "text-[#dd7109]"
                    : "text-white/90 hover:text-[#dd7109]"
                )}
                style={{
                  transitionDelay: `${index * 50}ms`,
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateX(0)" : "translateX(20px)",
                }}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#dd7109] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-auto p-6 bg-white/5">
            <h3 className="text-[#dd7109] font-semibold mb-4">CONTACTEZ-NOUS</h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 text-white/80 hover:text-[#dd7109] transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-white/80 hover:text-[#dd7109] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}