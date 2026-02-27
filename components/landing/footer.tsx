"use client"
import Link from "next/link"
import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  platform: [
    { name: "Comment ça marche", href: "#how-it-works" },
    { name: "Louer un véhicule", href: "/vehicles" },
    { name: "Mettre en location", href: "/list-vehicle" },
    { name: "Tarifs", href: "#pricing" },
  ],
  support: [
    { name: "Centre d'aide", href: "/help" },
    { name: "FAQ", href: "/faq" },
    { name: "Nous contacter", href: "/contact" },
    { name: "Signaler un problème", href: "/report" },
  ],
  legal: [
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Politique de cookies", href: "/cookies" },
    { name: "Mentions légales", href: "/legal" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Car className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">AUTOLOCO</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                La première plateforme de location de véhicules entre particuliers et professionnels au Cameroun.
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Plateforme</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">Recevez nos dernières offres et actualités.</p>
              <form className="flex gap-2">
                <Input type="email" placeholder="Votre email" className="h-10" />
                <Button size="sm" className="h-10 px-4">
                  <Mail className="h-4 w-4" />
                </Button>
              </form>

              {/* Contact info */}
              <div className="mt-6 space-y-2">
                <a
                  href="tel:+237600000000"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +237 6 00 00 00 00
                </a>
                <a
                  href="mailto:contact@autoloco.cm"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  contact@autoloco.cm
                </a>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Douala, Cameroun
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AUTOLOCO. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <img
              src="/mtn-mobile-money-logo.svg"
              alt="MTN Mobile Money"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
            <img
              src="/orange-money-logo.svg"
              alt="Orange Money"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
            <img
              src="/visa-card-logo.svg"
              alt="Visa"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
            <img
              src="/mastercard-logo.svg"
              alt="Mastercard"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
