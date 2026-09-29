"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard, GlassButton } from "@/components/ui";
import { FloatingPanel, AnimatedHeading, StatusBadge } from "@/components/ui";
import { FileText, Image as ImageIcon, Plus, ChevronRight, X } from "lucide-react";
import { Evidence } from "@/lib/types";

export default function EvidenceBoard({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<{ title: string; friendA: string; friendB: string } | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [newTextEvidence, setNewTextEvidence] = useState("");
  const [showAddText, setShowAddText] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [selectedSubmitter, setSelectedSubmitter] = useState("Friend A");

  useEffect(() => {
    try {
      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const parsed = JSON.parse(savedCase);
        if (parsed.id === params.id) {
          setCaseData(parsed);
          if (parsed.evidence) {
            setEvidence(parsed.evidence);
          }
        } else {
          router.push('/case/new');
        }
      } else {
        router.push('/case/new');
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      router.push('/case/new');
    }
  }, [params.id, router]);

  const addTextEvidence = () => {
    if (!newTextEvidence.trim()) return;

    try {
      const newEvidence: Evidence = {
        id: `EVI-${Date.now()}`,
        type: 'text',
        content: newTextEvidence,
        submittedBy: selectedSubmitter
      };

      const updatedEvidence = [...evidence, newEvidence];
      setEvidence(updatedEvidence);
      setNewTextEvidence("");
      setShowAddText(false);

      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const updatedCase = JSON.parse(savedCase);
        updatedCase.evidence = updatedEvidence;
        localStorage.setItem('newCase', JSON.stringify(updatedCase));
      }
    } catch (error) {
      console.error('Error adding evidence:', error);
      alert('Failed to add evidence. Please try again.');
    }
  };

  const addImageEvidence = () => {
    try {
      const newEvidence: Evidence = {
        id: `EVI-${Date.now()}`,
        type: 'image',
        content: 'https://via.placeholder.com/400x300?text=Screenshot+Evidence',
        submittedBy: selectedSubmitter
      };

      const updatedEvidence = [...evidence, newEvidence];
      setEvidence(updatedEvidence);
      setShowAddImage(false);

      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const updatedCase = JSON.parse(savedCase);
        updatedCase.evidence = updatedEvidence;
        localStorage.setItem('newCase', JSON.stringify(updatedCase));
      }
    } catch (error) {
      console.error('Error adding image evidence:', error);
      alert('Failed to add evidence. Please try again.');
    }
  };

  const removeEvidence = (id: string) => {
    try {
      const updatedEvidence = evidence.filter(e => e.id !== id);
      setEvidence(updatedEvidence);

      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const updatedCase = JSON.parse(savedCase);
        updatedCase.evidence = updatedEvidence;
        localStorage.setItem('newCase', JSON.stringify(updatedCase));
      }
    } catch (error) {
      console.error('Error removing evidence:', error);
      alert('Failed to remove evidence. Please try again.');
    }
  };

  const proceedToHearing = () => {
    router.push(`/case/${params.id}`);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4"
          >
            ⚖️
          </motion.div>
          <p className="text-textSecondary">Loading case information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <AnimatedHeading delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status="active" />
              <span className="text-xs font-mono text-textSecondary">CASE #{params.id}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Evidence Board
            </h1>
            <p className="text-lg text-textSecondary">Submit supporting documentation</p>
          </div>
        </AnimatedHeading>

        <div className="space-y-6">
          {/* Add Evidence Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <FloatingPanel delay={0.2}>
              <button
                onClick={() => setShowAddText(!showAddText)}
                className="w-full p-6 glass-panel card-hover text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accentCyan/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accentCyan" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Text Evidence</div>
                    <div className="text-sm text-textSecondary">Chat logs, messages, descriptions</div>
                  </div>
                </div>
              </button>
            </FloatingPanel>
            
            <FloatingPanel delay={0.3}>
              <button
                onClick={() => setShowAddImage(!showAddImage)}
                className="w-full p-6 glass-panel card-hover text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accentGold/20 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-accentGold" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Image Evidence</div>
                    <div className="text-sm text-textSecondary">Screenshots, photos</div>
                  </div>
                </div>
              </button>
            </FloatingPanel>
          </div>

          {/* Add Text Evidence Form */}
          {showAddText && (
            <FloatingPanel delay={0.4}>
              <GlassCard variant="primary" className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-textPrimary uppercase tracking-wider mb-2 block">Submitted By</label>
                    <select
                      value={selectedSubmitter}
                      onChange={(e) => setSelectedSubmitter(e.target.value)}
                      className="input-field w-full appearance-none cursor-pointer"
                    >
                      <option value="Friend A">Friend A ({caseData.friendA})</option>
                      <option value="Friend B">Friend B ({caseData.friendB})</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-textPrimary uppercase tracking-wider mb-2 block">Evidence Content</label>
                    <textarea
                      placeholder="Paste chat logs, messages, or describe the evidence..."
                      rows={4}
                      value={newTextEvidence}
                      onChange={(e) => setNewTextEvidence(e.target.value)}
                      className="input-field w-full resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <GlassButton onClick={addTextEvidence} variant="primary" className="px-6">
                      <Plus className="w-4 h-4" />
                      Add Evidence
                    </GlassButton>
                    <GlassButton onClick={() => setShowAddText(false)} variant="secondary" className="px-6">
                      Cancel
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </FloatingPanel>
          )}

          {/* Add Image Evidence Form */}
          {showAddImage && (
            <FloatingPanel delay={0.4}>
              <GlassCard variant="primary" className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-textPrimary uppercase tracking-wider mb-2 block">Submitted By</label>
                    <select
                      value={selectedSubmitter}
                      onChange={(e) => setSelectedSubmitter(e.target.value)}
                      className="input-field w-full appearance-none cursor-pointer"
                    >
                      <option value="Friend A">Friend A ({caseData.friendA})</option>
                      <option value="Friend B">Friend B ({caseData.friendB})</option>
                    </select>
                  </div>
                  <div className="border-2 border-dashed border-glassBorder rounded-xl p-8 text-center hover:border-accentGold/50 transition-colors">
                    <div className="text-4xl mb-3">📁</div>
                    <p className="text-textSecondary mb-4">Drag and drop an image or click to upload</p>
                    <GlassButton onClick={addImageEvidence} variant="secondary" className="px-6">
                      Select File
                    </GlassButton>
                  </div>
                  <div className="flex gap-3">
                    <GlassButton onClick={() => setShowAddImage(false)} variant="secondary" className="px-6">
                      Cancel
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </FloatingPanel>
          )}

          {/* Evidence List */}
          {evidence.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Submitted Evidence ({evidence.length})</h2>
              {evidence.map((item, index) => (
                <FloatingPanel key={item.id} delay={0.5 + index * 0.1}>
                  <GlassCard variant="secondary" className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                          {item.type === 'image' ? <ImageIcon className="w-5 h-5 text-accentGold" /> : <FileText className="w-5 h-5 text-accentCyan" />}
                        </div>
                        <div>
                          <div className="text-xs font-mono text-textSecondary">{item.id}</div>
                          <div className="text-sm text-textSecondary">Submitted by: <span className="text-white">{item.submittedBy}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvidence(item.id)}
                        className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {item.type === 'text' ? (
                      <div className="bg-background rounded-lg p-4 text-textPrimary">
                        {item.content}
                      </div>
                    ) : (
                      <div className="bg-background rounded-lg p-4">
                        <div className="bg-surface rounded-lg h-32 flex items-center justify-center text-textSecondary">
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-sm">Image Evidence</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </FloatingPanel>
              ))}
            </div>
          ) : (
            <FloatingPanel delay={0.5}>
              <GlassCard variant="secondary" className="p-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h2 className="text-xl font-medium text-textPrimary mb-2">No Evidence Yet</h2>
                <p className="text-textSecondary">Add text or image evidence to support your case</p>
              </GlassCard>
            </FloatingPanel>
          )}

          {/* Continue Button */}
          <div className="pt-4 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg text-textSecondary hover:text-textPrimary transition-colors"
            >
              Back
            </button>
            <GlassButton onClick={proceedToHearing} variant="primary" className="px-8">
              Proceed to Hearing
              <ChevronRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}