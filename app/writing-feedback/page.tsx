"use client";

import { useState } from "react";

interface Criterion {
  name: string;
  weight: number;
  score: number; // 1-5
}

interface FeedbackItem {
  issue: string;
  evidence: string;
  reason: string;
  suggestion: string;
}

interface Chapter {
  id: string;
  name: string;
  criteria: Criterion[];
  feedback: FeedbackItem[];
}

// Mock data based on Haroon's Task 7 rubric structure.
// Replace with real API data once the writing feedback engine is built.
const MOCK_CHAPTERS: Chapter[] = [
  {
    id: "introduction",
    name: "Introduction",
    criteria: [
      { name: "Context & Motivation", weight: 20, score: 4 },
      { name: "Problem Statement", weight: 25, score: 3 },
      { name: "Research Gap", weight: 25, score: 2 },
      { name: "Objectives & Logical Flow", weight: 30, score: 3 },
    ],
    feedback: [
      {
        issue: "Weak research gap",
        evidence: "Paragraph 3, page 2",
        reason:
          "The gap is mentioned but not clearly tied to the literature discussed earlier, making it hard to see why this study is needed.",
        suggestion:
          "Explicitly connect the gap to specific studies you cited, using phrasing like 'however, none of these studies addressed...'",
      },
      {
        issue: "Problem statement not sharply defined",
        evidence: "Paragraph 2, page 1",
        reason:
          "The problem is implied across several sentences rather than stated in one clear sentence, which makes the chapter feel less focused.",
        suggestion:
          "Add one explicit sentence that states exactly what problem this thesis solves.",
      },
    ],
  },
  {
    id: "literature-review",
    name: "Literature Review",
    criteria: [
      { name: "Critical Synthesis", weight: 30, score: 2 },
      { name: "Source Comparison", weight: 20, score: 3 },
      { name: "Gap Identification", weight: 25, score: 3 },
      { name: "Positioning of Thesis", weight: 25, score: 3 },
    ],
    feedback: [
      {
        issue: "Reads as a list of study summaries",
        evidence: "Section 2.2, pages 5-7",
        reason:
          "Studies are presented one after another without being grouped by theme or argument, so the chapter reads as a summary list rather than a synthesis.",
        suggestion:
          "Group related studies into themes and discuss what they collectively show, rather than describing each one separately.",
      },
    ],
  },
  {
    id: "methodology",
    name: "Methodology",
    criteria: [
      { name: "Process Transparency", weight: 25, score: 4 },
      { name: "Data & Preprocessing", weight: 25, score: 3 },
      { name: "Models / Experimental Design", weight: 25, score: 4 },
      { name: "Evaluation Procedure", weight: 25, score: 3 },
    ],
    feedback: [
      {
        issue: "Preprocessing steps are vague",
        evidence: "Section 3.3, page 12",
        reason:
          "The data source is named but the cleaning/preprocessing steps aren't specified in enough detail for someone else to replicate.",
        suggestion:
          "List the specific preprocessing steps in order (e.g. removing duplicates, normalizing text, handling missing values).",
      },
    ],
  },
  {
    id: "results",
    name: "Results",
    criteria: [
      { name: "Systematic Reporting", weight: 35, score: 4 },
      { name: "Accuracy & Completeness", weight: 35, score: 3 },
      { name: "Separation from Interpretation", weight: 30, score: 2 },
    ],
    feedback: [
      {
        issue: "Mixes interpretation into factual reporting",
        evidence: "Paragraph 4, page 18",
        reason:
          "Phrases like 'this proves that...' appear alongside the reported numbers, which blurs the line between fact and interpretation that belongs in Discussion.",
        suggestion:
          "Rephrase interpretive statements as neutral observations here, and move the interpretation to the Discussion chapter.",
      },
    ],
  },
  {
    id: "discussion",
    name: "Discussion",
    criteria: [
      { name: "Interpretation Depth", weight: 35, score: 3 },
      { name: "Limitations", weight: 25, score: 2 },
      { name: "Connection to Research Questions", weight: 40, score: 3 },
    ],
    feedback: [
      {
        issue: "Limitations are generic",
        evidence: "Paragraph 6, page 22",
        reason:
          "The limitation mentioned ('more research is needed') isn't specific to this study's data, method, or scope.",
        suggestion:
          "Name a specific limitation tied to your own dataset, method, or sample size, and explain its actual effect on your results.",
      },
    ],
  },
  {
    id: "conclusion",
    name: "Conclusion",
    criteria: [
      { name: "Summary of Main Answer", weight: 30, score: 4 },
      { name: "Return to Purpose", weight: 25, score: 3 },
      { name: "No New Arguments", weight: 20, score: 5 },
      { name: "Contribution & Takeaway", weight: 25, score: 3 },
    ],
    feedback: [
      {
        issue: "Generic contribution statement",
        evidence: "Final paragraph, page 25",
        reason:
          "The contribution is described as 'this study is important' without specifying what the actual academic or practical takeaway is.",
        suggestion:
          "Replace the generic line with one sentence naming the specific contribution (e.g. a method, a finding, or a tool this thesis produced).",
      },
    ],
  },
];

