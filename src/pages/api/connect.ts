import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "ssh2";

interface response {
	error?: string;
	message?: string;
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<response>
) {
	if (req.method !== "POST")
		return res.status(405).json({ error: "method not allowed" });

	req.body = JSON.parse(req.body);

	if (
		!req.body.host ||
		!req.body.port ||
		!req.body.username ||
		!req.body.password ||
		!req.body.command
	)
		return res.status(400).json({ error: "missing parameters" });

	try {
		const client = new Client();
		client
			.on("ready", () => {
				client.shell(async (err, stream) => {
					if (err) return res.status(500).json({ error: err.message });

					stream.on("close", () => {
						client.end();
					});

					client.exec(req.body.command, (err, stream) => {
						if (err) throw err;
						stream.on("data", (data: string) => {
							res.status(200).json({ message: "" + data });
							client.end();
						});
					});
				});
			})
			.connect({
				host: req.body.host,
				port: +req.body.port,
				username: req.body.username,
				password: req.body.password,
			});
	} catch (error: any) {
		console.error(error);
		return res.status(500).json({ error: error.message });
	}
}
