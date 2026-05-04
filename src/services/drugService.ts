import { DrugInfo } from "@/types";
import { searchDrugGemini, scanDrugImageGemini, getSuggestionsGemini } from "./geminiService";

export async function searchDrug(query: string): Promise<DrugInfo | null> {
  // 1. Try to get official data from OpenFDA via our proxy
  let fdaContext: any = null;
  try {
    const fdaResponse = await fetch(`/api/openfda?search=brand_name:"${encodeURIComponent(query)}"&limit=1`);
    const fdaData = await fdaResponse.json();

    if (fdaData.results && fdaData.results.length > 0) {
      fdaContext = fdaData.results[0];
      console.log("Found official FDA data for:", query);
    }
  } catch (error) {
    console.error("OpenFDA fetch failed or no result, falling back to pure Gemini:", error);
  }

  // 2. Call Gemini (frontend call) with optional fdaContext
  return await searchDrugGemini(query, fdaContext);
}

export async function scanDrugImage(base64Image: string): Promise<DrugInfo | null> {
  return await scanDrugImageGemini(base64Image);
}

export async function getSuggestions(input: string): Promise<string[]> {
  return await getSuggestionsGemini(input);
}
