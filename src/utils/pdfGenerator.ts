import { jsPDF } from 'jspdf';

export function generateTechnicalArchitecturePDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette Constants
  const primaryColor = [79, 70, 229]; // Indigo-600 #4f46e5
  const darkTextColor = [24, 24, 27]; // Zinc-900 #18181b
  const mutedTextColor = [113, 113, 122]; // Zinc-500 #71717a
  const cardBg = [244, 244, 245]; // Zinc-100 #f4f4f5

  let y = 18;

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(14, y, 182, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TASKLY - Technical Architecture & Features', 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Comprehensive Technical Specification of Libraries & Implementations', 20, y + 17);

  y += 32;

  // Metadata block
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.setFontSize(8.5);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Platform Target: Web, Android & Desktop | App: Taskly v1.0`, 15, y);
  y += 7;

  // Divider
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 8;

  interface FeatureSection {
    title: string;
    techUsed: string;
    purpose: string;
    details: string[];
  }

  const features: FeatureSection[] = [
    {
      title: '1. Local Audio & Android Ringtone System',
      techUsed: 'HTML5 Audio API, Web Audio API, FileReader API, Base64 URI',
      purpose: 'Enables custom ringtone uploads from Android storage and local computers, with cross-platform playback.',
      details: [
        'Android Compatibility: Standard input[type="file"] with audio/* triggers Android native audio file picker (Downloads/Music).',
        'Persistence: Audio is parsed into Base64 data URLs and stored in localStorage for instant offline access.',
        'Hybrid Engine: Uses new Audio() with fallback to Web Audio API for auto-play policy handling on mobile Chrome/Android WebViews.'
      ]
    },
    {
      title: '2. Synthesized Alarm Chimes (4 Preset Tones)',
      techUsed: 'Web Audio API (AudioContext, OscillatorNode, GainNode)',
      purpose: 'Generates zero-asset, high-fidelity real-time ringtones directly in code without external MP3 dependencies.',
      details: [
        'Classic Chime: Harmonic chord sequence with sine-wave exponential decay (880Hz, 1108Hz, 1318Hz).',
        'Digital Beep: High-tech square-wave rapid chirp sequence (1046.5Hz C6).',
        'Sonar Radar: Dynamic frequency exponential frequency sweeps (440Hz -> 1760Hz).',
        'Gentle Bell: Low-contrast relaxing triad chords (C5, E5, G5) with extended release envelopes.'
      ]
    },
    {
      title: '3. Real-Time Deadline Alarm Monitoring Engine',
      techUsed: 'JavaScript Interval Loop + Active Ringing ID Deduplication Set',
      purpose: 'Continuously checks deadline timestamps against local clock and fires modal alarms and browser notifications.',
      details: [
        'Accurate Tick: Background ticker runs every 3000ms evaluating tasks where alarmEnabled is true.',
        'Anti-Duplicate Protection: Tracks ringing tasks via an immutable Set to completely avoid double-triggering or duplicate cards.',
        'Snooze Matrix: Supports quick 5m, 15m, and 30m extensions that recalculate deadlines and reset triggers.'
      ]
    },
    {
      title: '4. Priority Categorization & Interactive Filtering',
      techUsed: 'React 19 Hooks (useMemo, useCallback, useState), TypeScript',
      purpose: 'Categorizes tasks across 4 priority levels and 6 life domains with multi-variable sorting.',
      details: [
        'Priorities: Urgent (Red), High (Amber), Medium (Blue), Low (Neutral) with distinct visual tags and weights.',
        'Multi-axis Sorting: Sort by deadline proximity, priority severity, creation timestamp, or alphabetical title.',
        'Search & Filter: Real-time text search query integrated with Status tabs (All, Active, Completed, Overdue).'
      ]
    },
    {
      title: '5. Professional Light & Dark Mode Theming',
      techUsed: 'Tailwind CSS v4 (@custom-variant dark), LocalStorage, DOM classList',
      purpose: 'Instant, persistent theme switching respecting OS preferences and manual user overrides.',
      details: [
        'Tailwind v4 Setup: Configured with @custom-variant dark (&:where(.dark, .dark *)) for robust class-based toggling.',
        'Persistent Memory: Remembers preference in priority_todo_theme_v1; synchronizes immediately with document.documentElement.'
      ]
    },
    {
      title: '6. Fluid Transitions & Interactions',
      techUsed: 'motion (Motion for React / Framer Motion v12)',
      purpose: 'Provides smooth card mounting, deletion transitions, modal spring animations, and tab changes.',
      details: [
        'AnimatePresence popLayout ensures tasks smoothly slide into place when added, completed, or deleted.',
        'Spring physics applied to dialogs and ringtone preview controls.'
      ]
    },
    {
      title: '7. Vector Iconography & Typography System',
      techUsed: 'Lucide React Icons, Inter / System Typography stack',
      purpose: 'Crisp, lightweight visual signifiers across every functional button and status badge.',
      details: [
        'Lucide icons: Bell, BellRing, Clock, Music, Volume2, Smartphone, Check, Trash2, RotateCcw, AlertTriangle.',
        'WCAG AA accessible contrast for all priority badges and controls in both themes.'
      ]
    },
    {
      title: '8. PDF Report Generation',
      techUsed: 'jsPDF (Client-Side Document Generator)',
      purpose: 'Generates this formatted technical report on-demand directly in the browser with zero server overhead.',
      details: [
        'Pure client-side execution; instantly downloads as Taskly_Technical_Architecture.pdf on mobile and desktop.'
      ]
    }
  ];

  for (const feat of features) {
    // Check if we need a page break
    if (y > 245) {
      doc.addPage();
      y = 20;
    }

    // Feature Card Container
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.roundedRect(14, y, 182, 23, 2, 2, 'F');

    // Title & Tech
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(feat.title, 17, y + 6);

    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(`Technologies: ${feat.techUsed}`, 17, y + 11.5);

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const purposeLines = doc.splitTextToSize(feat.purpose, 174);
    doc.text(purposeLines, 17, y + 17);

    y += 26;

    // Bullet details
    for (const detail of feat.details) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const splitDetail = doc.splitTextToSize(`• ${detail}`, 176);
      doc.text(splitDetail, 17, y);
      y += splitDetail.length * 4;
    }

    y += 3;
  }

  // Footer on last page
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(228, 228, 231);
  doc.line(14, y + 2, 196, y + 2);
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(8);
  doc.text('Taskly Technical Specification Document — Created with Google AI Studio', 14, y + 7);

  // Save / Trigger Download
  doc.save('Taskly_Technical_Architecture.pdf');
}
