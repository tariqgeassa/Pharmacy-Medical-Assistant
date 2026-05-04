import { GoogleGenAI, Type } from "@google/genai";
import { DrugInfo } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in the environment. AI features will not work.");
}

const DRUG_INFO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The common name of the drug" },
    originalFormula: { type: Type.STRING, description: "The brand or original composition of the drug" },
    medicalFormula: { type: Type.STRING, description: "The scientific or chemical/medical formula of the drug (concise)" },
    information: { type: Type.STRING, description: "Detailed general information (bullet points, max 6 points)" },
    sideEffects: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Comprehensive list of common potential side effects (max 10 items)"
    },
    contraindications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of conditions where this drug should not be used"
    },
    interactions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Major drug-drug or drug-food interactions"
    },
    mechanismOfAction: { type: Type.STRING, description: "How the drug works in the body" },
    usage: { type: Type.STRING, description: "Brief description of how the drug is used" },
    ageGroup: { type: Type.STRING, description: "Recommended age range in years (e.g., '> 12 years', '0-5 years', 'Adults 18+')" },
    frequency: { type: Type.STRING, description: "Medication schedule (e.g., OD, BD, TDS)" },
    precautions: { type: Type.STRING, description: "Concise summary of key precautions" },
    adultDosage: { type: Type.STRING, description: "Specific dosage for adults (18+ years)" },
    childDosage: { type: Type.STRING, description: "Specific dosage for children, broken down by age years if possible (e.g., 2-5 yrs: 5ml, 6-12 yrs: 10ml)" },
    form: { type: Type.STRING, description: "The physical form of the medicine (e.g., Tablet, Capsule, Syrup, Injection, Cream)" },
    dosageTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ageGroup: { type: Type.STRING, description: "Age group range in years (e.g., 0-1 Yr, 2-5 Yrs, 18+ Yrs)" },
          dosage: { type: Type.STRING, description: "Recommended dose (e.g., 500mg, 5ml, 1 Drop)" },
          form: { type: Type.STRING, description: "Medication form (e.g., Tablet, Syrup, Injection, Drop, Capsule)" },
        },
        required: ["ageGroup", "dosage", "form"]
      },
      description: "A summary table of dosages for different ages and forms"
    },
  },
  // Reduce absolute requirements to make search more robust
  required: ["name", "originalFormula", "medicalFormula", "information", "usage", "dosageTable"]
};

export async function searchDrug(query: string): Promise<DrugInfo | null> {
  try {
    console.log("Searching for drug:", query);
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Provide detailed medical information for the drug: ${query}. 
Include its name, original formula (brand), medical formula (scientific), comprehensive general info, common side effects, contraindications, drug interactions, mechanism of action, usage, recommended age range, frequency, precautions, adult dosage, child dosage, and its physical form. 
Return the response in JSON format according to the schema.

CRITICAL: Also provide a detailed DOSAGE TABLE containing rows for different age groups and their specific doses.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: DRUG_INFO_SCHEMA,
      },
    });

    if (!response || !response.text) {
      console.error("Empty response from Gemini API");
      return null;
    }

    console.log("Response received from Gemini");
    const data = JSON.parse(response.text);
    data.imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(data.name || query)},pill/all`;
    return data as DrugInfo;
  } catch (error: any) {
    console.error("Error searching drug:", error);
    // Log more detail if available
    if (error.message) console.error("Error Message:", error.message);
    return null;
  }
}

export async function scanDrugImage(base64Image: string): Promise<DrugInfo | null> {
  try {
    console.log("Scanning drug image...");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: "Identify the medicine in this image and provide detailed medical information. Include name, original formula, medical formula, general info, side effects, contraindications, interactions, mechanism of action, usage, age range, frequency, precautions, adult/child dosage, form, and a detailed DOSAGE TABLE with age groups, doses, and forms.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: DRUG_INFO_SCHEMA,
      },
    });

    if (!response || !response.text) {
      console.error("Empty response from scanner Gemini API");
      return null;
    }

    const data = JSON.parse(response.text);
    data.imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(data.name || "medicine")},medicine/all`;
    return data as DrugInfo;
  } catch (error: any) {
    console.error("Error scanning drug image:", error);
    if (error.message) console.error("Error Message:", error.message);
    return null;
  }
}

export async function getSuggestions(input: string): Promise<string[]> {
  if (!input || input.length < 2) return [];
  
  try {
    console.log("Getting suggestions for:", input);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a list of 5 common medicine names that start with or are related to: "${input}". Return as a simple JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    if (!response || !response.text) return [];

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Error getting suggestions:", error);
    if (error.message) console.error("Suggestion Error Message:", error.message);
    return [];
  }
}
