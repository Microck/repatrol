interface FoundryConfig {
  endpoint: string;
  deployment: string;
  apiVersion: string;
  apiKey: string;
}

function loadConfig(): FoundryConfig | null {
  const endpoint = process.env.FOUNDRY_ENDPOINT;
  const deployment = process.env.FOUNDRY_DEPLOYMENT;
  const apiVersion = process.env.FOUNDRY_API_VERSION;
  const apiKey = process.env.FOUNDRY_API_KEY;

  if (!endpoint || !deployment || !apiVersion || !apiKey) {
    return null;
  }

  return {
    endpoint,
    deployment,
    apiVersion,
    apiKey
  };
}

async function main(): Promise<number> {
  const config = loadConfig();
  if (!config) {
    console.log("SKIP: set FOUNDRY_ENDPOINT, FOUNDRY_DEPLOYMENT, FOUNDRY_API_VERSION, FOUNDRY_API_KEY to run Foundry smoke test");
    return 0;
  }

  const url = `${config.endpoint.replace(/\/$/, "")}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": config.apiKey
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Summarize how Repatrol works in one sentence."
        }
      ],
      temperature: 0.2,
      max_tokens: 120
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Foundry smoke failed (${response.status}): ${body}`);
    return 2;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim() || "<no-content>";
  console.log(`OK: ${text}`);
  return 0;
}

void main().then((code) => {
  process.exit(code);
});
