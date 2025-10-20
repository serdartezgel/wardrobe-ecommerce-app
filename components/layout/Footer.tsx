"use client";

import Link from "next/link";

import { footerLinks, socialLinks } from "@/lib/constants/footerLinks";

const Footer = () => {
  return (
    <footer className="border-border bg-background/50 border-t backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-foreground font-space-grotesk mb-4 text-lg font-semibold">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-border my-10 border-t" />

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary font-space-grotesk font-medium">
              {" "}
              WARDROBE
            </span>
            . All rights reserved.
          </p>

          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary text-muted-foreground transition-colors"
              >
                <Icon className="size-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
