/**
 * ============================================================================
 *                                 AI MANAGER
 * ============================================================================
 * This is the master cognitive switchboard and the single point of entry for
 * all AI-related calls from the main application (App.tsx).
 * 
 * It orchestrates calls to various AI services.
 * ============================================================================
 */

import * as geminiService from './gemini/index.ts';
import * as ollamaService from './ollama.ts';

// The AI Manager re-exports functions from its specialist services.
// This provides a single point of entry for the UI.

// From Gemini Service (Primary Engine)
export const createEgregores = geminiService.createEgregores;
export const assimilateNewData = geminiService.assimilateNewData;
export const generateChatResponseStream = geminiService.generateChatResponseStream;
export const runCognitiveCycle = geminiService.runCognitiveCycle;
export const getEmotionalUpdate = geminiService.getEmotionalUpdate;
export const developStrategicPlan = geminiService.developStrategicPlan;
export const generateLoreWithMemoryWeaving = geminiService.generateLoreWithMemoryWeaving;
export const createLoreFromText = geminiService.createLoreFromText;
export const generatePublicPost = geminiService.generatePublicPost;
export const generateVFSFile = geminiService.generateVFSFile;
export const generateFactionDetails = geminiService.generateFactionDetails;
export const generateInteractionMemory = geminiService.generateInteractionMemory;
export const generateInviteResponse = geminiService.generateInviteResponse;
export const generateCollaborationInviteMessage = geminiService.generateCollaborationInviteMessage;
export const generateCommsRoomStyle = geminiService.generateCommsRoomStyle;
export const createEgregoreFromConcept = geminiService.createEgregoreFromConcept;
export const analyzePostContent = geminiService.analyzePostContent;
export const generateFactionGoal = geminiService.generateFactionGoal;
export const generateFactionObject = geminiService.generateFactionObject;
export const generateFirstImpression = geminiService.generateFirstImpression;
export const parseUserTaskToGoal = geminiService.parseUserTaskToGoal;
export const getSocialImpact = geminiService.getSocialImpact;
export const getSocialImpactFromReaction = geminiService.getSocialImpactFromReaction;
export const getIntellectualResonance = geminiService.getIntellectualResonance;
export const generateJournalEntryWithTrace = geminiService.generateJournalEntryWithTrace;
export const generateSpectreLocusResponse = geminiService.generateSpectreLocusResponse;
export const runDnaDiagnostics = geminiService.runDnaDiagnostics;
export const mutateDnaCode = geminiService.mutateDnaCode;
export const evaluateDnaFitness = geminiService.evaluateDnaFitness;
export const researchTopic = geminiService.researchTopic;

// From Ollama Service (Subconscious Processor)
export const generateSubconsciousMusings = ollamaService.generateSubconsciousMusings;