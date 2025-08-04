"use client"

import { Button } from "@/components/ui/button"
import {
  UserCircle,
  LogOut,
  Loader2,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Command,
  HelpCircle,
  Zap,
  User,
  Palette,
  Coins,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FollicleFlowLogo } from "@/components/icons"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Breadcrumb mapping for better navigation
const getBreadcrumb = (pathname: string) => {
  const routes: Record<string, string[]> = {
    "/": ["Dashboard"],
    "/add-surgeon": ["Dashboard", "Add Surgeon"],
    "/find-surgeons": ["Dashboard", "Find Surgeons"],
    "/profile": ["Dashboard", "Profile Settings"],
    "/admin/users": ["Dashboard", "Admin", "User Management"],
  }
  return routes[pathname] || ["Dashboard"]
}

export function AppHeader() {
  const { isMobile } = useSidebar()
  const { user, logOut, loading: authLoading, isAdmin } = useAuth()
  const { userData } = useUser()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [notificationCount] = useState(3)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const breadcrumb = getBreadcrumb(pathname)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "Escape" && searchFocused) {
        searchRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchFocused])

  return (
    <header className="sticky top-0 z-50 flex h-16 sm:h-18 items-center gap-2 sm:gap-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 px-3 sm:px-4 md:px-6 dark:border-slate-800/60 dark:bg-slate-950/80 dark:supports-[backdrop-filter]:bg-slate-950/60">
      {/* Mobile menu trigger */}
      {!authLoading && user && isMobile && (
        <SidebarTrigger className="hover:bg-slate-100 hover:text-slate-900 transition-colors rounded-lg p-2 dark:hover:bg-slate-800 dark:hover:text-slate-100" />
      )}

      {/* Logo for non-authenticated mobile users */}
      {!authLoading && !user && isMobile && (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <FollicleFlowLogo className="h-6 w-auto text-indigo-600 dark:text-indigo-400" />
        </Link>
      )}

      {/* Main content area */}
      <div className="flex-1 flex items-center gap-3 sm:gap-6 min-w-0">
        {/* Desktop breadcrumb and title */}
        {!authLoading && user && (
          <div className="hidden sm:flex items-center gap-4 min-w-0">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-200 dark:to-slate-300">
                {breadcrumb[breadcrumb.length - 1]}
              </h1>
              {breadcrumb.length > 1 && (
                <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {breadcrumb.slice(0, -1).map((crumb, index) => (
                    <span key={index} className="flex items-center gap-1">
                      <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-default">
                        {crumb}
                      </span>
                      {index < breadcrumb.length - 2 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                    </span>
                  ))}
                </nav>
              )}
            </div>
          </div>
        )}

        {/* Logo for non-authenticated desktop users */}
        {!authLoading && !user && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <FollicleFlowLogo className="h-6 w-auto text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-600">
                FollicleFlow
              </span>
              <span className="text-xs text-slate-500 -mt-0.5 dark:text-slate-400">Hair Transplant Network</span>
            </div>
          </div>
        )}

        {/* Enhanced search bar */}
        {!authLoading && user && (
          <div className="hidden md:flex items-center flex-1 max-w-lg">
            <div className={`relative w-full transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}>
              <div
                className={`relative rounded-2xl border transition-all duration-200 ${
                  searchFocused
                    ? "border-indigo-300 shadow-lg shadow-indigo-500/20 bg-white dark:border-indigo-600 dark:shadow-indigo-500/10 dark:bg-slate-900"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800/80"
                }`}
              >
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                    searchFocused ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search surgeons, procedures, locations..."
                  className="w-full h-11 pl-11 pr-16 rounded-2xl bg-transparent text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {searchValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                      onClick={() => setSearchValue("")}
                    >
                      ×
                    </Button>
                  )}
                  <kbd className="hidden lg:inline-flex h-6 px-2 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {authLoading ? (
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-400">Loading...</span>
          </div>
        ) : user ? (
          <>
            {/* Quick action button */}
            <Button
              size="sm"
              className="hidden lg:flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4"
              asChild
            >
              <Link href="/add-surgeon">
                <Plus className="h-4 w-4" />
                Add Surgeon
              </Link>
            </Button>

            {/* Mobile quick action */}
            <Button
              size="sm"
              className="lg:hidden p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg rounded-xl"
              asChild
            >
              <Link href="/add-surgeon">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>

            {/* AI Credits Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/60 dark:border-yellow-700/60">
              <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                {userData?.aiCredits || 0}
              </span>
              <span className="text-xs text-yellow-600/80 dark:text-yellow-400/80">credits</span>
            </div>

            {/* Mobile Credits Display */}
            <div className="sm:hidden flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200/60 dark:border-yellow-700/60">
              <Coins className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                {userData?.aiCredits || 0}
              </span>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl"
              onClick={() => {
                /* Handle notifications */
              }}
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-[10px] font-bold text-white">{notificationCount}</span>
                </div>
              )}
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl"
            >
              <HelpCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className={`flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 transition-all duration-200 ${
                  dropdownOpen
                    ? "bg-slate-100 shadow-lg dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center dark:border-slate-700">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm dark:border-slate-900"></div>
                </div>

                <div className="hidden md:flex flex-col items-start min-w-0">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  {isAdmin && (
                    <Badge className="text-[10px] px-2 py-0 h-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Enhanced dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden dark:bg-slate-900/95 dark:border-slate-700/60">
                  {/* User info header */}
                  <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60 dark:from-slate-800/50 dark:to-slate-800/30 dark:border-slate-700/60">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL || "/placeholder.svg"}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-lg flex items-center justify-center dark:border-slate-700">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">
                          {user.displayName || "User"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                        {isAdmin && (
                          <Badge className="text-[10px] px-2 py-0.5 h-5 mt-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                            <Zap className="w-2.5 h-2.5 mr-1" />
                            Administrator
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors dark:from-blue-900/20 dark:to-indigo-900/20 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Profile Settings</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Manage your account</span>
                      </div>
                    </Link>

                    {/* AI Credits & Purchase */}
                    <div className="px-4 py-3 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200/30 dark:border-yellow-700/30 rounded-xl mx-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                            AI Credits
                          </span>
                        </div>
                        <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                          {userData?.aiCredits || 0}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full text-xs bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-sm"
                        asChild
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Link href="/credits">
                          Buy More Credits
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-slate-200/60 dark:bg-slate-700/60" />

                  <div className="py-2">
                    <button
                      onClick={logOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 group-hover:from-red-100 group-hover:to-rose-100 transition-colors dark:from-red-900/20 dark:to-rose-900/20 dark:group-hover:from-red-900/30 dark:group-hover:to-rose-900/30">
                        <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Sign Out</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">End your session</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Authentication buttons */
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
