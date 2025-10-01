"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  PlusCircle,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Sparkles,
  Activity,
  TrendingUp,
  BarChart3,
  ClipboardList,
} from "lucide-react"
import { FollicleFlowLogo } from "@/components/icons"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

const userNavItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
  },
  {
    href: "/add-surgeon",
    label: "Add Surgeon",
    icon: PlusCircle,
    description: "Register new surgeon",
    badge: "New",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
  },
  {
    href: "/find-surgeons",
    label: "Find Surgeons",
    icon: Search,
    description: "Search directory",
    color: "from-purple-500 to-indigo-500",
    bgColor: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Performance metrics",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
  },
  {
    href: "/consultation",
    label: "Consultation",
    icon: ClipboardList,
    description: "Prepare for consultations",
    color: "from-violet-500 to-fuchsia-500",
    bgColor: "from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20",
  },
]

const accountNavItems = [
  {
    href: "/profile",
    label: "Profile Settings",
    icon: Settings,
    description: "Account preferences",
    color: "from-slate-500 to-gray-500",
    bgColor: "from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50",
  },
]

const adminNavItems = [
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    description: "Manage platform users",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
  },
  {
    href: "/admin/analytics",
    label: "System Analytics",
    icon: TrendingUp,
    description: "Platform insights",
    color: "from-rose-500 to-pink-500",
    bgColor: "from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, loading, isAdmin } = useAuth()

  if (!user && !loading) {
    return null
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      side="left"
      className="border-r border-slate-200/60 bg-white/50 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50"
    >
      <SidebarHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:border-slate-800/60 dark:from-slate-900/80 dark:to-slate-950/80">
        <div className="flex items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3">
          <Link
            href="/"
            className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center transition-all duration-200"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-data-[collapsible=icon]:p-1.5">
              <Image src="/logo.png" alt="FollicleFlow Logo" width={150} height={50} />
            </div>           
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/30">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-600 dark:text-slate-400 group-data-[collapsible=icon]:hidden mb-2">
            <Activity className="w-3 h-3 mr-2" />
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {userNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={`justify-start h-12 rounded-xl transition-all duration-200 group border ${
                        pathname === item.href
                          ? `bg-gradient-to-r ${item.bgColor} border-slate-200/60 shadow-lg dark:border-slate-700/60`
                          : "hover:bg-slate-50/80 hover:shadow-md border-transparent dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            pathname === item.href
                              ? `bg-gradient-to-r ${item.color} shadow-lg`
                              : `bg-gradient-to-r ${item.bgColor} group-hover:shadow-md`
                          }`}
                        >
                          <item.icon
                            className={`h-4 w-4 transition-colors ${
                              pathname === item.href
                                ? "text-white"
                                : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                            }`}
                          />
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge className="text-[10px] px-2 py-0 h-4 ml-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-slate-200/60 dark:bg-slate-700/60" />

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-600 dark:text-slate-400 group-data-[collapsible=icon]:hidden mb-2">
            <Settings className="w-3 h-3 mr-2" />
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={`justify-start h-12 rounded-xl transition-all duration-200 group border ${
                        pathname === item.href
                          ? `bg-gradient-to-r ${item.bgColor} border-slate-200/60 shadow-lg dark:border-slate-700/60`
                          : "hover:bg-slate-50/80 hover:shadow-md border-transparent dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            pathname === item.href
                              ? `bg-gradient-to-r ${item.color} shadow-lg`
                              : `bg-gradient-to-r ${item.bgColor} group-hover:shadow-md`
                          }`}
                        >
                          <item.icon
                            className={`h-4 w-4 transition-colors ${
                              pathname === item.href
                                ? "text-white"
                                : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                            }`}
                          />
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                          <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                            {item.label}
                          </span>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-4 bg-slate-200/60 dark:bg-slate-700/60" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-amber-600 dark:text-amber-400 group-data-[collapsible=icon]:hidden mb-2">
                <ShieldCheck className="w-3 h-3 mr-2" />
                ADMIN PANEL
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname.startsWith(item.href)}
                          tooltip={item.label}
                          className={`justify-start h-12 rounded-xl transition-all duration-200 group border ${
                            pathname.startsWith(item.href)
                              ? `bg-gradient-to-r ${item.bgColor} border-amber-200/60 shadow-lg dark:border-amber-700/60`
                              : "hover:bg-amber-50/50 hover:shadow-md border-transparent dark:hover:bg-amber-900/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`p-2 rounded-xl transition-all duration-200 ${
                                pathname.startsWith(item.href)
                                  ? `bg-gradient-to-r ${item.color} shadow-lg`
                                  : `bg-gradient-to-r ${item.bgColor} group-hover:shadow-md`
                              }`}
                            >
                              <item.icon
                                className={`h-4 w-4 transition-colors ${
                                  pathname.startsWith(item.href)
                                    ? "text-white"
                                    : "text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300"
                                }`}
                              />
                            </div>
                            <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                              <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                                {item.label}
                              </span>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 p-4 dark:border-slate-800/60 dark:from-slate-900/80 dark:to-slate-950/80">
        <div className="flex items-center justify-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <div className="group-data-[collapsible=icon]:hidden flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="p-1 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">© {new Date().getFullYear()} FollicleFlow</span>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-1">
            <div className="p-1 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">FF</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
