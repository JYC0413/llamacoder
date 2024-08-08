import { TogetherAIStream, TogetherAIStreamPayload } from "@/utils/TogetherAIStream";

export const maxDuration = 60;

export async function POST(req: Request) {
  let { messages, model, framework } = await req.json();
  const systemPrompt = `
You are an expert frontend ${framework} engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

- Create a ${framework} component for whatever the user asked you to create ${framework === "static" ? "" :"and make sure it can run by itself by using a default export"}
- Make sure the ${framework} app is interactive and functional by creating state when needed and having no required props
- Use ${framework === "static" ? " only html" : framework === "react" ? "TypeScript" : "JavaScript"} as the language for the ${framework} component
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
- Do not introduce other css or js or ts files, make sure you only rely on this one file to run.
- ${framework === "static" ? "Do not use any external libraries or frameworks (e.g., React, Vue, Angular).":'ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from \"recharts\"\` & \`<LineChart ...><XAxis dataKey=\"name\"> ...\`. Please only use this when needed.'}
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
- Please ONLY return the full ${framework} code starting with the imports, nothing else. It's very important for my job that you only return the ${framework} code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
`;
  console.log(systemPrompt);
  const payload: TogetherAIStreamPayload = {
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      ...messages.map((message: any) => {
        if (message.role === "user") {
          message.content +=
            "\nPlease ONLY return code, NO backticks or language names. Please do not import any other files.";
        }
        return message;
      })
    ],
    stream: true,
    temperature: 0
  };
  const stream = await TogetherAIStream(payload);

  return new Response(stream, {
    headers: new Headers({
      "Cache-Control": "no-cache"
    })
  });
}
