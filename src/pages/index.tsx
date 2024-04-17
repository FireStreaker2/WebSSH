import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { ReactTerminal } from "react-terminal";
import { SpinningCircles } from "react-loading-icons";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

type Theme = "light" | "dark";
interface Config {
  host: string;
  port: string;
  username: string;
  password: string;
}

interface Data {
  error?: string;
  message?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [config, setConfig] = useState<Config>({
    host: "",
    port: "",
    username: "",
    password: "",
  });

  const handleInputChange = (key: keyof Config, value: string) => {
    setLoading(false);
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
        : "light",
    );
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Web interface for sshing" />
        <meta property="og:title" content="WebSSH" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="Web interface for sshing" />

        <title>WebSSH</title>
      </Head>
      <main className={`w-full h-screen ${inter.className}`}>
        {loggedIn ? (
          <ReactTerminal
            theme={theme}
            prompt={`[${config.username}@${config.host}]$`}
            welcomeMessage={`Welcome to WebSSH! You are logged in as: ${config.username}`}
            errorMessage={(command: string) =>
              `webssh: ${command}: command not found`
            }
            defaultHandler={async (command: string) => {
              const response = await fetch("/api/connect", {
                method: "POST",
                body: JSON.stringify({
                  ...config,
                  command,
                }),
              });

              if (!response.ok) return "an error occurred";

              const data: Data = await response.json();

              return data.error || data.message;
            }}
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <form className="border rounded-xl dark:border-white border-black flex justify-center items-center text-center flex-col gap-4 w-96">
              <h1 className="text-3xl m-5">WebSSH</h1>
              <div className="flex flex-col">
                <h1 className="text-xl">Server</h1>
                <input
                  placeholder="Host"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={(event) =>
                    handleInputChange("host", event.target.value)
                  }
                />
                <input
                  placeholder="Port"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={(event) =>
                    handleInputChange("port", event.target.value)
                  }
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl">Credentials</h1>
                <input
                  placeholder="Username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={(event) =>
                    handleInputChange("username", event.target.value)
                  }
                />
                <input
                  placeholder="Password"
                  type="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={(event) =>
                    handleInputChange("password", event.target.value)
                  }
                />
              </div>

              <div className="relative w-full h-5 flex justify-center items-center mt-3">
                {error && <p className="absolute text-red-500">{error}</p>}
                {loading && <SpinningCircles />}
              </div>

              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-4 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4"
                onClick={async (event) => {
                  event.preventDefault();

                  if (config.host === "" || config.username === "")
                    return setError("missing parameters!");

                  if (config.port === "") {
                    config.port = "22";
                    console.log("defaulting port to 22");
                  }

                  setLoading(true);
                  setError("");

                  const response = await fetch("/api/connect", {
                    method: "POST",
                    body: JSON.stringify({
                      ...config,
                      command: "ls",
                    }),
                  });

                  setLoading(false);

                  if (!response.ok) return setError("an http error occurred!");

                  const data: Data = await response.json();

                  if (data.error)
                    setError(
                      `an error occurred while logging in: ${data.error}`,
                    );
                  else setLoggedIn(true);
                }}
              >
                Login
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
