import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ Import centralized config

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // ✅ Ensure API handlers are exported
export const config = { runtime: "nodejs" }; // ✅ Force Node.js runtime
