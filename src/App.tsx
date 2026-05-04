import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, Pill, Activity, ShieldCheck, SearchCheck, History, Sparkles, Loader2, Info, Scan, Share2, Check, Tablets } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchDrug, getSuggestions } from '@/services/geminiService';
import { DrugInfo } from '@/types';
import { Scanner } from './components/Scanner';
import { DrugDetails } from './components/DrugDetails';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareData = {
      title: 'Pharmacy Medical Assistant',
      text: 'Check out this AI-powered medical assistant for quick drug information!',
      url: window.location.href,
    };

    try {
      if (navigator.share && /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        const results = await getSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setShowSuggestions(false);
    setSearchQuery(query);
    
    const result = await searchDrug(query);
    if (result) {
      setSelectedDrug(result);
      setHistory(prev => [query, ...prev.filter(h => h !== query)].slice(0, 5));
    }
    setIsLoading(false);
  };

  const handleScanResult = (result: DrugInfo) => {
    setSelectedDrug(result);
    setShowScanner(false);
    setHistory(prev => [result.name, ...prev.filter(h => h !== result.name)].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-background medical-grid">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary uppercase">Pharmacy Medical Assistant</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">AI-Powered Medical Aid</p>
            </div>
          </div>
          
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verified Data
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mr-2 border-r pr-6">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Powered
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              onClick={handleShare}
            >
              {isShared ? (
                <>
                  <Check className="h-4 w-4" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share App
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          
          {/* Hero Section */}
          {!selectedDrug && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h2 className="text-4xl font-bold md:text-6xl">
                Your Pharmacy <span className="text-primary">Medical</span> Assistant
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Search or scan any medicine to get comprehensive details, formulas, side effects, and AI-powered suggestions instantly.
              </p>
            </motion.div>
          )}

          {/* Search & Scan Section */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row" ref={searchRef}>
              <div className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search by drug name or package..." 
                    className="h-14 pl-12 pr-4 text-lg shadow-sm transition-all focus-visible:ring-primary/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-xl"
                    >
                      <ScrollArea className="max-h-[300px]">
                        <div className="p-2">
                          {suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
                              onClick={() => handleSearch(suggestion)}
                            >
                              <SearchCheck className="h-4 w-4 text-primary" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  className="h-14 px-8 shadow-lg shadow-primary/20"
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isLoading}
                >
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 w-14 p-0 shadow-sm"
                  onClick={() => setShowScanner(true)}
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Quick History / Suggestions */}
            {!selectedDrug && history.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <History className="h-3 w-3" /> Recent:
                </span>
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(item)}
                    className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {selectedDrug ? (
              <motion.div
                key={selectedDrug.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex justify-start">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      setSelectedDrug(null);
                      setSearchQuery('');
                    }}
                  >
                    <Search className="h-4 w-4" />
                    New Search
                  </Button>
                </div>
                <DrugDetails drug={selectedDrug} />
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-4">
                {[
                  { icon: SearchCheck, title: "Deep Search", desc: "Instantly retrieve formula & dosage." },
                  { icon: Scan, title: "Visual Scan", desc: "Identify medicine from photos." },
                  { icon: Tablets, title: "Form Identity", desc: "Detects Tablets, Capsules & more." },
                  { icon: Activity, title: "Health Map", desc: "Explore side effects & safety." }
                ].map((feature, i) => (
                  <Card key={i} className="border-none bg-white/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <footer className="pt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Always consult with a healthcare professional before taking any medication.
            </div>
          </footer>
        </div>
      </main>

      {/* Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <Scanner 
            onResult={handleScanResult} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
