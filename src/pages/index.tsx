import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

interface Config {
	host: string;
	port: string;
	username: string;
	password: string;
	command: string;
}

export default function Home() {
	const [result, setResult] = useState("");
	const [config, setConfig] = useState<Config>({
		host: "",
		port: "",
		username: "",
		password: "",
		command: "",
	});

	const handleInputChange = (key: keyof Config, value: string) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[key]: value,
		}));
	};

	const submit = async (event: { preventDefault: () => void }) => {
		event.preventDefault();

		if (config.host === "" || config.username === "" || config.command === "")
			return alert("missing parameters!");

		if (config.port === "") config.port = "22";

		const response = await fetch("/api/connect", {
			method: "POST",
			body: JSON.stringify(config),
		});

		if (!response.ok) return alert("an error occurred when fetching!");

		const data = await response.json();

		setResult(data?.message);
	};

	return (
		<main className={inter.className}>
			<form>
				<div className="flex flex-col">
					<h1>Server</h1>
					<input
						placeholder="host"
						className="text-black"
						onChange={(event) => handleInputChange("host", event.target.value)}
					/>
					<input
						placeholder="port"
						className="text-black"
						onChange={(event) => handleInputChange("port", event.target.value)}
					/>
				</div>
				<div className="flex flex-col">
					<h1>Credentials</h1>
					<input
						placeholder="username"
						className="text-black"
						onChange={(event) =>
							handleInputChange("username", event.target.value)
						}
					/>
					<input
						placeholder="password"
						type="password"
						className="text-black"
						onChange={(event) =>
							handleInputChange("password", event.target.value)
						}
					/>
				</div>
				<div>
					<h1>Command</h1>
					<input
						placeholder="command"
						className="text-black"
						onChange={(event) =>
							handleInputChange("command", event.target.value)
						}
					/>
				</div>

				<button onClick={submit}>Login</button>
			</form>

			<div>
				<p>{result}</p>
			</div>
		</main>
	);
}
