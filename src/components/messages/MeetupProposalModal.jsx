
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Message } from "@/api/entities";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

// Updated UT Austin locations
const meetupLocations = [
  { id: "pcl", name: "Perry-Castañeda Library (PCL)" },
  { id: "tower", name: "UT Tower & Main Mall" },
  { id: "union", name: "Student Activity Center (SAC)" },
  { id: "gregory_gym", name: "Gregory Gymnasium" },
  { id: "jester", name: "Jester Residence Halls" },
  { id: "kinsolving", name: "Kinsolving Residence Hall" },
  { id: "flawn", name: "Flawn Academic Center" },
  { id: "commons", name: "Jester City Limits (JCL)" }
];

// Generate time slots
const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // 8 AM to 9 PM
    const minute = (i % 2) * 30;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return {
        value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        label: `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
    };
});

export default function MeetupProposalModal({ isOpen, onClose, conversation, currentUser }) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time || !location) {
        alert("Please select a date, time, and location.");
        return;
    }
    setIsSending(true);

    const [hours, minutes] = time.split(':');
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const messageData = {
        conversation_id: conversation.id,
        listing_id: conversation.listing.id,
        sender_email: currentUser.email,
        recipient_email: conversation.otherUser.email,
        content: `Meet-up proposed for ${location}.`,
        message_type: 'meetup_proposal',
        meetup_time: combinedDateTime.toISOString(),
        meetup_location: location,
        meetup_status: 'pending'
    };
    
    await Message.create(messageData);
    setIsSending(false);
    onClose(true); // pass true to indicate success and trigger refresh
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-ut-orange"/>
            Propose a Meet-up
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Date</label>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(d) => d < new Date().setHours(0,0,0,0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="font-semibold flex items-center gap-1"><Clock className="w-4 h-4"/> Time</label>
                  <Select value={time} onValueChange={setTime}>
                      <SelectTrigger><SelectValue placeholder="Select a time"/></SelectTrigger>
                      <SelectContent>
                          {timeSlots.map(slot => <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              <div>
                  <label className="font-semibold flex items-center gap-1"><MapPin className="w-4 h-4"/> Location</label>
                   <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger><SelectValue placeholder="Select a location"/></SelectTrigger>
                      <SelectContent>
                          {meetupLocations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onClose(false)} className="border border-black text-black hover:bg-gray-100">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSending} className="bg-ut-orange hover:bg-orange-700 text-black border border-black">
                {isSending ? "Sending..." : "Send Proposal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
