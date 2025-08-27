"use client";

import React, { useState } from "react";
import { 
  Star, 
  StarOff, 
  MoreHorizontal, 
  Eye, 
  Mail, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Surgeon } from "@/types/surgeon";
import { useSurgeons } from "@/contexts/surgeons-context";

interface SurgeonCardProps {
  surgeon: Surgeon;
  onOpen: () => void;
}

export function SurgeonCardModern({ surgeon, onOpen }: SurgeonCardProps) {
  const { updateSurgeon } = useSurgeons();
  const [fav, setFav] = useState(surgeon.isFavorite);

  const handleToggleFavorite = async () => {
    const newFav = !fav;
    setFav(newFav);
    await updateSurgeon(surgeon.id, { isFavorite: newFav });
  };

  const currency = (n: number | string) => {
    const num = typeof n === 'string' ? parseInt(n.replace(/[^0-9]/g, '')) || 0 : n || 0;
    return new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency: "USD", 
      maximumFractionDigits: 0 
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Responded': return 'bg-green-100 text-green-800';
      case 'PriceGiven': return 'bg-purple-100 text-purple-800';
      case 'ConsultDone': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar seed={surgeon.id} />
            <div>
              <CardTitle className="leading-tight text-base">{surgeon.name}</CardTitle>
              <div className="text-xs text-muted-foreground">
                {surgeon.clinicName} • {surgeon.location.city}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleToggleFavorite} 
              aria-label="Toggle favorite"
            >
              {fav ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="More">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpen}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Send outreach
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{surgeon.specialties.join(", ")}</Badge>
          <Badge variant="outline">{currency(surgeon.costEstimate || 0)}</Badge>
          {surgeon.personalRating && (
            <Badge variant="outline">{surgeon.personalRating}★</Badge>
          )}
          {surgeon.contactStatus !== 'None' ? (
            <Badge className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {surgeon.contactStatus}
            </Badge>
          ) : (
            <Badge variant="outline">No contact</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {surgeon.notes || "No notes added yet."}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Updated {surgeon.lastUpdated ? 
              new Date(surgeon.lastUpdated.toDate()).toLocaleDateString() : 
              'Never'
            }
          </span>
          <Button size="sm" variant="outline" onClick={onOpen}>
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Avatar({ seed }: { seed: string }) {
  // Simple colorful blob avatar
  const hue = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div 
      className="h-9 w-9 shrink-0 rounded-xl" 
      style={{ 
        background: `conic-gradient(from 0deg, hsl(${hue} 70% 60%), hsl(${(hue+60)%360} 70% 60%), hsl(${(hue+120)%360} 70% 60%))` 
      }} 
    />
  );
}