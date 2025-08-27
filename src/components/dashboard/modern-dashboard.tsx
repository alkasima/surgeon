"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Plus,
  Filter,
  Search,
  Star,
  StarOff,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Globe2,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  HeartHandshake,
  Eye,
  List,
  LayoutGrid,
  Columns,
  SortAsc,
  X,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Context and Types
import { useSurgeons } from "@/contexts/surgeons-context";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import type { Surgeon } from "@/types/surgeon";
import { ContactStatus } from "@/types/surgeon";
import { ModernSidebar } from "./modern-sidebar";
import { SurgeonCardModern } from "./surgeon-card-modern";
import { SurgeonModal } from "@/components/surgeon-modal";

// Constants
const SPECIALTIES = ["FUE", "FUT/Strip", "DHI", "SMP", "Eyebrow", "Beard"] as const;
const COUNTRIES = ["USA", "Turkey", "India", "Mexico", "Thailand", "Spain", "UK"] as const;
const STATUSES = ["None", "Contacted", "Responded", "PriceGiven", "ConsultDone"] as const;

// Utility function
const currency = (n: number) => new Intl.NumberFormat(undefined, { 
  style: "currency", 
  currency: "USD", 
  maximumFractionDigits: 0 
}).format(n);

// Main Component
export default function ModernDashboard() {
  const { surgeons, loading, openModalWithSurgeon } = useSurgeons();
  const { user } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list" | "kanban">("grid");
  const [specialty, setSpecialty] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [price, setPrice] = useState<number[]>([0, 8000]);
  const [sort, setSort] = useState<string>("updated-desc");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [onlyResponded, setOnlyResponded] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("global-search");
        el?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filter and sort data
  const data = useMemo(() => {
    let items = [...surgeons];
    
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((s) =>
        [s.name, s.clinicName, s.location.city, s.location.country, s.specialties.join(" ")]
          .some((v) => v.toLowerCase().includes(q))
      );
    }
    
    if (specialty !== "all") {
      items = items.filter((s) => s.specialties.includes(specialty as any));
    }
    
    if (country !== "all") {
      items = items.filter((s) => s.location.country === country);
    }
    
    if (status !== "all") {
      items = items.filter((s) => s.contactStatus === status);
    }
    
    // Price filtering (convert to number if string)
    items = items.filter((s) => {
      const estimate = typeof s.costEstimate === 'string' ? 
        parseInt(s.costEstimate.replace(/[^0-9]/g, '')) || 0 : 
        s.costEstimate || 0;
      return estimate >= price[0] && estimate <= price[1];
    });
    
    if (onlyFavs) items = items.filter((s) => s.isFavorite);
    if (onlyResponded) items = items.filter((s) => s.contactStatus !== ContactStatus.None);

    // Sorting
    const by = (fn: (s: Surgeon) => any) => (a: Surgeon, b: Surgeon) => (fn(a) > fn(b) ? 1 : -1);
    const byDesc = (fn: (s: Surgeon) => any) => (a: Surgeon, b: Surgeon) => (fn(a) < fn(b) ? 1 : -1);
    
    switch (sort) {
      case "price-asc": 
        items.sort(by((s) => typeof s.costEstimate === 'string' ? 
          parseInt(s.costEstimate.replace(/[^0-9]/g, '')) || 0 : s.costEstimate || 0)); 
        break;
      case "price-desc": 
        items.sort(byDesc((s) => typeof s.costEstimate === 'string' ? 
          parseInt(s.costEstimate.replace(/[^0-9]/g, '')) || 0 : s.costEstimate || 0)); 
        break;
      case "rating-desc": 
        items.sort(byDesc((s) => s.personalRating || 0)); 
        break;
      case "updated-desc": 
        items.sort(byDesc((s) => s.lastUpdated || new Date(0))); 
        break;
      default: break;
    }
    
    return items;
  }, [surgeons, query, specialty, country, status, price, onlyFavs, onlyResponded, sort]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Group surgeons by status for kanban view
  const groupedByStatus = useMemo(() => {
    const map: Record<string, Surgeon[]> = {};
    STATUSES.forEach((st) => (map[st] = []));
    data.forEach((d) => {
      const status = d.contactStatus || 'None';
      if (map[status]) {
        map[status].push(d);
      }
    });
    return map;
  }, [data]);

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ModernSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative flex w-64 flex-col bg-background border-r">
                <ModernSidebar 
                  collapsed={false} 
                  onToggle={() => setMobileMenuOpen(false)}
                  isMobile={true}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 w-full lg:w-auto">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
              <div className="flex items-center gap-3 p-3">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="global-search"
                    placeholder="Search surgeons, clinics, cities…"
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 hidden sm:flex">
                      <Plus className="h-4 w-4" />
                      Add Surgeon
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Add Surgeon</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/add-surgeon'}>
                      Manually
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("CSV import coming soon")}>
                      From CSV / Sheet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/find-surgeons'}>
                      Search Google
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Add Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" className="sm:hidden">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Add Surgeon</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/add-surgeon'}>
                      Manually
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("CSV import coming soon")}>
                      From CSV / Sheet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/find-surgeons'}>
                      Search Google
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 hidden sm:flex">
                      <SortAsc className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSort("updated-desc")}>
                      Recently updated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("rating-desc")}>
                      Top rated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("price-asc")}>
                      Price: Low → High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("price-desc")}>
                      Price: High → Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Sort Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="sm:hidden">
                      <SortAsc className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSort("updated-desc")}>
                      Recently updated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("rating-desc")}>
                      Top rated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("price-asc")}>
                      Price: Low → High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("price-desc")}>
                      Price: High → Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden md:flex items-center gap-1 rounded-xl border p-1">
                  <Button 
                    size="icon" 
                    variant={view === "grid" ? "default" : "ghost"} 
                    onClick={() => setView("grid")} 
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={view === "list" ? "default" : "ghost"} 
                    onClick={() => setView("list")} 
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={view === "kanban" ? "default" : "ghost"} 
                    onClick={() => setView("kanban")} 
                    aria-label="Kanban view"
                  >
                    <Columns className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="border-b bg-card/50">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <Badge variant="outline" className="gap-2 hidden sm:flex">
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                </Badge>

                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {SPECIALTIES.map((sp) => (
                      <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-[120px] sm:w-[160px]">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[140px] sm:w-[220px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="hidden lg:flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <div className="w-40">
                    <Slider 
                      min={0} 
                      max={8000} 
                      step={100} 
                      value={price} 
                      onValueChange={setPrice} 
                    />
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">
                    {currency(price[0])}–{currency(price[1])}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex items-center gap-2">
                    <Switch id="fav" checked={onlyFavs} onCheckedChange={setOnlyFavs} />
                    <Label htmlFor="fav" className="text-xs hidden sm:inline">Only favorites</Label>
                    <Label htmlFor="fav" className="text-xs sm:hidden">Favs</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="resp" checked={onlyResponded} onCheckedChange={setOnlyResponded} />
                    <Label htmlFor="resp" className="text-xs hidden sm:inline">Only responded</Label>
                    <Label htmlFor="resp" className="text-xs sm:hidden">Resp</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 p-3 grid-cols-2 md:grid-cols-4">
              <StatCard title="Total surgeons" value={surgeons.length} subtitle="tracked" />
              <StatCard title="Favorites" value={surgeons.filter(s => s.isFavorite).length} subtitle="starred" />
              <StatCard title="Responded" value={surgeons.filter(s => s.contactStatus !== ContactStatus.None).length} subtitle="replies" />
              <StatCard title="Avg. quote" value={currency(Math.round(surgeons.reduce((a, b) => {
                const cost = typeof b.costEstimate === 'string' ? 
                  parseInt(b.costEstimate.replace(/[^0-9]/g, '')) || 0 : 
                  b.costEstimate || 0;
                return a + cost;
              }, 0) / (surgeons.length || 1)))} subtitle="USD" />
            </div>

            {/* Content Views */}
            <div className="p-3">
              {view === "grid" && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {data.map((s) => (
                    <SurgeonCardModern key={s.id} surgeon={s} onOpen={() => openModalWithSurgeon(s)} />
                  ))}
                  {data.length === 0 && <EmptyState />}
                </div>
              )}

              {view === "list" && (
                <div className="rounded-2xl border bg-card overflow-x-auto">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground min-w-[600px]">
                    <div className="col-span-4">Surgeon / Clinic</div>
                    <div className="col-span-2 hidden sm:block">Specialties</div>
                    <div className="col-span-2">Country</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2 text-right hidden md:block">Updated</div>
                  </div>
                  <Separator />
                  <div>
                    {data.map((s) => (
                      <button 
                        key={s.id} 
                        onClick={() => openModalWithSurgeon(s)} 
                        className="grid grid-cols-12 gap-2 px-3 py-3 w-full text-left hover:bg-muted/60 min-w-[600px]"
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium leading-tight truncate">{s.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.clinicName}</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm hidden sm:block truncate">{s.specialties.join(", ")}</div>
                        <div className="col-span-2 text-sm truncate">{s.location.country}</div>
                        <div className="col-span-2 text-sm tabular-nums">{currency(s.costEstimate || 0)}</div>
                        <div className="col-span-2 text-xs text-right text-muted-foreground hidden md:block">
                          {s.lastUpdated ? new Date(s.lastUpdated.toDate()).toLocaleDateString() : 'Never'}
                        </div>
                      </button>
                    ))}
                    {data.length === 0 && (
                      <div className="p-8">
                        <EmptyState />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {view === "kanban" && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                  {STATUSES.map((st) => (
                    <div key={st} className="rounded-2xl border bg-card/60">
                      <div className="sticky top-[88px] z-0 flex items-center justify-between px-3 py-2">
                        <div className="font-medium">{st}</div>
                        <Badge variant="secondary">{groupedByStatus[st]?.length ?? 0}</Badge>
                      </div>
                      <Separator />
                      <div className="p-2 space-y-2 max-h-[70vh] overflow-auto">
                        {groupedByStatus[st]?.map((s) => (
                          <button 
                            key={s.id} 
                            onClick={() => openModalWithSurgeon(s)} 
                            className="w-full text-left"
                          >
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="font-medium leading-tight">{s.name}</div>
                                <div className="text-xs text-muted-foreground">{s.clinicName}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{currency(s.costEstimate || 0)}</Badge>
                                  <Badge variant="secondary">{s.specialties.join(", ")}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </button>
                        ))}
                        {groupedByStatus[st]?.length === 0 && (
                          <div className="text-xs text-muted-foreground px-2 py-4">No items</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Surgeon Modal */}
        <SurgeonModal />
      </div>
    </TooltipProvider>
  );
}

// Helper Components
function StatCard({ title, value, subtitle }: { title: string; value: any; subtitle?: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-muted grid place-items-center">
          <Plus />
        </div>
        <div className="text-sm">No surgeons match your filters.</div>
        <div className="text-xs text-muted-foreground">Try clearing filters or add a new surgeon.</div>
        <div className="mt-4">
          <Button onClick={() => window.location.href = '/add-surgeon'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Surgeon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}