function scoreLabel(score: number): { text: string; color: string } {
  if (score < 2.5) return { text: "Weak", color: "text-red-400 bg-red-500/10" };
  if (score < 3.5) return { text: "Adequate", color: "text-yellow-400 bg-yellow-500/10" };
  return { text: "Strong", color: "text-green-400 bg-green-500/10" };
}

function weightedScore(criteria: Criterion[]): number {
  const total = criteria.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0);
  return Math.round(total * 10) / 10;
}

export default function WritingFeedbackPage() {
  const [activeChapter, setActiveChapter] = useState(MOCK_CHAPTERS[0].id);

  const chapter = MOCK_CHAPTERS.find((c) => c.id === activeChapter)!;
  const overallScore = weightedScore(chapter.criteria);

  return (
    <div className="min-h-screen bg-navy text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">Writing Feedback</h1>
          <span className="text-xs bg-white/10 text-neutral/60 px-2 py-1 rounded-full">
            Sample data — live scoring coming soon
          </span>
        </div>
        <p className="text-neutral/70 mb-6">
          Chapter-by-chapter clarity, structure, and argument quality.
        </p>

        {/* Chapter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MOCK_CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChapter(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                activeChapter === c.id
                  ? "bg-teal-500 text-white"
                  : "bg-white/5 text-neutral/60 hover:bg-white/10"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Overall score */}
        <div className="bg-white/5 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-neutral/60 text-sm">{chapter.name} — Overall Score</p>
            <p className="text-3xl font-bold mt-1">{overallScore} / 5</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${scoreLabel(overallScore).color}`}>
            {scoreLabel(overallScore).text}
          </div>
        </div>

        {/* Criteria breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Criteria Breakdown</h2>
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral/60 text-left">
                  <th className="px-4 py-2 font-medium">Criterion</th>
                  <th className="px-4 py-2 font-medium">Weight</th>
                  <th className="px-4 py-2 font-medium">Score</th>
                  <th className="px-4 py-2 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {chapter.criteria.map((c) => {
                  const label = scoreLabel(c.score);
                  return (
                    <tr key={c.name} className="border-b border-white/5">
                      <td className="px-4 py-2">{c.name}</td>
                      <td className="px-4 py-2 text-neutral/60">{c.weight}%</td>
                      <td className="px-4 py-2">{c.score} / 5</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${label.color}`}>
                          {label.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback items */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Feedback</h2>
          {chapter.feedback.length === 0 ? (
            <p className="text-neutral/50 text-sm">
              No issues flagged for this chapter — all criteria scored above the feedback threshold.
            </p>
          ) : (
            <div className="space-y-4">
              {chapter.feedback.map((item, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-red-400 mb-2">⚠ {item.issue}</p>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-neutral/50 text-xs mb-1">Evidence</p>
                      <p className="text-neutral/80">{item.evidence}</p>
                    </div>
                    <div>
                      <p className="text-neutral/50 text-xs mb-1">Reason</p>
                      <p className="text-neutral/80">{item.reason}</p>
                    </div>
                    <div>
                      <p className="text-neutral/50 text-xs mb-1">Suggestion</p>
                      <p className="text-neutral/80">{item.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}