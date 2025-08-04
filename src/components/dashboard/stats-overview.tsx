
// src/components/dashboard/stats-overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurgeons } from "@/contexts/surgeons-context";
import { ContactStatus } from "@/types/surgeon";
import { Users, PhoneForwarded, MessageSquareText, FileText, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  onCardClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, onCardClick, className }) => {
  return (
    <Card
      className={cn(
        "shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4",
        onCardClick && "cursor-pointer",
        className
      )}
      onClick={onCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};


const StatCardSkeleton: React.FC = () => {
  return (
    <Card className="shadow-lg border-l-4 border-transparent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-12 mb-1" />
      </CardContent>
    </Card>
  );
};

interface StatsOverviewProps {
  onStatCardClick: (status?: ContactStatus, isFavoriteFilter?: boolean) => void;
  isLoading: boolean;
}

export function StatsOverview({ onStatCardClick, isLoading }: StatsOverviewProps) {
  const { surgeons } = useSurgeons();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const totalDoctors = surgeons.length;
  const favorites = surgeons.filter(s => s.isFavorite).length;
  const contacted = surgeons.filter(s => s.contactStatus === ContactStatus.Contacted).length;
  const responded = surgeons.filter(s => s.contactStatus === ContactStatus.Responded).length;
  const priceGiven = surgeons.filter(s => s.contactStatus === ContactStatus.PriceGiven).length;
  const consultDone = surgeons.filter(s => s.contactStatus === ContactStatus.ConsultDone).length;


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      <StatCard
        title="Total Surgeons"
        value={totalDoctors}
        icon={Users}
        className="status-total"
      />
      <StatCard
        title="Favorites"
        value={favorites}
        icon={Star}
        onCardClick={() => onStatCardClick(undefined, true)}
        className="status-favorite"
      />
      <StatCard
        title="Contacted"
        value={contacted}
        icon={PhoneForwarded}
        onCardClick={() => onStatCardClick(ContactStatus.Contacted)}
        className="status-contacted"
      />
      <StatCard
        title="Responded"
        value={responded}
        icon={MessageSquareText}
        onCardClick={() => onStatCardClick(ContactStatus.Responded)}
        className="status-responded"
      />
      <StatCard
        title="Price Given"
        value={priceGiven}
        icon={FileText}
        onCardClick={() => onStatCardClick(ContactStatus.PriceGiven)}
        className="status-pricegiven"
      />
      <StatCard
        title="Consult Done"
        value={consultDone}
        icon={CheckCircle2}
        onCardClick={() => onStatCardClick(ContactStatus.ConsultDone)}
        className="status-consultdone"
      />
    </div>
  );
}
