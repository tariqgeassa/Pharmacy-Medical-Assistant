import { GoogleGenAI, Type } from "@google/genai";
import { DrugInfo } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
  required: ["name", "originalFormula", "medicalFormula", "information", "sideEffects", "contraindications", "interactions", "mechanismOfAction", "usage", "ageGroup", "frequency", "precautions", "adultDosage", "childDosage", "form", "dosageTable"]
};

export async function searchDrugGemini(query: string, fdaContext?: any): Promise<DrugInfo | null> {
  try {
    const prompt = fdaContext 
      ? `Provide detailed medical information for the drug: ${query}. 
         Use this official FDA label data as the primary source: ${JSON.stringify(fdaContext)}.
         Format the output according to the schema provided.` 
      : `Provide detailed medical information for the drug: ${query}. Include its name, original formula, medical formula, comprehensive general info, common side effects, contraindications, drug interactions, mechanism of action, usage, recommended age range in years (yearly), frequency (OD, BD, etc.), precautions, adult dosage, child dosage, and its physical form.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${prompt}

CRITICAL: Also provide a detailed DOSAGE TABLE containing rows for different age groups (e.g., Infants, Children, Adults) and their specific doses for appropriate forms (Tablets, Capsules, Injections, Syrup, or Drops as applicable to this drug).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: DRUG_INFO_SCHEMA,
      },
    });

    const data = JSON.parse(response.text);
    data.imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(data.name)},pill/all`;
    return data;
  } catch (error) {
    console.error("Error searching drug in Gemini:", error);
    return null;
  }
}

export async function scanDrugImageGemini(base64Image: string): Promise<DrugInfo | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const data = JSON.parse(response.text);
    data.imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(data.name)},medicine/all`;
    return data;
  } catch (error) {
    console.error("Error scanning drug image in Gemini:", error);
    return null;
  }
}

export async function getSuggestionsGemini(input: string): Promise<string[]> {
  if (!input || input.length < 2) return [];
  
  try {
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error getting suggestions in Gemini:", error);
    return [];
  }
}
