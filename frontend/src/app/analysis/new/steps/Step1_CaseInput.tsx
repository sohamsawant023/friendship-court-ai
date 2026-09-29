/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { Info, Users, Calendar, MapPin } from "lucide-react";

interface Step1Props {
  caseData: {
    id: string;
    title: string;
    category: string;
    description: string;
    location: string;
    jurisdiction: string;
    relevantDates: string;
    parties: string[];
  };
  setCaseData: (data: any) => void;
  onNext: () => void;
}

export default function Step1_CaseInput({ caseData, setCaseData, onNext }: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!caseData.title.trim()) newErrors.title = "Case title is required";
    if (!caseData.category.trim()) newErrors.category = "Category is required";
    if (!caseData.description.trim()) newErrors.description = "Description is required";
    if (caseData.parties.length < 2) newErrors.parties = "At least 2 parties are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const addParty = () => {
    setCaseData({
      ...caseData,
      parties: [...caseData.parties, ""]
    });
  };

  const updateParty = (index: number, value: string) => {
    const newParties = [...caseData.parties];
    newParties[index] = value;
    setCaseData({
      ...caseData,
      parties: newParties
    });
  };

  const removeParty = (index: number) => {
    if (caseData.parties.length > 2) {
      const newParties = caseData.parties.filter((_: string, i: number) => i !== index);
      setCaseData({
        ...caseData,
        parties: newParties
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accentGold/10 border border-accentGold/20 flex items-center justify-center">
          <Info className="w-5 h-5 text-accentGold" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Case Information</h2>
          <p className="text-sm text-textSecondary">Enter the basic details of the case</p>
        </div>
      </div>

      {/* Case Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Case Title</label>
        <input
          type="text"
          value={caseData.title}
          onChange={(e) => setCaseData({ ...caseData, title: e.target.value })}
          placeholder="e.g., The Pizza Incident"
          className={`w-full bg-background border rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors ${
            errors.title ? "border-red-500" : "border-glassBorder"
          }`}
        />
        {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Case Category</label>
        <select
          value={caseData.category}
          onChange={(e) => setCaseData({ ...caseData, category: e.target.value })}
          className={`w-full bg-background border rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-accentGold transition-colors ${
            errors.category ? "border-red-500" : "border-glassBorder"
          }`}
        >
          <option value="">Select category...</option>
          <option value="Food & Dining">Food & Dining</option>
          <option value="Financial">Financial</option>
          <option value="Communication">Communication</option>
          <option value="Property">Property</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Case Description</label>
        <textarea
          value={caseData.description}
          onChange={(e) => setCaseData({ ...caseData, description: e.target.value })}
          placeholder="Describe what happened and what the disagreement is about..."
          rows={4}
          className={`w-full bg-background border rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors resize-none ${
            errors.description ? "border-red-500" : "border-glassBorder"
          }`}
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
      </div>

      {/* Location & Jurisdiction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            Location
          </label>
          <input
            type="text"
            value={caseData.location}
            onChange={(e) => setCaseData({ ...caseData, location: e.target.value })}
            placeholder="e.g., New York, NY"
            className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Jurisdiction</label>
          <input
            type="text"
            value={caseData.jurisdiction}
            onChange={(e) => setCaseData({ ...caseData, jurisdiction: e.target.value })}
            placeholder="e.g., State Court"
            className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors"
          />
        </div>
      </div>

      {/* Relevant Dates */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          Relevant Dates
        </label>
        <input
          type="text"
          value={caseData.relevantDates}
          onChange={(e) => setCaseData({ ...caseData, relevantDates: e.target.value })}
          placeholder="e.g., January 15, 2024"
          className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors"
        />
      </div>

      {/* Parties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary flex items-center gap-2">
            <Users className="w-3 h-3" />
            Parties Involved
          </label>
          <GlassButton variant="secondary" onClick={addParty} className="px-3 py-1 text-xs">
            + Add Party
          </GlassButton>
        </div>
        
        {caseData.parties.map((party: string, index: number) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={party}
              onChange={(e) => updateParty(index, e.target.value)}
              placeholder={`Party ${index + 1} name`}
              className="flex-1 bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors"
            />
            {caseData.parties.length > 2 && (
              <GlassButton
                variant="secondary"
                onClick={() => removeParty(index)}
                className="px-3 text-red-400 hover:text-red-300"
              >
                ×
              </GlassButton>
            )}
          </div>
        ))}
        {errors.parties && <p className="text-xs text-red-400">{errors.parties}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-glassBorderSecondary">
        <GlassButton variant="primary" onClick={handleNext} className="px-8">
          Continue to Documents
        </GlassButton>
      </div>
    </div>
  );
}
