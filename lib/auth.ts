import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            superAdmin: true,
            college: true,
            hod: true,
            faculty: true,
            student: true,
          },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Check college status if the user is a COLLEGE
        if (user.role === "COLLEGE") {
          if (!user.college) {
            throw new Error("College details not found for this account.");
          }
          if (user.college.status === "PENDING") {
            throw new Error("Please wait for admin approval.");
          }
          if (user.college.status === "REJECTED") {
            throw new Error("Your account has been rejected by admin.");
          }
        }

        // Ensure a valid object is returned
        return {
         id: user.id.toString(),
  email: user.email,
  role: user.role,
  collegeType: user.college?.collegeType || null,
  departmentType: user.college?.departmentType || null,
  collegeId: user.college?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.collegeType = token.collegeType;
        session.user.departmentType = token.departmentType;
        session.user.collegeId = token.collegeId;
        session.user.departmentId = token.departmentId; // Ensure this is included if available
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeType = user.collegeType;
        token.departmentType = user.departmentType;
        token.collegeId = user.collegeId;
        token.departmentId = user.departmentId; // Ensure this is set if needed
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export default authOptions;