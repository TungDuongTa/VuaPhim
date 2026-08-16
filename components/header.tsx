"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Clock,
  Gem,
  Home,
  Library,
  Menu,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand, SearchTrigger } from "@/components/search-command";
import { cn } from "@/lib/utils";
import { HeaderAuthButton } from "@/components/auth/header-auth-button";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) setIsVisible(true);
      else if (currentScrollY > lastScrollY) setIsVisible(false);
      else setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/browse", label: "Khám phá", icon: Library },
    { href: "/bookmarks", label: "Theo dõi", icon: Bookmark },
    { href: "/history", label: "Lịch sử", icon: Clock },
    { href: "/ranking", label: "BXH", icon: Trophy },
    { href: "/shop", label: "Cửa Hàng", icon: Gem },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 max-w-screen border-b border-border/80 bg-background/95 shadow-lg shadow-black/5 backdrop-blur transition-transform duration-300 supports-[backdrop-filter]:bg-background/80 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-xl px-2 py-1 transition-colors hover:bg-secondary/30"
            >
              <span className="brand-pink-mask text-2xl font-bold tracking-tight md:text-4xl">
                VuaPhim
              </span>
            </Link>
            <div className="hidden max-w-xl flex-1 px-2 md:block">
              <SearchTrigger onClick={() => setSearchOpen(true)} />
            </div>
            <div className="flex items-center gap-2 overflow-visible rounded-xl border border-border/70 bg-card/50 px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/70 md:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <HeaderAuthButton />
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/70 lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="hidden border-t border-border/70 bg-gradient-to-r from-secondary/25 via-secondary/10 to-secondary/25 lg:block">
            <nav className="flex h-12 items-center justify-start gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActiveLink(link.href) ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all",
                    isActiveLink(link.href)
                      ? "border-primary/35 bg-primary/15 text-primary shadow-sm shadow-primary/10"
                      : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          {isMenuOpen && (
            <div className="border-t border-border py-4 lg:hidden">
              <div className="mt-3 border-t border-border/70 pt-3">
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                  <ThemeToggle />
                </div>
              </div>
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium",
                      isActiveLink(link.href)
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
      <div className="h-16 lg:h-28" />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
