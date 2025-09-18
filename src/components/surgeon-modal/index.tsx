// src/components/surgeon-modal/index.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSurgeons } from "@/contexts/surgeons-context";
import { DetailsTrackingTab } from "./details-tracking-tab";
import { ContactLinksTab } from "./contact-links-tab";
import { AiToolsTab } from "./ai-tools-tab";
import { RedditSentimentCard } from "@/components/reddit-sentiment";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function SurgeonModal() {
  const { selectedSurgeon, isModalOpen, setIsModalOpen, setSelectedSurgeon, deleteSurgeon } = useSurgeons();

  if (!selectedSurgeon) return null;

  const handleDelete = () => {
    deleteSurgeon(selectedSurgeon.id);
    // AlertDialog will close itself, modal is closed by deleteSurgeon calling setSelectedSurgeon(null)
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setIsModalOpen(open);
      if (!open) {
        setSelectedSurgeon(null);
      }
    }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-headline">{selectedSurgeon.name}</DialogTitle>
              <DialogDescription>{selectedSurgeon.clinicName} - {selectedSurgeon.location.city}, {selectedSurgeon.location.country}</DialogDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" title="Delete Surgeon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this surgeon
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto px-6 pb-6">
          <Tabs defaultValue="details" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details & Tracking</TabsTrigger>
              <TabsTrigger value="contact">Contact & Links</TabsTrigger>
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
              <TabsTrigger value="reddit">Reddit Sentiment</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <DetailsTrackingTab surgeon={selectedSurgeon} />
            </TabsContent>
            <TabsContent value="contact" className="mt-4">
              <ContactLinksTab surgeon={selectedSurgeon} />
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              <AiToolsTab surgeon={selectedSurgeon} />
            </TabsContent>
            <TabsContent value="reddit" className="mt-4">
              <RedditSentimentCard surgeonName={selectedSurgeon.name} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
