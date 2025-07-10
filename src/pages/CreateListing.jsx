
import React, { useState, useEffect } from "react";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { complianceCheck } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Upload, 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle, 
  Camera,
  DollarSign,
  User as UserIcon,
  Phone 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

const categories = [
    "Textbooks", "Electronics", "Furniture", "Clothing & Accessories", "Dorm Essentials", 
    "School Supplies", "Sports & Outdoors", "Transportation", "Tickets & Events", "Other"
];
const conditions = ["New", "Like New", "Good", "Fair", "Used"];

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    images: []
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [complianceResult, setComplianceResult] = useState(null);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [phone, setPhone] = useState(""); 
  const [showPhoneModal, setShowPhoneModal] = useState(false); 

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.phone) {
            setPhone(user.phone); 
        } else if (user && !user.phone) {
            setShowPhoneModal(true);
        }
      } catch (e) {
        setShowNameModal(true);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleGuestNameSubmit = () => {
    if (!guestName.trim()) {
      alert("Please enter your name to continue.");
      return;
    }
    setShowNameModal(false);
    setShowPhoneModal(true); 
  };

  const handlePhoneSubmit = () => {
    if (!phone.trim()) {
      alert("Please enter your phone number to continue. This is required for buyers to contact you.");
      return;
    }
    setShowPhoneModal(false);
    
    if (currentUser) {
      User.update(currentUser.id, { phone }).catch(console.error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files) => {
    setIsUploading(true);
    const uploadedImages = [];
    const newImages = Array.from(files).slice(0, 8 - formData.images.length);

    for (const file of newImages) {
        try {
            const { file_url } = await UploadFile({ file });
            uploadedImages.push(file_url);
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            setError("Failed to upload one or more images.");
        }
    }

    const allImages = [...formData.images, ...uploadedImages];
    setFormData(prev => ({ ...prev, images: allImages }));
    setIsUploading(false);

    if (allImages.length > 0 && !formData.title) {
        generateAISuggestions(allImages[0]);
    }
  };
  
  const generateAISuggestions = async (imageUrl) => {
    setIsGeneratingAI(true);
    setAiSuggestion(null);
    try {
      const result = await InvokeLLM({
        prompt: "Based on the image of this item for a college marketplace, suggest a title, category, and a fair starting price.",
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string", enum: categories },
            price: { type: "number" }
          },
          required: ["title", "category", "price"]
        }
      });
      setAiSuggestion(result);
    } catch (aiError) {
      console.error("AI suggestion error:", aiError);
    }
    setIsGeneratingAI(false);
  };

  const applyAISuggestion = (field) => {
    if (!aiSuggestion) return;
    if(field === 'price'){
       handleInputChange(field, aiSuggestion[field].toString());
    } else {
      handleInputChange(field, aiSuggestion[field]);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setError("Phone number is required for buyers to contact you.");
      setShowPhoneModal(true); // Show phone modal if empty
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setComplianceResult(null); 

    try {
        setIsCheckingCompliance(true);
        const sellerEmailForCompliance = currentUser ? currentUser.email : `guest_${Date.now()}@marketplace.local`;

        const complianceResponse = await complianceCheck({
            title: formData.title,
            description: formData.description,
            images: formData.images,
            seller_email: sellerEmailForCompliance
        });

        if (complianceResponse.data.blocked) {
            setComplianceResult(complianceResponse.data); 
            setError(`Listing blocked due to policy violations:\n${complianceResponse.data.userMessages.join('\n')}`);
            setIsSubmitting(false); // Reset submitting state
            setIsCheckingCompliance(false); // Reset checking compliance state
            return; 
        }

        if (complianceResponse.data.complianceScore < 0.9) {
            setComplianceResult(complianceResponse.data);
        }

        if (currentUser && phone && currentUser.phone !== phone) { 
            await User.update(currentUser.id, { phone });
        }

        const sellerEmail = currentUser ? currentUser.email : `guest_${Date.now()}@marketplace.local`;
        
        const listingData = {
            ...formData,
            price: parseFloat(formData.price),
            seller_email: sellerEmail,
            seller_name: currentUser ? currentUser.full_name : guestName,
            seller_phone: phone, 
            compliance_score: complianceResponse.data.complianceScore 
        };
        
        await Listing.create(listingData);
        setSuccess(true);
        setTimeout(() => {
            window.location.href = createPageUrl("Dashboard");
        }, 2000);
    } catch (submitError) {
        console.error("Error creating listing:", submitError);
        setError("Failed to create listing. Please check your inputs and try again.");
    } finally {
        setIsSubmitting(false);
        setIsCheckingCompliance(false); 
    }
  };
  
  if (isLoading) {
      return <div className="text-center p-4 sm:p-6 lg:p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10" /></div>
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Listing</h1>
        <p className="text-gray-600 mb-8">Fill out the details below to sell your item on the marketplace.</p>
        </motion.div>
        
        {/* Compliance Status */}
        <AnimatePresence>
        {isCheckingCompliance && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking content for policy compliance...
                    </AlertDescription>
                </Alert>
            </motion.div>
        )}

        {complianceResult && !complianceResult.blocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTitle className="text-yellow-800">Content Review Notice</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        <div className="space-y-2">
                            <p>Compliance Score: {Math.round(complianceResult.complianceScore * 100)}%</p>
                            {complianceResult.userMessages.length > 0 && (
                                <div>
                                    <p className="font-medium">Recommendations:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {complianceResult.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm">{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            </motion.div>
        )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-ut-orange"/>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={image} alt={`Upload preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 w-6 h-6 rounded-full border border-black" onClick={() => removeImage(index)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {formData.images.length < 8 && (
                            <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-ut-orange hover:bg-orange-50 transition-colors">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} disabled={isUploading} />
                                {isUploading ? <Loader2 className="w-8 h-8 text-ut-orange animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}
                            </label>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
            {(isGeneratingAI || aiSuggestion) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600"/>AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isGeneratingAI ? (
                            <div className="flex items-center gap-3 text-purple-800"><Loader2 className="w-5 h-5 animate-spin" /><span>Analyzing image...</span></div>
                        ) : aiSuggestion ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p><strong>Title:</strong> {aiSuggestion.title}</p>
                                    <Button type="button" size="sm" variant="outline" className="border border-black text-black hover:bg-gray-100" onClick={() => applyAISuggestion('title')}>Use</Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p><strong>Category:</strong> {aiSuggestion.category}</p>
                                    <Button type="button" size="sm" variant="outline" className="border border-black text-black hover:bg-gray-100" onClick={() => applyAISuggestion('category')}>Use</Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p><strong>Price:</strong> ${aiSuggestion.price}</p>
                                    <Button type="button" size="sm" variant="outline" className="border border-black text-black hover:bg-gray-100" onClick={() => applyAISuggestion('price')}>Use</Button>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </motion.div>
            )}
            </AnimatePresence>

            <Card>
                <CardHeader><CardTitle>Listing Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="font-semibold">Title*</label>
                        <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                    </div>
                    <div>
                        <label className="font-semibold">Description*</label>
                        <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-semibold">Price*</label>
                            <div className="relative">
                               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} required min="0" step="0.01" className="pl-8"/>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold">Category*</label>
                            <Select onValueChange={(value) => handleInputChange('category', value)} value={formData.category} required>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="font-semibold">Condition*</label>
                             <Select onValueChange={(value) => handleInputChange('condition', value)} value={formData.condition} required>
                                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                                <SelectContent>
                                    {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information Card - Always Show */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#DF6F1D]"/>
                    Contact Information (Required)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="font-semibold">Phone Number *</label>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., 555-123-4567"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Your phone number will be shared with interested buyers. This is required for the contact feature to work.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></motion.div>}
                {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Alert variant="default" className="bg-green-100 border-green-300 text-green-800"><CheckCircle className="h-4 w-4"/> <AlertDescription>Listing created successfully! Redirecting...</AlertDescription></Alert></motion.div>}
            </AnimatePresence>

            <div className="flex justify-end">
                <Button type="submit" size="lg" variant="outline" className="border-2 border-black text-black hover:bg-gray-100 hover:text-black" disabled={isSubmitting || isCheckingCompliance}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin"/> 
                            {isCheckingCompliance ? 'Checking Compliance...' : 'Posting...'}
                        </>
                    ) : (
                        "Create Listing"
                    )}
                </Button>
            </div>
        </form>
      </div>

      {/* Guest Name Modal */}
      <Dialog open={showNameModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#DF6F1D]" />
              Welcome to Marketplace!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              To create a listing, please tell us your name so buyers know who they're dealing with.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleGuestNameSubmit()}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={User.login} variant="outline" className="border border-black text-black hover:bg-gray-100">
                Login Instead
              </Button>
              <Button onClick={handleGuestNameSubmit} className="bg-[#DF6F1D] hover:bg-orange-700 text-white border border-black">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#DF6F1D]" />
              Contact Information Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide your phone number so buyers can contact you about your listing.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 555-123-4567"
                onKeyPress={(e) => e.key === 'Enter' && handlePhoneSubmit()}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handlePhoneSubmit} className="bg-[#DF6F1D] hover:bg-orange-700 text-white border border-black">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
