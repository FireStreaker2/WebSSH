import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { ReactTerminal } from "react-terminal";

const inter = Inter({ subsets: ["latin"] });

type Theme = "light" | "dark";
interface Config {
	host: string;
	port: string;
	username: string;
	password: string;
}

export default function Home() {
	const [theme, setTheme] = useState<Theme>("light");
	const [loggedIn, setLoggedIn] = useState(false);
	const [config, setConfig] = useState<Config>({
		host: "",
		port: "",
		username: "",
		password: "",
	});

	const handleInputChange = (key: keyof Config, value: string) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[key]: value,
		}));
	};

	useEffect(() => {
		setTheme(
			window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
		);
	}, []);

	return (
		<main className={`w-full h-screen ${inter.className}`}>
			{loggedIn ? (
				<ReactTerminal
					theme={theme}
					prompt="$"
					errorMessage={(command: string) =>
						`webssh: ${command}: command not found`
					}
					// TODO: add command logic (fetch /api/connect endpoint)
					defaultHandler={(command: string) => JSON.stringify(config)}
				/>
			) : (
				<form>
					<div className="flex flex-col">
						<h1>Server</h1>
						<input
							placeholder="host"
							className="text-black"
							onChange={(event) =>
								handleInputChange("host", event.target.value)
							}
						/>
						<input
							placeholder="port"
							className="text-black"
							onChange={(event) =>
								handleInputChange("port", event.target.value)
							}
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

					<button
						onClick={(event) => {
							event.preventDefault();

							// TODO: use something thats not an alert
							if (config.host === "" || config.username === "")
								return alert("missing parameters!");

							if (config.port === "") config.port = "22";

							// TODO: check if you can actually ssh in before rendering terminal
							setLoggedIn(true);
						}}
					>
						Login
					</button>
				</form>
			)}
		</main>
	);
}
