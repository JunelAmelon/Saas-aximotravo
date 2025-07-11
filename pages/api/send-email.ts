import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, subject, html } = req.body;
  try {
    await sendEmail({ to, subject, html });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
