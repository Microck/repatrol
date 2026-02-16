export interface IssueCreateRequest {
  repo: string;
  title: string;
  body: string;
  token: string;
}

export async function createIssue(request: IssueCreateRequest): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${request.repo}/issues`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/vnd.github+json",
      authorization: `Bearer ${request.token}`,
      "user-agent": "repatrol"
    },
    body: JSON.stringify({
      title: request.title,
      body: request.body
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`GitHub issue creation failed (${response.status}): ${payload}`);
  }

  const json = (await response.json()) as { html_url?: string };
  if (!json.html_url) {
    throw new Error("GitHub response missing issue URL");
  }
  return json.html_url;
}
