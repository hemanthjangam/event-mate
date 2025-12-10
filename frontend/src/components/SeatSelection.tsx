"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Section {
    id: number;
    name: string;
    price: number;
    rows: number;
    cols: number;
    layoutConfig?: string;
}

interface SeatSelectionProps {
    sections: Section[];
    bookedSeats: string[]; // e.g., "VIP-1-2"
    onSeatSelect: (selectedSeats: { sectionId: number, row: number, col: number, price: number }[]) => void;
}

export default function SeatSelection({ sections, bookedSeats, onSeatSelect }: SeatSelectionProps) {
    const [selectedSeats, setSelectedSeats] = useState<{ sectionId: number, row: number, col: number, price: number }[]>([]);

    const handleSeatClick = (section: Section, row: number, col: number) => {
        const seatId = `${section.name}-${row}-${col}`;
        if (bookedSeats.includes(seatId)) return;

        const isSelected = selectedSeats.some(s => s.sectionId === section.id && s.row === row && s.col === col);

        let newSelected;
        if (isSelected) {
            newSelected = selectedSeats.filter(s => !(s.sectionId === section.id && s.row === row && s.col === col));
        } else {
            newSelected = [...selectedSeats, { sectionId: section.id, row, col, price: section.price }];
        }

        setSelectedSeats(newSelected);
        onSeatSelect(newSelected);
    };

    return (
        <div className="space-y-8">
            {sections.map(section => {
                let layout: string[][] = [];
                try {
                    if (section.layoutConfig) {
                        layout = JSON.parse(section.layoutConfig);
                    }
                } catch (e) {
                    // Fallback or empty
                }

                // If no layout config (legacy)
                if (layout.length === 0) {
                    layout = Array.from({ length: section.rows }).map(() =>
                        Array.from({ length: section.cols }).map(() => 'standard')
                    );
                }

                return (
                    <div key={section.id} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">{section.name} - ${section.price}</h3>
                        <div className="grid gap-2 justify-center" style={{ gridTemplateColumns: `repeat(${section.cols}, minmax(0, 1fr))` }}>
                            {layout.map((rowArr, rowIndex) => (
                                rowArr.map((cellType, colIndex) => {
                                    const row = rowIndex + 1;
                                    const col = colIndex + 1;
                                    const seatId = `${section.name}-${row}-${col}`;
                                    const isBooked = bookedSeats.includes(seatId);
                                    const isSelected = selectedSeats.some(s => s.sectionId === section.id && s.row === row && s.col === col);

                                    if (cellType === 'aisle' || !cellType) {
                                        return <div key={`${section.id}-${row}-${col}`} className="w-8 h-8" />;
                                    }

                                    // Override price for VIP? logic could go here, for now use section price
                                    const isBlocked = cellType === 'blocked';

                                    return (
                                        <motion.button
                                            key={`${section.id}-${row}-${col}`}
                                            whileHover={!isBooked && !isBlocked ? { scale: 1.1 } : {}}
                                            whileTap={!isBooked && !isBlocked ? { scale: 0.9 } : {}}
                                            onClick={() => !isBlocked && handleSeatClick(section, row, col)}
                                            disabled={isBooked || isBlocked}
                                            className={`
                                            w-8 h-8 rounded-t-lg text-xs font-medium transition-colors flex items-center justify-center
                                            ${isBlocked ? 'bg-red-100/50 text-transparent cursor-default' :
                                                    isBooked ? 'bg-gray-300 cursor-not-allowed text-gray-500' :
                                                        isSelected ? 'bg-primary text-white shadow-lg' :
                                                            cellType === 'vip' ? 'bg-yellow-400 border border-yellow-500 text-yellow-900 hover:bg-yellow-500' :
                                                                'bg-white border border-gray-200 hover:border-primary text-gray-600'}
                                        `}
                                            title={`Row ${row}, Seat ${col}`}
                                        >
                                            {!isBlocked && `${String.fromCharCode(64 + row)}${col}`}
                                        </motion.button>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                )
            })}

            <div className="flex justify-center gap-6 text-sm text-gray-600 mt-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-lg bg-white border border-gray-200"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-lg bg-primary"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-lg bg-gray-300"></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    );
}
