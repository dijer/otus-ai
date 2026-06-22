import "dotenv/config";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";

import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";
import { apiTools } from "./tools/apiTools.js";

type Provider = "openai" | "anthropic" | "ollama";

function readCliInput(): string {
	return process.argv.slice(2).join(" ").trim();
}

function printUsage(): void {
	console.log("Usage: npm run dev -- \"<user request>\"");
	console.log("Example: npm run dev -- \"создай ответы для анкеты: имя Alex, возраст 25, любимый ai GPT\"");
}

function resolveProvider(): Provider {
	const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
	if (provider === "openai" || provider === "anthropic" || provider === "ollama") {
		return provider;
	}

	throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
}

function createModel() {
	const provider = resolveProvider();

	if (provider === "openai") {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new Error("OPENAI_API_KEY is missing. Set it in .env file.");
		}

		return new ChatOpenAI({
			apiKey,
			model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
			temperature: 0,
		});
	}

	if (provider === "anthropic") {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			throw new Error("ANTHROPIC_API_KEY is missing. Set it in .env file.");
		}

		return new ChatAnthropic({
			apiKey,
			model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
			temperature: 0,
		});
	}

	return new ChatOllama({
		baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
		model: process.env.OLLAMA_MODEL ?? "llama3.1",
		temperature: 0,
	});
}

async function run(): Promise<void> {
	const userInput = readCliInput();

	if (!userInput) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const llm = createModel();

	const prompt = ChatPromptTemplate.fromMessages([
		["system", SYSTEM_PROMPT],
		["human", "{input}"],
		["placeholder", "{agent_scratchpad}"],
	]);

	const agent = await createToolCallingAgent({
		llm,
		tools: apiTools,
		prompt,
	});

	const executor = new AgentExecutor({
		agent,
		tools: apiTools,
		verbose: false,
	});

	const result = await executor.invoke({ input: userInput });
	console.log(result.output);
}

run().catch((error) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Agent failed: ${message}`);
	process.exitCode = 1;
});
