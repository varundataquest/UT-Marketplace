import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PriceHistoryChart({ listing }) {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (!listing?.title) return;
            setIsLoading(true);
            setError(null);

            try {
                const currentYear = new Date().getFullYear();
                const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

                const prompt = `Based on public marketplace data, estimate the average selling price for a "${listing.title}" in "${listing.condition}" condition for each of the last 5 years: ${years.join(', ')}. Provide the response as a JSON object with years as keys and estimated prices as number values. For example: {"${years[0]}": 120, "${years[1]}": 115, ...}. If data is unavailable for a year, use null.`;

                const response = await InvokeLLM({
                    prompt: prompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: years.reduce((acc, year) => {
                            acc[year.toString()] = { type: ['number', 'null'] };
                            return acc;
                        }, {}),
                    },
                });

                const formattedData = Object.entries(response)
                    .map(([year, price]) => ({
                        year,
                        price: price,
                    }))
                    .filter(item => item.price !== null)
                    .sort((a, b) => a.year.localeCompare(b.year));
                
                if(formattedData.length === 0) {
                    setError("Could not find historical price data for this item.");
                } else {
                    setChartData(formattedData);
                }

            } catch (err) {
                console.error("Failed to fetch price history:", err);
                setError("Could not retrieve price analysis at this time.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPriceHistory();
    }, [listing]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-ut-orange" />
                    Price History Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-ut-orange" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 text-red-600">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(5px)',
                                        border: '1px solid #ddd',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="price" fill="#BF5700" name="Est. Price" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}