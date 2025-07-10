import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZellePayment({ listing, seller, isOpen, onClose }) {
    const [step, setStep] = useState('info'); // info, confirm, instructions
    const [buyerEmail, setBuyerEmail] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(seller?.email || seller?.paypal_username || 'seller@example.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyAmount = () => {
        navigator.clipboard.writeText(listing?.price?.toString() || '0');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetAndClose = () => {
        setStep('info');
        setBuyerEmail('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={resetAndClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Pay with Zelle
                    </DialogTitle>
                </DialogHeader>

                {step === 'info' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-purple-900">Zelle Payment</h3>
                                        <p className="text-sm text-purple-700">Fast & secure bank transfer</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-purple-700">Item:</span>
                                        <span className="text-sm font-medium text-purple-900">{listing?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-purple-700">Amount:</span>
                                        <span className="text-lg font-bold text-purple-900">${listing?.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-purple-700">Seller:</span>
                                        <span className="text-sm font-medium text-purple-900">{seller?.full_name}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Your Email (for confirmation)
                                </label>
                                <Input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={buyerEmail}
                                    onChange={(e) => setBuyerEmail(e.target.value)}
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Before you pay:</p>
                                        <ul className="text-xs space-y-1">
                                            <li>• Verify the seller's identity</li>
                                            <li>• Arrange pickup/delivery details</li>
                                            <li>• Only pay after seeing the item</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={resetAndClose}
                                className="flex-1 border border-black text-black hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => setStep('instructions')}
                                disabled={!buyerEmail.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Continue to Zelle
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 'instructions' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Smartphone className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg">Open your banking app</h3>
                            <p className="text-sm text-gray-600">Use these details to send payment via Zelle</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Send to</p>
                                        <p className="font-mono text-sm">{seller?.email || 'seller@example.com'}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCopyEmail}
                                        className="border border-black text-black hover:bg-gray-100"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                                        <p className="font-mono text-lg font-bold">${listing?.price}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCopyAmount}
                                        className="border border-black text-black hover:bg-gray-100"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Memo (optional)</p>
                                <p className="text-sm">{listing?.title}</p>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-green-800">
                                    <p className="font-medium mb-1">Payment Steps:</p>
                                    <ol className="text-xs space-y-1 list-decimal list-inside">
                                        <li>Open your bank's mobile app</li>
                                        <li>Find "Zelle" or "Send Money"</li>
                                        <li>Enter the email address above</li>
                                        <li>Enter the amount: ${listing?.price}</li>
                                        <li>Add memo: {listing?.title}</li>
                                        <li>Review and send</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={resetAndClose}
                            className="w-full bg-ut-orange hover:bg-orange-700 text-black border border-black"
                        >
                            Done
                        </Button>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}