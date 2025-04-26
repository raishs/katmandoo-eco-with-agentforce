import React from 'react';
import './QuickReplies.css';

export default function QuickReplies({ options, onSelect }) {
    // Handle both array of strings and array of objects
    const normalizeOptions = (opts) => {
        if (!Array.isArray(opts)) return [];
        
        return opts.map(opt => {
            if (typeof opt === 'string') {
                return {
                    label: opt,
                    value: opt
                };
            }
            return {
                label: opt.label || opt.text || opt.value,
                value: opt.value || opt.label || opt.text
            };
        });
    };

    const quickReplyOptions = normalizeOptions(options);

    return (
        <div className="quickReplies">
            {quickReplyOptions.map((option, index) => (
                <button
                    key={index}
                    className="quickReplyButton"
                    onClick={() => onSelect(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
} 