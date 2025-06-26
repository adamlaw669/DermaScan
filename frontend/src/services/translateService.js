const AZURE_TRANSLATE_ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
const AZURE_REGION = "southafricanorth";
const AZURE_API_KEY = "949A64Elyu5uacVRbb0zSwvtAvf2gcLc2pAHlV1eV3sooJt4JKqbJQQJ99BFACrIdLPXJ3w3AAAbACOGQwEc";

export async function translateText(text, targetLang = "yo") {
  const response = await fetch(`${AZURE_TRANSLATE_ENDPOINT}&to=${targetLang}`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_API_KEY,
      "Ocp-Apim-Subscription-Region": AZURE_REGION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) throw new Error("Translation failed");

  const result = await response.json();
  return result[0].translations[0].text;
}
